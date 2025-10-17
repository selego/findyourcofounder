const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();
const crypto = require("crypto");

const UserObject = require("../models/cofounder");

const config = require("../config");
const { validatePassword, uploadToS3FromBuffer } = require("../utils");
const { SENDINBLUE_TEMPLATES } = require("../utils/constants");
const { ERROR_CODES } = require("../utils/errorCodes");

const sendinblue = require("../services/brevo");
const { capture } = require("../services/sentry");

// 1 year
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 30; // 30 days (in ms)
const JWT_MAX_AGE = 60 * 60 * 24 * 30; // 30 days (in seconds)

const cookieOptions = () => {
  if (config.ENVIRONMENT === "development") {
    return { maxAge: COOKIE_MAX_AGE, httpOnly: true, secure: false };
  } else {
    return { maxAge: COOKIE_MAX_AGE, httpOnly: true, secure: true, domain: ".selego.co" };
  }
};

router.post("/signin", async (req, res) => {
  let { password, email } = req.body;
  email = (email || "").trim().toLowerCase();

  if (!email || !password) return res.status(400).send({ ok: false, code: ERROR_CODES.EMAIL_AND_PASSWORD_REQUIRED });

  try {
    const user = await UserObject.findOne({ email, deleted_at: { $exists: false } });
    if (!user) return res.status(401).send({ ok: false, code: ERROR_CODES.USER_NOT_EXISTS });

    const match = config.ENVIRONMENT === "development" || (await user.comparePassword(password));
    if (!match) return res.status(401).send({ ok: false, code: ERROR_CODES.EMAIL_OR_PASSWORD_INVALID });

    user.set({ last_login_at: Date.now() });
    await user.save();

    const token = jwt.sign({ _id: user.id }, config.SECRET, { expiresIn: JWT_MAX_AGE });
    res.cookie("jwt", token, cookieOptions());

    return res.status(200).send({ ok: true, token, user });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const obj = {};
    const { password, email, first_name, last_name, city, linkedin, motivations, business, partner, skills, invest } =
      req.body;
    if (req.headers["app-country"]) {
      obj.app_country = req.headers["app-country"];
    } else {
      return res.status(400).send({ ok: false, code: "app-country is required" });
    }
    obj.password = password;
    obj.email = email;
    obj.first_name = first_name;
    obj.last_name = last_name;
    obj.city = city;
    obj.linkedin = linkedin;
    obj.motivations = motivations;
    obj.business = business;
    obj.partner = partner;
    obj.skills = skills;
    obj.invest = invest;
    obj.slug = slugify(req.body);

    if (password && !validatePassword(password))
      return res.status(200).send({ ok: false, user: null, code: ERROR_CODES.PASSWORD_NOT_VALIDATED });

    const user = await UserObject.create({ ...obj });

    const token = jwt.sign({ _id: user._id }, config.SECRET, { expiresIn: JWT_MAX_AGE });
    res.cookie("jwt", token, cookieOptions());

    return res.status(200).send({ user, token, ok: true });
  } catch (error) {
    console.log("e", error);
    if (error.code === 11000) return res.status(409).send({ ok: false, code: ERROR_CODES.USER_ALREADY_REGISTERED });
    capture(error);
    return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR });
  }
});
router.post("/logout", async (req, res) => {
  try {
    res.clearCookie("jwt", cookieOptions());
    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, error });
  }
});

router.get("/signin_token", async (req, res) => {
  try {
    const { user } = req;
    user.set({ last_login_at: Date.now() });
    const u = await user.save();
    return res.status(200).send({ user, token: req.cookies.jwt, ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR });
  }
});

router.post("/forgot_password", async (req, res) => {
  try {
    const obj = await UserObject.findOne({ email: req.body.email.toLowerCase() });

    if (!obj) return res.status(401).send({ ok: false, code: ERROR_CODES.EMAIL_OR_PASSWORD_INVALID });

    const token = crypto.randomBytes(20).toString("hex");
    obj.set({ forgot_password_reset_token: token, forgot_password_reset_expires: Date.now() + 7200000 }); //2h
    await obj.save();

    const redirectUrl =
      process.env.NODE_ENV === "production" ? "https://www.findyourcofounder.com" : "http://localhost:3000";

    await sendinblue.sendTemplate(SENDINBLUE_TEMPLATES.FORGOT_PASSWORD, {
      emailTo: [{ email: obj.email }],
      params: { cta: `${redirectUrl}/reset-password?token=${token}` },
    });
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR });
  }
});

