# Weekly Newsletters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a weekly cron that sends a personalized digest to every signed-up cofounder and a generic growth newsletter to a public subscriber list, both via Brevo transactional templates with one-click unsubscribe.

**Architecture:** A single `node-cron` job in the existing Express API runs every Tuesday 09:00 Europe/Paris. Two passes: (A) per-cofounder personalized digest (city-match + complementary skills + generic block), (B) per-subscriber growth email (shared payload). Unsubscribe is a stateless HMAC-signed link to an inline-HTML endpoint. Footer form on the marketing site collects prospect emails.

**Tech Stack:** Express 4 + Mongoose 7 + `node-cron` (new dep) + existing `brevo.js` service / `sib-api-v3-sdk` Brevo transactional API; Next.js App Router for the footer form.

**Source spec:** `docs/superpowers/specs/2026-06-09-newsletters-design.md`

**No test framework in this repo.** The cofounder/api project has no Jest/Mocha. We verify each task via (a) `node -e` one-liners that import the module and call its function with mocks, and (b) `curl` smoke tests against the dev server. A `--dry-run` mode on the cron prints the payload it would have sent without calling Brevo, used in the staging trigger and during local verification.

---

## File map

### New files

- `api/src/models/newsletter-subscriber.js` — Mongoose model for the prospect list.
- `api/src/controllers/newsletter.js` — Express router: `POST /subscribe`, `GET /unsubscribe`, `POST /_run`.
- `api/src/jobs/weekly-digest.js` — `runWeeklyDigest`, `runUserDigest`, `runGrowthNewsletter` + per-pass helpers.
- `api/src/utils/newsletter-token.js` — `signToken({type, id})` / `verifyToken(token)` HMAC helpers.
- `api/src/scripts/run-digest-dry.js` — standalone Node script to dry-run the cron from the CLI.
- `app/src/app/components/newsletter-footer.jsx` — client-side subscribe form mounted inside `<Footer />`.

### Modified files

- `api/src/index.js` — register the cron + mount the `/newsletter` router.
- `api/src/config.js` — add `NEWSLETTER_SECRET`, `ADMIN_TRIGGER_SECRET`.
- `api/src/utils/constants.js` — add `WEEKLY_USER_DIGEST` and `WEEKLY_GROWTH` to `BREVO_TEMPLATES`.
- `api/src/utils/errorCodes.js` — add `INVALID_EMAIL`, `INVALID_TOKEN`, `RECIPIENT_NOT_FOUND`.
- `api/src/models/cofounder.js` — add `digest_unsubscribed_at` (indexed) and `digest_last_sent_at`.
- `api/package.json` — add `node-cron` dependency.
- `app/src/app/components/footer.jsx` — render `<NewsletterFooter />` in the brand column.

### Out of scope (do not touch)

- `api/src/services/brevo.js` — already supports `replyTo` and the staging filter.
- `PUT /cofounder/:id` — the spec marked profile-settings UI as out of scope; no API change needed.
- `app/src/app/layout.jsx` — `<Footer />` is already mounted globally.

---

## Task 1 — Add `node-cron` dependency

**Files:**
- Modify: `api/package.json`

- [ ] **Step 1: Install `node-cron`**

```bash
cd api && npm install node-cron@^3.0.3
```

- [ ] **Step 2: Verify installation**

```bash
node -e "console.log(require('node-cron').schedule)"
```

Expected: prints `[Function: schedule]`. If it errors with "Cannot find module", the install didn't land — re-run.

- [ ] **Step 3: Commit**

```bash
git add api/package.json api/package-lock.json
git commit -m "chore(api): add node-cron for weekly digest"
```

---

## Task 2 — Config additions

**Files:**
- Modify: `api/src/config.js`

- [ ] **Step 1: Add `NEWSLETTER_SECRET` and `ADMIN_TRIGGER_SECRET` to config**

Replace the `BREVO_KEY` block and the `CONFIG` object in `api/src/config.js`:

```js
const BREVO_KEY = process.env.BREVO_KEY || "";
const NEWSLETTER_SECRET = process.env.NEWSLETTER_SECRET || "";
const ADMIN_TRIGGER_SECRET = process.env.ADMIN_TRIGGER_SECRET || "";

const CONFIG = {
  ENVIRONMENT,
  PORT,
  MONGODB_ENDPOINT,
  SECRET,
  APP_URL,
  SENTRY_DSN,
  BREVO_KEY,
  NEWSLETTER_SECRET,
  ADMIN_TRIGGER_SECRET,
};
```

