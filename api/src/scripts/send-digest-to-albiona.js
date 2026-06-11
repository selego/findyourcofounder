require("dotenv").config();
require("../services/mongo");

const Cofounder = require("../models/cofounder");
const NewsletterSubscriber = require("../models/newsletter-subscriber");
const brevo = require("../services/brevo");
const { BREVO_TEMPLATES } = require("../utils/constants");
const { signToken } = require("../utils/newsletter-token");
const config = require("../config");

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const TARGET_EMAIL = "albiona@selego.co";

function appUrl() {
  return (config.APP_URL || "").replace(/\/$/, "");
}

function profileCard(c) {
  return {
    first_name: c.first_name || "",
    last_name: c.last_name || "",
    city: c.city || "",
    skills: (c.skills || []).join(", "),
    profile_url: `${appUrl()}/contact/${c.slug || c._id}`,
  };
}

function unsubscribeUrl(type, id) {
  return `${appUrl()}/newsletter/unsubscribe?token=${encodeURIComponent(signToken({ type, id }))}`;
}

(async () => {
  await new Promise((r) => setTimeout(r, 1500));

  // === WEEKLY_USER_DIGEST ===
  const self = await Cofounder.findOne({ email: TARGET_EMAIL });
  if (!self) {
    console.error("Target cofounder not found:", TARGET_EMAIL);
    process.exit(1);
  }

  const [matchesRaw, genericRaw] = await Promise.all([
    self.city
      ? Cofounder.find({
          _id: { $ne: self._id },
          deleted_at: null,
          approved: true,
          city: self.city,
          skills: { $nin: self.skills || [] },
        })
          .sort({ created_at: -1 })
          .limit(5)
      : Promise.resolve([]),
    Cofounder.find({
      _id: { $ne: self._id },
      deleted_at: null,
      approved: true,
      created_at: { $gte: new Date(Date.now() - SEVEN_DAYS_MS) },
    })
      .sort({ created_at: -1 })
      .limit(3),
  ]);

  const matches = matchesRaw.map(profileCard);
  const generic_recent = genericRaw.map(profileCard);

  const userParams = {
    recipient_first_name: self.first_name || "",
    city: self.city || "",
    matches,
    generic_recent,
    has_matches: matches.length > 0,
    has_generic: generic_recent.length > 0,
    unsubscribe_url: unsubscribeUrl("cofounder", self._id),
  };

  console.log("=== USER DIGEST → albiona@selego.co ===");
  console.log("matches:", matches.length, "generic_recent:", generic_recent.length);

  const userResult = await brevo.sendTemplate(BREVO_TEMPLATES.WEEKLY_USER_DIGEST, {
    emailTo: [{ email: self.email, name: self.first_name || "" }],
    params: userParams,
  });
  console.log("brevo user response:", userResult);

  // === WEEKLY_GROWTH ===
  const sub = await NewsletterSubscriber.findOne({ email: TARGET_EMAIL });
  if (!sub) {
    console.error("Target subscriber not found:", TARGET_EMAIL);
    process.exit(1);
  }

  const since = new Date(Date.now() - SEVEN_DAYS_MS);
  const [newFoundersRaw, totalActive, distinctCities, newThisWeek] = await Promise.all([
    Cofounder.find({ deleted_at: null, approved: true, created_at: { $gte: since } })
      .sort({ created_at: -1 })
      .limit(5),
    Cofounder.countDocuments({ deleted_at: null, approved: true }),
    Cofounder.distinct("city", { deleted_at: null, approved: true, city: { $nin: [null, ""] } }),
    Cofounder.countDocuments({ deleted_at: null, approved: true, created_at: { $gte: since } }),
  ]);

  const growthParams = {
    new_founders: newFoundersRaw.map(profileCard),
    stats: {
      total_active_founders: totalActive,
      total_cities: distinctCities.length,
      new_this_week: newThisWeek,
    },
    signup_url: `${appUrl()}/signup`,
    unsubscribe_url: unsubscribeUrl("subscriber", sub._id),
  };

  console.log("\n=== GROWTH → albiona@selego.co ===");
  console.log("new_founders:", growthParams.new_founders.length, "stats:", growthParams.stats);

  const growthResult = await brevo.sendTemplate(BREVO_TEMPLATES.WEEKLY_GROWTH, {
    emailTo: [{ email: sub.email }],
    params: growthParams,
  });
  console.log("brevo growth response:", growthResult);

  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
