const Cofounder = require("../models/cofounder");
const NewsletterSubscriber = require("../models/newsletter-subscriber");
const brevo = require("../services/brevo");
const { BREVO_TEMPLATES } = require("../utils/constants");
const { signToken } = require("../utils/newsletter-token");
const config = require("../config");

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const SLEEP_MS = 100;
const CIRCUIT_BREAKER_THRESHOLD = 10;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

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
  const token = signToken({ type, id });
  return `${appUrl()}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}

async function runUserDigest({ dryRun = false } = {}) {
  if (!config.BREVO_KEY && !dryRun) {
    console.log("[digest] user pass skipped — BREVO_KEY missing");
    return { attempted: 0, sent: 0, skipped: 0, failed: 0, aborted: "missing_brevo_key" };
  }
  if (!config.NEWSLETTER_SECRET) {
    console.log("[digest] user pass skipped — NEWSLETTER_SECRET missing");
    return { attempted: 0, sent: 0, skipped: 0, failed: 0, aborted: "missing_newsletter_secret" };
  }

  const stats = { attempted: 0, sent: 0, skipped: 0, failed: 0 };
  let consecutiveFailures = 0;
  const cursor = Cofounder.find({
    digest_unsubscribed_at: null,
    deleted_at: null,
    approved: true,
  }).cursor();

  for (let self = await cursor.next(); self != null; self = await cursor.next()) {
    stats.attempted++;

    const matchesQuery = self.city
      ? Cofounder.find({
          _id: { $ne: self._id },
          deleted_at: null,
          approved: true,
          city: self.city,
          skills: { $nin: self.skills || [] },
        })
          .sort({ created_at: -1 })
          .limit(5)
      : null;

    const genericQuery = Cofounder.find({
      _id: { $ne: self._id },
      deleted_at: null,
      approved: true,
      created_at: { $gte: new Date(Date.now() - SEVEN_DAYS_MS) },
    })
      .sort({ created_at: -1 })
      .limit(3);

    const [matchesRaw, genericRaw] = await Promise.all([
      matchesQuery ? matchesQuery : Promise.resolve([]),
      genericQuery,
    ]);

    const matches = matchesRaw.map(profileCard);
    const generic_recent = genericRaw.map(profileCard);

    if (matches.length === 0 && generic_recent.length === 0) {
      stats.skipped++;
      continue;
    }

    const params = {
      recipient_first_name: self.first_name || "",
      city: self.city || "",
      matches,
      generic_recent,
      has_matches: matches.length > 0,
      has_generic: generic_recent.length > 0,
      unsubscribe_url: unsubscribeUrl("cofounder", self._id),
    };

    if (dryRun) {
      console.log(
        "[digest:user:dry]",
        self.email,
        JSON.stringify({ matches: matches.length, generic_recent: generic_recent.length }),
      );
      stats.sent++;
      consecutiveFailures = 0;
      continue;
    }

    try {
      const result = await brevo.sendTemplate(BREVO_TEMPLATES.WEEKLY_USER_DIGEST, {
        emailTo: [{ email: self.email, name: self.first_name || "" }],
        params,
      });
      if (!result || result.code) {
        stats.failed++;
        consecutiveFailures++;
        console.log("[digest:user] send failed", self.email, result?.code);
      } else {
        stats.sent++;
        consecutiveFailures = 0;
        await Cofounder.updateOne({ _id: self._id }, { digest_last_sent_at: new Date() });
      }
    } catch (e) {
      stats.failed++;
      consecutiveFailures++;
      console.log("[digest:user] send threw", self.email, e.message);
    }

    if (consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD) {
      console.error("[digest:user] circuit breaker tripped after", consecutiveFailures, "consecutive failures");
      return { ...stats, aborted: "circuit_breaker" };
    }

    await sleep(SLEEP_MS);
  }

  console.log("[digest:user] done", stats);
  return stats;
}

async function computeGrowthPayload() {
  const since = new Date(Date.now() - SEVEN_DAYS_MS);

  const [newFoundersRaw, totalActive, distinctCities, newThisWeek] = await Promise.all([
    Cofounder.find({ deleted_at: null, approved: true, created_at: { $gte: since } })
      .sort({ created_at: -1 })
      .limit(5),
    Cofounder.countDocuments({ deleted_at: null, approved: true }),
    Cofounder.distinct("city", { deleted_at: null, approved: true, city: { $nin: [null, ""] } }),
    Cofounder.countDocuments({ deleted_at: null, approved: true, created_at: { $gte: since } }),
  ]);

  return {
    new_founders: newFoundersRaw.map(profileCard),
    stats: {
      total_active_founders: totalActive,
      total_cities: distinctCities.length,
      new_this_week: newThisWeek,
    },
    signup_url: `${appUrl()}/signup`,
  };
}

async function runGrowthNewsletter({ dryRun = false } = {}) {
  if (!config.BREVO_KEY && !dryRun) {
    console.log("[digest] growth pass skipped — BREVO_KEY missing");
    return { attempted: 0, sent: 0, skipped: 0, failed: 0, aborted: "missing_brevo_key" };
  }
  if (!config.NEWSLETTER_SECRET) {
    console.log("[digest] growth pass skipped — NEWSLETTER_SECRET missing");
    return { attempted: 0, sent: 0, skipped: 0, failed: 0, aborted: "missing_newsletter_secret" };
  }

  const shared = await computeGrowthPayload();
  const stats = { attempted: 0, sent: 0, skipped: 0, failed: 0 };
  let consecutiveFailures = 0;
  const cursor = NewsletterSubscriber.find({ unsubscribed_at: null }).cursor();

  for (let sub = await cursor.next(); sub != null; sub = await cursor.next()) {
    stats.attempted++;

    const params = {
      ...shared,
      unsubscribe_url: unsubscribeUrl("subscriber", sub._id),
    };

    if (dryRun) {
      console.log(
        "[digest:growth:dry]",
        sub.email,
        JSON.stringify({ new_founders: shared.new_founders.length }),
      );
      stats.sent++;
      consecutiveFailures = 0;
      continue;
    }

    try {
      const result = await brevo.sendTemplate(BREVO_TEMPLATES.WEEKLY_GROWTH, {
        emailTo: [{ email: sub.email }],
        params,
      });
      if (!result || result.code) {
        stats.failed++;
        consecutiveFailures++;
        console.log("[digest:growth] send failed", sub.email, result?.code);
      } else {
        stats.sent++;
        consecutiveFailures = 0;
        await NewsletterSubscriber.updateOne({ _id: sub._id }, { last_sent_at: new Date() });
      }
    } catch (e) {
      stats.failed++;
      consecutiveFailures++;
      console.log("[digest:growth] send threw", sub.email, e.message);
    }

    if (consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD) {
      console.error("[digest:growth] circuit breaker tripped after", consecutiveFailures, "consecutive failures");
      return { ...stats, aborted: "circuit_breaker" };
    }

    await sleep(SLEEP_MS);
  }

  console.log("[digest:growth] done", stats);
  return stats;
}

async function runWeeklyDigest(opts = {}) {
  console.log("[digest] starting weekly run", new Date().toISOString(), opts);
  const result = { user: null, growth: null };
  try {
    result.user = await runUserDigest(opts);
  } catch (e) {
    console.error("[digest] user pass threw", e);
    result.user = { aborted: "exception", error: e.message };
  }
  try {
    result.growth = await runGrowthNewsletter(opts);
  } catch (e) {
    console.error("[digest] growth pass threw", e);
    result.growth = { aborted: "exception", error: e.message };
  }
  console.log("[digest] done", result);
  return result;
}

module.exports = { runUserDigest, runGrowthNewsletter, runWeeklyDigest };