- [ ] **Step 2: Verify config loads**

```bash
cd api && node -e "console.log(Object.keys(require('./src/config')))"
```

Expected output includes `NEWSLETTER_SECRET` and `ADMIN_TRIGGER_SECRET`.

- [ ] **Step 3: Commit**

```bash
git add api/src/config.js
git commit -m "feat(api): add newsletter + admin trigger secrets to config"
```

---

## Task 3 — Constants & error codes

**Files:**
- Modify: `api/src/utils/constants.js`
- Modify: `api/src/utils/errorCodes.js`

- [ ] **Step 1: Add Brevo template IDs to `constants.js`**

Add the two new keys to `BREVO_TEMPLATES`. **You must paste the real IDs from Brevo manually** — leave the placeholder zero values for now so the file is syntactically valid; the manual step in the spec covers replacing them before launch.

```js
const BREVO_TEMPLATES = {
  SOURCING_APPLICANT_CREATED: 102,
  FORGOT_PASSWORD: 1,
  INTRO: 2,
  INVITE_CLIENT: 84,
  BUDGET_SIGNATURE_REQUEST: 88,
  BUDGET_SIGNATURE_CONFIRMATION: 89,
  AVAILABILITY_UPDATE: 92,
  REPORT_BACKLOG: 93,
  INVOICE_REMINDER: 95,
  TICKET_ASSIGNMENT_NOTIFICATION: 96,
  WEEKLY_USER_DIGEST: 0,
  WEEKLY_GROWTH: 0,
};
```

- [ ] **Step 2: Add error codes to `errorCodes.js`**

Append these three keys before the closing brace:

```js
  INVALID_EMAIL: "INVALID_EMAIL",
  INVALID_TOKEN: "INVALID_TOKEN",
  RECIPIENT_NOT_FOUND: "RECIPIENT_NOT_FOUND",
```

- [ ] **Step 3: Verify both files**

```bash
cd api && node -e "
const { BREVO_TEMPLATES } = require('./src/utils/constants');
const E = require('./src/utils/errorCodes');
console.log('templates ok:', 'WEEKLY_USER_DIGEST' in BREVO_TEMPLATES && 'WEEKLY_GROWTH' in BREVO_TEMPLATES);
console.log('errors ok:', E.INVALID_EMAIL === 'INVALID_EMAIL' && E.INVALID_TOKEN === 'INVALID_TOKEN' && E.RECIPIENT_NOT_FOUND === 'RECIPIENT_NOT_FOUND');
"
```

Expected: both lines print `true`.

- [ ] **Step 4: Commit**

```bash
git add api/src/utils/constants.js api/src/utils/errorCodes.js
git commit -m "feat(api): add weekly digest brevo templates + newsletter error codes"
```

---

## Task 4 — `newsletter_subscriber` model

**Files:**
- Create: `api/src/models/newsletter-subscriber.js`

- [ ] **Step 1: Write the model**

```js
const mongoose = require("mongoose");

const MODELNAME = "newsletter_subscriber";

const Schema = new mongoose.Schema({
  email:           { type: String, required: true, lowercase: true, trim: true },
  source:          { type: String, enum: ["footer"], default: "footer" },
  created_at:      { type: Date, default: Date.now },
  unsubscribed_at: { type: Date, default: null },
  last_sent_at:    { type: Date, default: null },
});

Schema.index({ email: 1 }, { unique: true });
Schema.index({ unsubscribed_at: 1 });

module.exports = mongoose.model(MODELNAME, Schema);
```

- [ ] **Step 2: Verify the model loads**

```bash
cd api && node -e "
const m = require('./src/models/newsletter-subscriber');
console.log('modelName:', m.modelName);
console.log('paths:', Object.keys(m.schema.paths));
"
```

Expected: `modelName: newsletter_subscriber` and `paths` array contains `email`, `source`, `created_at`, `unsubscribed_at`, `last_sent_at`, `_id`.

- [ ] **Step 3: Commit**