router.post("/forgot_password_reset", async (req, res) => {
  try {
    const obj = await UserObject.findOne({
      forgot_password_reset_token: req.body.token,
      forgot_password_reset_expires: { $gt: Date.now() },
    });

    if (!obj) return res.status(400).send({ ok: false, code: ERROR_CODES.PASSWORD_TOKEN_EXPIRED_OR_INVALID });

    if (!validatePassword(req.body.password))
      return res.status(400).send({ ok: false, code: ERROR_CODES.PASSWORD_NOT_VALIDATED });

    obj.password = req.body.password;
    obj.forgot_password_reset_token = "";
    obj.forgot_password_reset_expires = "";
    await obj.save();
    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR });
  }
});

router.post("/reset_password", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    const match = await req.user.comparePassword(req.body.password);
    if (!match) {
      return res.status(401).send({ ok: false, code: ERROR_CODES.PASSWORD_INVALID });
    }
    if (req.body.newPassword !== req.body.verifyPassword) {
      return res.status(422).send({ ok: false, code: ERROR_CODES.PASSWORDS_NOT_MATCH });
    }
    if (!validatePassword(req.body.newPassword)) {
      return res.status(400).send({ ok: false, code: ERROR_CODES.PASSWORD_NOT_VALIDATED });
    }
    const obj = await UserObject.findById(req.user._id);

    obj.set({ password: req.body.newPassword });
    await obj.save();
    return res.status(200).send({ ok: true, user: obj });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const data = await UserObject.findOne({ _id: req.params.id });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

router.get("/slug/:slug", async (req, res) => {
  try {
    const data = await UserObject.findOne({ slug: req.params.slug });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

router.post("/search", async (req, res) => {
  try {
    let query = {};

    query.approved = true;
    query.deleted_at = { $exists: false };

    if (req.body.search) {
      query.$or = [
        { slug: { $regex: req.body.search, $options: "i" } },
        { first_name: { $regex: req.body.search, $options: "i" } },
        { last_name: { $regex: req.body.search, $options: "i" } },
      ];
    }

    let sort = req.body.sort ? req.body.sort : "-last_login_at";

    const no_of_docs_each_page = req.body.per_page;
    const current_page_number = req.body.page - 1 || 0;
    let total = await UserObject.find(query).countDocuments();
    console.log("total", total);

    const users = await UserObject.find(query)
      .skip(no_of_docs_each_page * current_page_number)
      .limit(no_of_docs_each_page)
      .sort(sort);

    return res.status(200).send({ ok: true, data: { users, total } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const user = await UserObject.findById(req.params.id);
    const obj = req.body;

    user.set(obj);

    user.slug = slugify(user);

    await user.save();
    res.status(200).send({ ok: true, data: user });
  } catch (error) {
    console.log("error", error);
    capture(error);
    res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

router.post("/admin/search", passport.authenticate("admin", { session: false }), async (req, res) => {
  try {
    let query = {};

    let sort = req.body.sort ? req.body.sort : "-last_login_at";

    const no_of_docs_each_page = req.body.per_page || 100;
    const current_page_number = req.body.page - 1 || 0;
    let total = await UserObject.find(query).countDocuments();

    const users = await UserObject.find(query)
      .skip(no_of_docs_each_page * current_page_number)
      .limit(no_of_docs_each_page)
      .sort(sort);

    return res.status(200).send({ ok: true, data: { users, total } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await UserObject.findOneAndUpdate({ _id: req.params.id }, { deleted_at: Date.now() }, { new: true });
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

module.exports = router;

function slugify(user) {
  let linkedin = "";
  if (user.linkedin) linkedin = user.linkedin.split("?")[0].split("/in/")[1]?.replace("/", "");
  if (!linkedin)
    linkedin = `${user.first_name} ${user.last_name} ${user.city}`
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .toLocaleLowerCase();

  return linkedin;
}
