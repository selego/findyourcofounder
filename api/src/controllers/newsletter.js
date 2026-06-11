const express = require("express");
const router = express.Router();

const NewsletterSubscriber = require("../models/newsletter-subscriber");
const Cofounder = require("../models/cofounder");
const ERROR_CODES = require("../utils/errorCodes");
const { capture } = require("../services/sentry");
const { verifyToken } = require("../utils/newsletter-token");
const config = require("../config");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function renderPage({ status, title, message, link }) {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${title}</title>
<style>
  body { background: #f4f1ea; color: #1a1a1a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; margin: 0; padding: 80px 24px; }
  .card { max-width: 480px; margin: 0 auto; background: #fff; border: 2px solid #1a1a1a; box-shadow: 6px 6px 0 #1a1a1a; padding: 32px; }
  h1 { font-size: 22px; margin: 0 0 12px; }
  p { line-height: 1.5; margin: 0 0 16px; color: #444; }
  a { color: #1a1a1a; font-weight: 600; }
</style></head>
<body><div class="card"><h1>${title}</h1><p>${message}</p>${link ? `<p><a href="${link}">${link}</a></p>` : ""}</div></body></html>`;
  return { status, html };
}

router.post("/subscribe", async (req, res) => {
  try {
    const email = (req.body?.email || "").trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email) || email.length > 254) {
      return res.status(400).send({ ok: false, code: ERROR_CODES.INVALID_EMAIL });
    }

    await NewsletterSubscriber.findOneAndUpdate(
      { email },
      {
        $setOnInsert: { source: "footer", created_at: new Date() },
        $set: { unsubscribed_at: null },
      },
      { upsert: true, new: true },
    );

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR });
  }
});

router.get("/unsubscribe", async (req, res) => {
  try {
    const decoded = verifyToken(req.query.token);
    if (!decoded) {
      const { status, html } = renderPage({
        status: 400,
        title: "Invalid unsubscribe link",
        message:
          "This link is invalid or has been tampered with. If you keep receiving emails, please reply to the last issue and we'll remove you manually.",
      });
      return res.status(status).type("html").send(html);
    }

    if (decoded.type === "subscriber") {
      const sub = await NewsletterSubscriber.findById(decoded.id);
      if (!sub) {
        const { status, html } = renderPage({
          status: 404,
          title: "Link expired",
          message: "We couldn't find your subscription. It may have been removed already.",
        });
        return res.status(status).type("html").send(html);
      }
      if (!sub.unsubscribed_at) {
        sub.unsubscribed_at = new Date();
        await sub.save();
      }
    } else if (decoded.type === "cofounder") {
      const cof = await Cofounder.findById(decoded.id);
      if (!cof) {
        const { status, html } = renderPage({
          status: 404,
          title: "Link expired",
          message: "We couldn't find your profile. You may have been removed already.",
        });
        return res.status(status).type("html").send(html);
      }
      if (!cof.digest_unsubscribed_at) {
        cof.digest_unsubscribed_at = new Date();
        await cof.save();
      }
    }

    const { status, html } = renderPage({
      status: 200,
      title: "You're unsubscribed",
      message: "You won't receive the weekly newsletter anymore. Sorry to see you go.",
      link: config.APP_URL,
    });
    return res.status(status).type("html").send(html);
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR });
  }
});

const { runWeeklyDigest, runUserDigest, runGrowthNewsletter } = require("../jobs/weekly-digest");

router.post("/_run", async (req, res) => {
  try {
    const secret = req.headers["x-admin-secret"];
    if (!config.ADMIN_TRIGGER_SECRET || secret !== config.ADMIN_TRIGGER_SECRET) {
      return res.status(401).send({ ok: false, code: ERROR_CODES.UNAUTHORIZED });
    }

    const dryRun = req.body?.dry_run === true;
    const pass = req.body?.pass;

    let result;
    if (pass === "user") result = await runUserDigest({ dryRun });
    else if (pass === "growth") result = await runGrowthNewsletter({ dryRun });
    else result = await runWeeklyDigest({ dryRun });

    return res.status(200).send({ ok: true, dry_run: dryRun, result });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR });
  }
});

module.exports = router;