```bash
git add api/src/models/newsletter-subscriber.js
git commit -m "feat(api): add newsletter_subscriber model"
```

---

## Task 5 — Cofounder model fields

**Files:**
- Modify: `api/src/models/cofounder.js`

- [ ] **Step 1: Add the two fields to the Schema**

Insert these two lines into the `Schema` definition just before `deleted_at` so the diff is small:

```js
  digest_unsubscribed_at: { type: Date, default: null, index: true },
  digest_last_sent_at:    { type: Date, default: null },
```

- [ ] **Step 2: Verify the schema picks them up**

```bash
cd api && node -e "
const m = require('./src/models/cofounder');
console.log('has digest_unsubscribed_at:', 'digest_unsubscribed_at' in m.schema.paths);
console.log('has digest_last_sent_at:', 'digest_last_sent_at' in m.schema.paths);
"
```

Expected: both print `true`.

- [ ] **Step 3: Commit**

```bash
git add api/src/models/cofounder.js
git commit -m "feat(api): add digest opt-out + last-sent fields to cofounder"
```

---

## Task 6 — Token utility

**Files:**
- Create: `api/src/utils/newsletter-token.js`

- [ ] **Step 1: Write the module**

```js
const crypto = require("crypto");
const { NEWSLETTER_SECRET } = require("../config");

function b64url(buf) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str) {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function signToken({ type, id }) {
  if (!NEWSLETTER_SECRET) throw new Error("NEWSLETTER_SECRET is not set");
  const payload = JSON.stringify({ type, id: String(id) });
  const hmac = crypto.createHmac("sha256", NEWSLETTER_SECRET).update(payload).digest();
  return `${b64url(Buffer.from(payload))}.${b64url(hmac)}`;
}

function verifyToken(token) {
  if (!NEWSLETTER_SECRET) return null;
  const [payloadB64, hmacB64] = (token || "").split(".");
  if (!payloadB64 || !hmacB64) return null;

  let payload;
  try {
    payload = b64urlDecode(payloadB64).toString("utf8");
  } catch {
    return null;
  }

  const expected = crypto.createHmac("sha256", NEWSLETTER_SECRET).update(payload).digest();
  const got = b64urlDecode(hmacB64);
  if (got.length !== expected.length || !crypto.timingSafeEqual(got, expected)) return null;

  try {
    const obj = JSON.parse(payload);
    if (typeof obj !== "object" || obj === null) return null;
    if (obj.type !== "subscriber" && obj.type !== "cofounder") return null;
    if (typeof obj.id !== "string" || !obj.id) return null;
    return obj;
  } catch {
    return null;
  }
}

module.exports = { signToken, verifyToken };
```

- [ ] **Step 2: Verify round-trip + tamper detection**

```bash
cd api && NEWSLETTER_SECRET=dev-test-secret node -e "
const { signToken, verifyToken } = require('./src/utils/newsletter-token');
const t = signToken({ type: 'subscriber', id: '6810abc123def456789012ab' });
console.log('verified:', JSON.stringify(verifyToken(t)));
console.log('tampered:', verifyToken(t.slice(0, -3) + 'AAA'));
console.log('garbage:', verifyToken('not-a-token'));
console.log('bad type:', verifyToken(signToken({ type: 'subscriber', id: 'x' }).replace('subscriber', 'attacker')));
"
```

Expected output:
- `verified: {\"type\":\"subscriber\",\"id\":\"6810abc123def456789012ab\"}`
- `tampered: null`
- `garbage: null`
- `bad type: null`

- [ ] **Step 3: Commit**

```bash
git add api/src/utils/newsletter-token.js
git commit -m "feat(api): add HMAC-signed newsletter token helpers"
```

---

## Task 7 — Newsletter controller: subscribe endpoint

**Files:**
- Create: `api/src/controllers/newsletter.js`
- Modify: `api/src/index.js`

- [ ] **Step 1: Create the controller skeleton with `POST /subscribe`**

Create `api/src/controllers/newsletter.js`:

```js
const express = require("express");
const router = express.Router();

const NewsletterSubscriber = require("../models/newsletter-subscriber");
const ERROR_CODES = require("../utils/errorCodes");
const { capture } = require("../services/sentry");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

module.exports = router;
```

- [ ] **Step 2: Mount the router in `api/src/index.js`**

Add this line immediately after the existing `app.use("/cofounder", ...)` line:

```js
app.use("/newsletter", require("./controllers/newsletter"));
```

- [ ] **Step 3: Boot the dev server**

```bash
cd api && npm run dev
```

Wait for `App listening on port 8080`. Keep this terminal running.

- [ ] **Step 4: Smoke-test the endpoint**

In a separate terminal:

```bash
# Happy path — new email
curl -s -X POST http://localhost:8080/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test1@example.com"}'

# Idempotent — same email again
curl -s -X POST http://localhost:8080/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"TEST1@example.com"}'

# Invalid email
curl -s -X POST http://localhost:8080/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email"}'

# Missing email
curl -s -X POST http://localhost:8080/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected:
- First three calls without `INVALID_EMAIL`: `{"ok":true}`. **Wait** — first two should be `{"ok":true}`; third (`not-an-email`) should be `{"ok":false,"code":"INVALID_EMAIL"}`; fourth (missing) same.

- [ ] **Step 5: Verify only one row exists in Mongo for the duplicate**

```bash
cd api && node -e "
require('./src/services/mongo');
const M = require('./src/models/newsletter-subscriber');
M.find({ email: 'test1@example.com' }).then(rows => {
  console.log('row count:', rows.length);
  console.log('row:', JSON.stringify(rows[0], null, 2));
  process.exit(0);
});
"
```

Expected: `row count: 1`, `unsubscribed_at: null`, `source: "footer"`.

- [ ] **Step 6: Commit**

```bash
git add api/src/controllers/newsletter.js api/src/index.js
git commit -m "feat(api): add POST /newsletter/subscribe with idempotent upsert"
```

Stop the dev server with Ctrl+C before moving on (or leave it running — the next task adds a route to the same controller and `nodemon` will reload).

---

## Task 8 — Newsletter controller: unsubscribe endpoint

**Files:**
- Modify: `api/src/controllers/newsletter.js`

- [ ] **Step 1: Add the inline-HTML helper at the top of the file**

Insert immediately after the `EMAIL_RE` constant in `api/src/controllers/newsletter.js`:

```js
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
```

- [ ] **Step 2: Add the unsubscribe route**

Add this route immediately after the `POST /subscribe` handler (still inside the controller file):

```js
const { verifyToken } = require("../utils/newsletter-token");
const Cofounder = require("../models/cofounder");
const config = require("../config");

router.get("/unsubscribe", async (req, res) => {
  try {
    const decoded = verifyToken(req.query.token);
    if (!decoded) {
      const { status, html } = renderPage({
        status: 400,
        title: "Invalid unsubscribe link",
        message: "This link is invalid or has been tampered with. If you keep receiving emails, please reply to the last issue and we'll remove you manually.",
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
```

- [ ] **Step 3: Restart dev server and smoke-test**

Restart `npm run dev` (or save — nodemon reloads). Then in another terminal:

```bash
# Get the row ID from Task 7
cd api && node -e "
require('./src/services/mongo');
const M = require('./src/models/newsletter-subscriber');
M.findOne({ email: 'test1@example.com' }).then(r => { console.log(String(r._id)); process.exit(0); });
"
```

Copy the printed ID into the next command:

```bash
# Generate a valid token for it
cd api && NEWSLETTER_SECRET=dev-test-secret node -e "
const { signToken } = require('./src/utils/newsletter-token');
console.log(signToken({ type: 'subscriber', id: '<PASTE-ID>' }));
"
```

```bash
# Visit the link (substitute the token)
curl -s -i "http://localhost:8080/newsletter/unsubscribe?token=<PASTE-TOKEN>" | head -20

# Tampered token
curl -s -i "http://localhost:8080/newsletter/unsubscribe?token=abc.def" | head -5
```

Expected: first call returns 200 with HTML containing "You're unsubscribed"; second returns 400 with HTML containing "Invalid unsubscribe link".

- [ ] **Step 4: Verify the row's `unsubscribed_at` is now stamped**

```bash
cd api && node -e "
require('./src/services/mongo');
const M = require('./src/models/newsletter-subscriber');
M.findOne({ email: 'test1@example.com' }).then(r => { console.log('unsubscribed_at:', r.unsubscribed_at); process.exit(0); });
"
```

Expected: a real Date, not `null`.

- [ ] **Step 5: Re-subscribe via `POST /subscribe`, confirm `unsubscribed_at` clears**

```bash
curl -s -X POST http://localhost:8080/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test1@example.com"}'

cd api && node -e "
require('./src/services/mongo');
const M = require('./src/models/newsletter-subscriber');
M.findOne({ email: 'test1@example.com' }).then(r => { console.log('unsubscribed_at:', r.unsubscribed_at); process.exit(0); });
"
```

Expected: `unsubscribed_at: null`.

- [ ] **Step 6: Commit**

```bash
git add api/src/controllers/newsletter.js
git commit -m "feat(api): add GET /newsletter/unsubscribe with inline HTML confirmation"
```

---

## Task 9 — Digest job: shared helpers & user-digest pass

**Files:**
- Create: `api/src/jobs/weekly-digest.js`

- [ ] **Step 1: Write the helpers and `runUserDigest` (no Brevo call yet — dry-run only)**

Create `api/src/jobs/weekly-digest.js`:

```js
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

function profileCard(c) {
  return {
    first_name: c.first_name || "",
    last_name: c.last_name || "",
    city: c.city || "",
    skills: (c.skills || []).join(", "),
    profile_url: `${config.APP_URL.replace(/\/$/, "")}/contact/${c.slug || c._id}`,
  };
}

function unsubscribeUrl(type, id) {
  const token = signToken({ type, id });
  return `${config.APP_URL.replace(/\/$/, "")}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
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
      matches,
      generic_recent,
      has_matches: matches.length > 0,
      has_generic: generic_recent.length > 0,
      unsubscribe_url: unsubscribeUrl("cofounder", self._id),
    };

    if (dryRun) {
      console.log("[digest:user:dry]", self.email, JSON.stringify({ matches: matches.length, generic_recent: generic_recent.length }));
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

module.exports = { runUserDigest };
```

- [ ] **Step 2: Smoke-test the dry-run pass against the dev database**

The dev DB should already have at least one cofounder from prior development. If not, run `cd api && npm run dev` to start the API once, then sign up via the frontend (or insert a row manually). Then:

```bash
cd api && NEWSLETTER_SECRET=dev-test-secret node -e "
require('./src/services/mongo');
const { runUserDigest } = require('./src/jobs/weekly-digest');
runUserDigest({ dryRun: true }).then(s => { console.log('result:', s); process.exit(0); });
"
```

Expected output: one `[digest:user:dry] <email> {...}` line per eligible cofounder, then `result: { attempted: N, sent: N, skipped: 0..N, failed: 0 }`.

- [ ] **Step 3: Commit**

```bash
git add api/src/jobs/weekly-digest.js
git commit -m "feat(api): add runUserDigest with dry-run + circuit breaker"
```

---

## Task 10 — Digest job: growth-newsletter pass

**Files:**
- Modify: `api/src/jobs/weekly-digest.js`

- [ ] **Step 1: Add `runGrowthNewsletter` and a top-level `runWeeklyDigest`**

Append to `api/src/jobs/weekly-digest.js` (before `module.exports`):

```js
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
    signup_url: `${config.APP_URL.replace(/\/$/, "")}/signup`,
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
      console.log("[digest:growth:dry]", sub.email, JSON.stringify({ new_founders: shared.new_founders.length }));
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
```

Update the existing `module.exports` line at the bottom:

```js
module.exports = { runUserDigest, runGrowthNewsletter, runWeeklyDigest };
```

- [ ] **Step 2: Smoke-test the growth dry-run**

From earlier tasks, the `test1@example.com` subscriber should still be active (re-subscribed in Task 8 Step 5). Then:

```bash
cd api && NEWSLETTER_SECRET=dev-test-secret node -e "
require('./src/services/mongo');
const { runGrowthNewsletter } = require('./src/jobs/weekly-digest');
runGrowthNewsletter({ dryRun: true }).then(s => { console.log('result:', s); process.exit(0); });
"
```

Expected: one `[digest:growth:dry] test1@example.com {...}` line, then `result: { attempted: 1, sent: 1, skipped: 0, failed: 0 }`.

- [ ] **Step 3: Smoke-test the full `runWeeklyDigest` dry-run**

```bash
cd api && NEWSLETTER_SECRET=dev-test-secret node -e "
require('./src/services/mongo');
const { runWeeklyDigest } = require('./src/jobs/weekly-digest');
runWeeklyDigest({ dryRun: true }).then(r => { console.log('done'); process.exit(0); });
"
```

Expected: prints `[digest] starting weekly run`, both pass logs, `[digest] done`.

- [ ] **Step 4: Commit**

```bash
git add api/src/jobs/weekly-digest.js
git commit -m "feat(api): add runGrowthNewsletter + runWeeklyDigest wrapper"
```

---

## Task 11 — Standalone dry-run CLI script

**Files:**
- Create: `api/src/scripts/run-digest-dry.js`

- [ ] **Step 1: Write the script**

```js
require("dotenv").config();
require("../services/mongo");
const { runWeeklyDigest } = require("../jobs/weekly-digest");

(async () => {
  try {
    await runWeeklyDigest({ dryRun: true });
  } catch (e) {
    console.error("dry run threw:", e);
    process.exit(1);
  }
  process.exit(0);
})();
```

- [ ] **Step 2: Verify it runs**

```bash
cd api && NEWSLETTER_SECRET=dev-test-secret node src/scripts/run-digest-dry.js
```

Expected: prints the same dry-run output as Task 10 Step 3, then exits cleanly.

- [ ] **Step 3: Commit**

```bash
git add api/src/scripts/run-digest-dry.js
git commit -m "chore(api): add CLI dry-run script for weekly digest"
```

---

## Task 12 — Admin-trigger endpoint

**Files:**
- Modify: `api/src/controllers/newsletter.js`

- [ ] **Step 1: Add the route**

Append to `api/src/controllers/newsletter.js` (before `module.exports = router;`):

```js
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
```

- [ ] **Step 2: Smoke-test**

Restart the dev server (or save — nodemon reloads). Set the secret in `.env` (`ADMIN_TRIGGER_SECRET=dev-admin-secret`) and `NEWSLETTER_SECRET=dev-test-secret`, restart, then:

```bash
# Unauthorized
curl -s -X POST http://localhost:8080/newsletter/_run \
  -H "Content-Type: application/json" -d '{"dry_run": true}'

# Authorized dry-run
curl -s -X POST http://localhost:8080/newsletter/_run \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: dev-admin-secret" \
  -d '{"dry_run": true}'
```

Expected:
- First call: `{"ok":false,"code":"UNAUTHORIZED"}`.
- Second call: `{"ok":true,"dry_run":true,"result":{...}}` with `user` and `growth` blocks.

- [ ] **Step 3: Commit**

```bash
git add api/src/controllers/newsletter.js
git commit -m "feat(api): add POST /newsletter/_run admin trigger with dry-run support"
```

---

## Task 13 — Register the cron in production

**Files:**
- Modify: `api/src/index.js`

- [ ] **Step 1: Register `node-cron`**

In `api/src/index.js`, add the require near the top:

```js
const cron = require("node-cron");
```

And immediately after the existing `app.use("/cofounder", ...)` / `app.use("/newsletter", ...)` lines, before `setupErrorHandler(app)`:

```js
if (ENVIRONMENT === "production") {
  const { runWeeklyDigest } = require("./jobs/weekly-digest");
  cron.schedule(
    "0 9 * * 2",
    () => {
      runWeeklyDigest().catch((e) => console.error("[digest] cron run threw", e));
    },
    { timezone: "Europe/Paris" },
  );
  console.log("[digest] cron scheduled — Tuesdays 09:00 Europe/Paris");
}
```

- [ ] **Step 2: Verify the file boots in dev (no cron registration)**

```bash
cd api && npm run dev
```

Expected: starts cleanly, **does not** log `[digest] cron scheduled` (development env).

- [ ] **Step 3: Smoke-test the production path locally (without actually firing)**

```bash
cd api && ENVIRONMENT=production NEWSLETTER_SECRET=dev-test-secret node -e "
process.env.PORT = 8081;
require('./src/index');
setTimeout(() => process.exit(0), 1500);
"
```

Expected: logs `[digest] cron scheduled — Tuesdays 09:00 Europe/Paris`, then exits.

- [ ] **Step 4: Commit**

```bash
git add api/src/index.js
git commit -m "feat(api): register weekly digest cron in production"
```

---

## Task 14 — Footer subscribe component

**Files:**
- Create: `app/src/app/components/newsletter-footer.jsx`

- [ ] **Step 1: Write the component**

```jsx
"use client";

import { useState } from "react";
import { httpService } from "@/services/httpService";

export function NewsletterFooter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | submitting | success | error

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || state === "submitting") return;
    setState("submitting");
    try {
      const res = await httpService.post("/newsletter/subscribe", { email: email.trim() });
      if (res?.ok) {
        setState("success");
        setEmail("");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="mt-6 text-[13px] leading-relaxed text-primary-ink/70">
        Thanks — first issue lands next Tuesday.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-2 max-w-[320px]">
      <label htmlFor="newsletter-email" className="font-mono text-[11px] tracking-[0.18em] uppercase text-primary-ink/45">
        Weekly cofounder updates
      </label>
      <div className="flex gap-2">
        <input
          id="newsletter-email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-cream text-ink px-3 py-2 text-[13px] border-2 border-primary-ink/20 focus:outline-none focus:border-primary-ink"
        />
        <button
          type="submit"
          disabled={state === "submitting"}
          className="bg-accent text-ink font-display text-[13px] font-bold px-4 py-2 border-2 border-primary-ink shadow-[3px_3px_0_var(--color-primary-ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--color-primary-ink)] disabled:opacity-50"
        >
          {state === "submitting" ? "…" : "Subscribe"}
        </button>
      </div>
      {state === "error" && (
        <div className="text-[12px] text-red-300">Couldn't subscribe — try again.</div>
      )}
    </form>
  );
}
```

**Note on styling:** classnames follow the `fyc-design` cream/ink palette and brutalist shadow tokens used elsewhere in the codebase. If any token (e.g. `bg-accent`, `shadow-[3px_3px_0_var(--color-primary-ink)]`) does not exist in `tailwind.config.js`, adjust to the closest existing equivalent and re-check against the footer's own brand-column styles. Do **not** invent new tokens.

- [ ] **Step 2: Verify the component compiles (typecheck via Next.js)**

```bash
cd app && npm run dev
```

Open `http://localhost:3000` in a browser. Expect no compile errors in the terminal. The form is not mounted yet so you won't see it on the page.

- [ ] **Step 3: Commit**

```bash
git add app/src/app/components/newsletter-footer.jsx
git commit -m "feat(app): add NewsletterFooter subscribe form component"
```

---

## Task 15 — Mount the form in the footer

**Files:**
- Modify: `app/src/app/components/footer.jsx`

- [ ] **Step 1: Import and render the component**

In `app/src/app/components/footer.jsx`, add the import at the top:

```jsx
import { NewsletterFooter } from "./newsletter-footer";
```

Inside the brand column (the `<div>` that already contains the logo Link, tagline `<p>`), add the form **after** the existing tagline paragraph:

```jsx
<NewsletterFooter />
```

The brand column block should now end with:

```jsx
            <p className="mt-5 max-w-[300px] text-[13px] leading-relaxed text-primary-ink/60">
              A small Dutch index for founders looking for a cofounder. Built by
              founders, in Amsterdam, with care.
            </p>
            <NewsletterFooter />
          </div>
```

- [ ] **Step 2: Visual + functional smoke test in the browser**

With the dev server still running (`cd app && npm run dev`) **and** the API dev server running (`cd api && npm run dev`), open `http://localhost:3000` and scroll to the footer.

Verify:
- Form renders inside the brand column under the tagline.
- Typing an invalid email and clicking Subscribe surfaces the browser's native HTML5 validation (the `required` + `type="email"` attributes).
- Typing a valid email and clicking Subscribe → form swaps to "Thanks — first issue lands next Tuesday."
- Open DevTools Network tab and confirm the request goes to `POST /newsletter/subscribe` with status 200.

- [ ] **Step 3: Confirm the row exists in Mongo**

```bash
cd api && node -e "
require('./src/services/mongo');
const M = require('./src/models/newsletter-subscriber');
M.find({}).sort({ created_at: -1 }).limit(5).then(rows => { rows.forEach(r => console.log(r.email, r.created_at)); process.exit(0); });
"
```

Expected: the email you submitted from the browser is the most recent row.

- [ ] **Step 4: Commit**

```bash
git add app/src/app/components/footer.jsx
git commit -m "feat(app): mount NewsletterFooter inside the global footer"
```

---

## Task 16 — End-to-end staging dry-run rehearsal

**Files:** none modified — this task is a runbook.

- [ ] **Step 1: Pre-flight checklist**

Before the first real Tuesday cron in production, confirm each of the following manually:

```
[ ] NEWSLETTER_SECRET set in staging env (32+ random bytes)
[ ] NEWSLETTER_SECRET set in prod env (different value from staging)
[ ] ADMIN_TRIGGER_SECRET set in both envs
[ ] Brevo template WEEKLY_USER_DIGEST created, ID pasted into constants.js
[ ] Brevo template WEEKLY_GROWTH created, ID pasted into constants.js
[ ] APP_URL in prod config = https://findyourcofounder.nl/
```

- [ ] **Step 2: Trigger the staging dry-run via the admin endpoint**

```bash
curl -s -X POST https://<staging-api-host>/newsletter/_run \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: <STAGING_ADMIN_TRIGGER_SECRET>" \
  -d '{"dry_run": true}'
```

Expected: `{"ok":true,"dry_run":true,"result":{ "user": {...}, "growth": {...} }}` with non-zero `attempted` on both passes if staging has data.

- [ ] **Step 3: Trigger a *real* send in staging (limited to selego.co recipients by `brevo.js`)**

```bash
curl -s -X POST https://<staging-api-host>/newsletter/_run \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: <STAGING_ADMIN_TRIGGER_SECRET>" \
  -d '{"dry_run": false}'
```

- [ ] **Step 4: Verify real emails arrive**

In a selego.co inbox, confirm:
- `WEEKLY_USER_DIGEST` renders correctly (subject, matches, generic block, unsubscribe link).
- `WEEKLY_GROWTH` renders correctly (subject, new founders, stats, signup CTA, unsubscribe link).
- Click each unsubscribe link → confirmation page renders → re-check the corresponding doc in staging Mongo and confirm the unsubscribed flag flipped.

- [ ] **Step 5: Resubscribe the cofounder via direct DB update** (no UI ships in v1)

```bash
# Run against staging
cd api && node -e "
require('./src/services/mongo');
const C = require('./src/models/cofounder');
C.updateOne({ email: '<your-email@selego.co>' }, { digest_unsubscribed_at: null }).then(r => { console.log(r); process.exit(0); });
"
```

- [ ] **Step 6: Document the launch Tuesday**

In the team channel, post the date of the first production cron run (next Tuesday after the prod deploy completes) and a link to the spec. No code commit for this step.

---

## Self-review

Spec → plan coverage check:

- ✅ `newsletter_subscriber` model with unique email + indexes — Task 4
- ✅ `digest_unsubscribed_at` + `digest_last_sent_at` on cofounder — Task 5
- ✅ `POST /newsletter/subscribe` with idempotent upsert + anti-enumeration — Task 7
- ✅ `GET /newsletter/unsubscribe` with HMAC verify + inline HTML — Task 8
- ✅ `POST /newsletter/_run` gated by `x-admin-secret` — Task 12
- ✅ `runUserDigest` with same-city + complementary skills + generic block + skip-if-empty — Task 9
- ✅ `runGrowthNewsletter` with shared payload computed once — Task 10
- ✅ `runWeeklyDigest` wrapper with isolated try/catch per pass — Task 10
- ✅ Cron registered in production only, Tuesday 09:00 Europe/Paris — Task 13
- ✅ Token utility with HMAC + tamper detection — Task 6
- ✅ Brevo template IDs + new error codes — Task 3
- ✅ Footer subscribe form mounted in `<Footer />` — Tasks 14–15
- ✅ Dry-run mode for verification + standalone CLI script — Tasks 9–11
- ✅ End-to-end staging rehearsal runbook — Task 16

Out-of-scope items from spec, not implemented (correct):
- Profile-settings UI toggle for digest opt-out.
- Cleanup of vestigial `invites_sent` / `invites_accepted` fields.
- Engagement analytics in our own DB.
- Welcome / onboarding drip series.
