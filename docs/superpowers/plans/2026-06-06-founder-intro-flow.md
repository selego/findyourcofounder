# Founder intro flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a signed-in cofounder send a one-shot intro email to another cofounder from `/contact/[slug]`, via the existing "Send a coffee" section, with persistence and rate limits.

**Architecture:** New `intro` Mongo collection + `POST /intro` endpoint authenticated by a new "cofounder" passport strategy. The Brevo service is extended to forward a `replyTo` field. Existing cofounder GET endpoints are augmented with `already_contacted` / `contacted_at` / `intros_remaining_today` so the frontend has enough state in one request. Frontend rewires `CoffeeBlock`'s `handleSend` from the placeholder toast to the new endpoint, and renders four states (eligible / signed-out / already contacted / limit reached) inside the existing section.

**Tech Stack:** Node 18, Express 4, Mongoose 7, Passport (JWT), Brevo transactional API, Next.js 15 App Router, React 19.

**Spec:** `docs/superpowers/specs/2026-06-06-founder-intro-flow-design.md`

**Testing:** No automated test framework is currently set up in `api/`. This plan uses manual `curl` and browser verification at each milestone instead of unit tests. Adding Jest + supertest is a separate meta-task.

---

## File Structure

**Create:**
- `api/src/models/intro.js` — Mongoose model for `intro` documents.
- `api/src/controllers/intro.js` — `POST /intro` route.

**Modify:**
- `api/src/services/passport.js` — register a new `"cofounder"` strategy.
- `api/src/services/brevo.js` — forward `replyTo` through `sendTemplate`.
- `api/src/utils/constants.js` — add `BREVO_TEMPLATES.INTRO_REQUEST: 2`.
- `api/src/utils/errorCodes.js` — add 5 new error codes.
- `api/src/controllers/cofounder.js` — augment `GET /:id` and `GET /slug/:slug` with intro-related fields.
- `api/src/index.js` — mount the new `/intro` router.
- `app/src/app/contact/[slug]/profile-client.jsx` — rewire `CoffeeBlock.handleSend` to `POST /intro`, render the four states, accept new props.
- `app/src/app/contact/[slug]/page.jsx` — pass new props to `<CoffeeBlock />`, hide it on own profile.

---

## Task 1: Add cofounder passport strategy

**Files:**
- Modify: `api/src/services/passport.js`

Why first: every later task that touches `POST /intro` or signed-in cofounder data needs this. Today the cofounder controller uses `passport.authenticate("user")` which looks up the User collection — that does not authenticate cofounders. We add a separate strategy that resolves cofounder JWTs against the cofounder collection.

- [ ] **Step 1: Read the current file**

Open `api/src/services/passport.js`. Confirm only `"user"` and `"admin"` strategies are registered, both using `require("../models/user")`.

- [ ] **Step 2: Add the cofounder strategy**

Edit `api/src/services/passport.js`:

```javascript
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const { SECRET } = require("../config");
const Sentry = require("@sentry/node");
const User = require("../models/user");
const Cofounder = require("../models/cofounder");

function getToken(req) {
  let token = ExtractJwt.fromAuthHeaderWithScheme("JWT")(req);
  if (!token) token = req.cookies.jwt;
  return token;
}

module.exports = function (app) {
  const opts = {};
  opts.jwtFromRequest = getToken;
  opts.secretOrKey = SECRET;

  passport.use(
    "user",
    new JwtStrategy(opts, async function (jwtPayload, done) {
      try {
        const user = await User.findOne({ _id: jwtPayload._id });
        if (!user) return done(null, false);
        if (user.role !== "user") return done(null, false);
        Sentry.setUser({ id: user._id.toString(), username: user.first_name + user.last_name, email: user.email });
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }),
  );

  passport.use(
    "admin",
    new JwtStrategy(opts, async function (jwtPayload, done) {
      try {
        const user = await User.findOne({ _id: jwtPayload._id });
        if (!user) return done(null, false);
        if (user.role !== "admin") return done(null, false);
        Sentry.setUser({ id: user._id.toString(), username: user.first_name + user.last_name, email: user.email });
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }),
  );

  passport.use(
    "cofounder",
    new JwtStrategy(opts, async function (jwtPayload, done) {
      try {
        const cofounder = await Cofounder.findOne({ _id: jwtPayload._id, deleted_at: { $exists: false } });
        if (!cofounder) return done(null, false);
        Sentry.setUser({
          id: cofounder._id.toString(),
          username: (cofounder.first_name || "") + (cofounder.last_name || ""),
          email: cofounder.email,
        });
        return done(null, cofounder);
      } catch (error) {
        return done(error, false);
      }
    }),
  );

  app.use(passport.initialize());
};
```

- [ ] **Step 3: Verify by running the API**

Run from `api/`:
```bash
npm run dev
```
Expected: server boots without errors. Sentry/Mongo connect as usual.

- [ ] **Step 4: Commit**

```bash
git add api/src/services/passport.js
git commit -m "feat(api): add cofounder passport strategy"
```

---

## Task 2: Create the Intro Mongoose model

**Files:**
- Create: `api/src/models/intro.js`

- [ ] **Step 1: Create the file**

Create `api/src/models/intro.js`:

```javascript
const mongoose = require("mongoose");

const MODELNAME = "intro";

const Schema = new mongoose.Schema({
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: "cofounder", required: true, index: true },
  recipient_id: { type: mongoose.Schema.Types.ObjectId, ref: "cofounder", required: true, index: true },
  message: { type: String, required: true, trim: true, maxlength: 600 },
  created_at: { type: Date, default: Date.now },
});

Schema.index({ sender_id: 1, recipient_id: 1 }, { unique: true });

module.exports = mongoose.model(MODELNAME, Schema);
```

- [ ] **Step 2: Verify the index gets created**

Restart `npm run dev` in `api/`. On boot, Mongoose will auto-create the compound unique index on first write. To force-create it now, run this one-liner from `api/`:

```bash
node -e "require('dotenv').config(); const mongoose=require('mongoose'); mongoose.connect(process.env.MONGODB_ENDPOINT).then(async () => { const M = require('./src/models/intro'); await M.createIndexes(); console.log('indexes:', await M.collection.indexes()); process.exit(0); });"
```

Expected output includes an index entry like:
```
{ v: 2, key: { sender_id: 1, recipient_id: 1 }, name: 'sender_id_1_recipient_id_1', unique: true }
```

- [ ] **Step 3: Commit**

```bash
git add api/src/models/intro.js
git commit -m "feat(api): add intro model with unique pair index"
```

---

## Task 3: Add constants and error codes

**Files:**
- Modify: `api/src/utils/constants.js`
- Modify: `api/src/utils/errorCodes.js`

- [ ] **Step 1: Add the new template ID**

Edit `api/src/utils/constants.js`. The existing `BREVO_TEMPLATES` object needs one new key.

Replace:

```javascript
const BREVO_TEMPLATES = {
  SOURCING_APPLICANT_CREATED: 102,
  FORGOT_PASSWORD: 1,
  INVITE_CLIENT: 84,
  BUDGET_SIGNATURE_REQUEST: 88,
  BUDGET_SIGNATURE_CONFIRMATION: 89,
  AVAILABILITY_UPDATE: 92,
  REPORT_BACKLOG: 93,
  INVOICE_REMINDER: 95,
  TICKET_ASSIGNMENT_NOTIFICATION: 96,
};
```

with:

```javascript
const BREVO_TEMPLATES = {
  SOURCING_APPLICANT_CREATED: 102,
  FORGOT_PASSWORD: 1,
  INTRO_REQUEST: 2,
  INVITE_CLIENT: 84,
  BUDGET_SIGNATURE_REQUEST: 88,
  BUDGET_SIGNATURE_CONFIRMATION: 89,
  AVAILABILITY_UPDATE: 92,
  REPORT_BACKLOG: 93,
  INVOICE_REMINDER: 95,
  TICKET_ASSIGNMENT_NOTIFICATION: 96,
};
```

- [ ] **Step 2: Add the new error codes**

Edit `api/src/utils/errorCodes.js`. Replace the whole file with:

```javascript
module.exports = {
  EMAIL_AND_PASSWORD_REQUIRED: "EMAIL_AND_PASSWORD_REQUIRED",
  PASSWORDS_NOT_MATCH: "PASSWORDS_NOT_MATCH",
  SERVER_ERROR: "SERVER_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  USER_NOT_EXISTS: "USER_NOT_EXISTS",
  USER_ALREADY_REGISTERED: "USER_ALREADY_REGISTERED",
  NOT_FOUND: "NOT_FOUND",
  EMAIL_OR_PASSWORD_INVALID: "EMAIL_OR_PASSWORD_INVALID",
  PASSWORD_INVALID: "PASSWORD_INVALID",
  PASSWORD_NOT_VALIDATED: "PASSWORD_NOT_VALIDATED",
  PASSWORD_TOKEN_EXPIRED_OR_INVALID: "PASSWORD_TOKEN_EXPIRED_OR_INVALID",
  PASSWORDS_DO_NOT_MATCH: "PASSWORDS_DO_NOT_MATCH",
  INVALID_BODY: "INVALID_BODY",
  CARD_NOT_VALIDATED: "CARD_NOT_VALIDATED",
  INSUFFICIENT_FUNDS: "INSUFFICIENT_FUNDS",
  INVALID_PRICE: "INVALID_PRICE",
  ALREADY_PAID: "ALREADY_PAID",
  COFOUNDER_NOT_EXISTS: "COFOUNDER_NOT_EXISTS",
  INTRO_MESSAGE_TOO_SHORT: "INTRO_MESSAGE_TOO_SHORT",
  INTRO_MESSAGE_TOO_LONG: "INTRO_MESSAGE_TOO_LONG",
  INTRO_CANNOT_CONTACT_SELF: "INTRO_CANNOT_CONTACT_SELF",
  INTRO_ALREADY_SENT: "INTRO_ALREADY_SENT",
  INTRO_DAILY_LIMIT_REACHED: "INTRO_DAILY_LIMIT_REACHED",
};
```

- [ ] **Step 3: Commit**

```bash
git add api/src/utils/constants.js api/src/utils/errorCodes.js
git commit -m "feat(api): add intro template id and error codes"
```

---

## Task 4: Extend brevo.sendTemplate to forward replyTo

**Files:**
- Modify: `api/src/services/brevo.js` (the `sendTemplate` function around line 96)

- [ ] **Step 1: Update the function**

In `api/src/services/brevo.js`, find:

```javascript
async function sendTemplate(id, { params, emailTo, cc, bcc, attachment } = {}, { force } = { force: false }) {
  try {
    if (!id) throw new Error("No template id provided");

    const body = { templateId: parseInt(id) };
    if (!force && ENVIRONMENT !== "production") {
      console.log("emailTo before filter:", emailTo);
      emailTo = emailTo.filter((e) => e.email.match(regexp_exception_staging));
      if (cc?.length) cc = cc.filter((e) => e.email.match(regexp_exception_staging));
      if (bcc?.length) bcc = bcc.filter((e) => e.email.match(regexp_exception_staging));
    }
    if (emailTo) body.to = emailTo;
    if (cc?.length) body.cc = cc;
    if (bcc?.length) body.bcc = bcc;
    if (params) body.params = params;
    if (attachment) body.attachment = attachment;
```

Replace with:

```javascript
async function sendTemplate(id, { params, emailTo, cc, bcc, attachment, replyTo } = {}, { force } = { force: false }) {
  try {
    if (!id) throw new Error("No template id provided");

    const body = { templateId: parseInt(id) };
    if (!force && ENVIRONMENT !== "production") {
      console.log("emailTo before filter:", emailTo);
      emailTo = emailTo.filter((e) => e.email.match(regexp_exception_staging));
      if (cc?.length) cc = cc.filter((e) => e.email.match(regexp_exception_staging));
      if (bcc?.length) bcc = bcc.filter((e) => e.email.match(regexp_exception_staging));
    }
    if (emailTo) body.to = emailTo;
    if (cc?.length) body.cc = cc;
    if (bcc?.length) body.bcc = bcc;
    if (params) body.params = params;
    if (attachment) body.attachment = attachment;
    if (replyTo) body.replyTo = replyTo;
```

- [ ] **Step 2: Sanity-test with a quick standalone send**

From `api/`, run (replace `albiona@selego.co` with your test email if different):

```bash
node -e "require('dotenv').config(); const b=require('./src/services/brevo'); b.sendTemplate(1, { emailTo: [{email:'albiona@selego.co'}], params:{cta:'https://example.com/test'}, replyTo:{email:'reply-test@selego.co', name:'Reply Test'} }, { force: true }).then(r => { console.log('result:', r); process.exit(0); });"
```

Expected: prints a `messageId` in the result. Check the received email's headers — `Reply-To` should be `reply-test@selego.co`. If Brevo still returns "API Key is not enabled", that's the dashboard-side block from the earlier session; do not consider the code at fault.

- [ ] **Step 3: Commit**

```bash
git add api/src/services/brevo.js
git commit -m "feat(api): forward replyTo through brevo.sendTemplate"
```

---

## Task 5: Implement POST /intro controller

**Files:**
- Create: `api/src/controllers/intro.js`

- [ ] **Step 1: Create the controller**

Create `api/src/controllers/intro.js`:

```javascript
const express = require("express");
const passport = require("passport");
const router = express.Router();

const Cofounder = require("../models/cofounder");
const Intro = require("../models/intro");

const config = require("../config");
const brevo = require("../services/brevo");
const { capture } = require("../services/sentry");
const { BREVO_TEMPLATES } = require("../utils/constants");
const ERROR_CODES = require("../utils/errorCodes");

const MESSAGE_MIN = 30;
const MESSAGE_MAX = 600;
const DAILY_LIMIT = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

router.post("/", passport.authenticate("cofounder", { session: false }), async (req, res) => {
  try {
    const sender = req.user;
    const { recipient_id, message } = req.body || {};

    const trimmed = (message || "").trim();
    if (trimmed.length < MESSAGE_MIN) {
      return res.status(400).send({ ok: false, code: ERROR_CODES.INTRO_MESSAGE_TOO_SHORT });
    }
    if (trimmed.length > MESSAGE_MAX) {
      return res.status(400).send({ ok: false, code: ERROR_CODES.INTRO_MESSAGE_TOO_LONG });
    }

    if (!recipient_id || String(recipient_id) === String(sender._id)) {
      return res.status(400).send({ ok: false, code: ERROR_CODES.INTRO_CANNOT_CONTACT_SELF });
    }

    const recipient = await Cofounder.findOne({ _id: recipient_id, deleted_at: { $exists: false } });
    if (!recipient) {
      return res.status(404).send({ ok: false, code: ERROR_CODES.COFOUNDER_NOT_EXISTS });
    }

    const dailyCount = await Intro.countDocuments({
      sender_id: sender._id,
      created_at: { $gte: new Date(Date.now() - DAY_MS) },
    });
    if (dailyCount >= DAILY_LIMIT) {
      return res.status(429).send({ ok: false, code: ERROR_CODES.INTRO_DAILY_LIMIT_REACHED });
    }

    const existing = await Intro.findOne({ sender_id: sender._id, recipient_id: recipient._id });
    if (existing) {
      return res.status(409).send({ ok: false, code: ERROR_CODES.INTRO_ALREADY_SENT });
    }

    const senderName = [sender.first_name, sender.last_name].filter(Boolean).join(" ");

    const mail = await brevo.sendTemplate(BREVO_TEMPLATES.INTRO_REQUEST, {
      emailTo: [{ email: recipient.email, name: recipient.first_name || recipient.email }],
      params: {
        recipient_first_name: recipient.first_name || "",
        sender_name: senderName,
        sender_city: sender.city || "",
        sender_skills: (sender.skills || []).join(", "),
        sender_email: sender.email,
        sender_profile_url: `${config.APP_URL}/contact/${sender.slug}`,
        message: trimmed,
      },
      replyTo: { email: sender.email, name: senderName || sender.email },
    });

    if (!mail || mail.code) {
      return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR });
    }

    try {
      await Intro.create({
        sender_id: sender._id,
        recipient_id: recipient._id,
        message: trimmed,
      });
    } catch (e) {
      if (e && e.code === 11000) {
        return res.status(409).send({ ok: false, code: ERROR_CODES.INTRO_ALREADY_SENT });
      }
      throw e;
    }

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR });
  }
});

module.exports = router;
```

- [ ] **Step 2: Commit**

```bash
git add api/src/controllers/intro.js
git commit -m "feat(api): add POST /intro controller"
```

---

## Task 6: Mount the /intro router

**Files:**
- Modify: `api/src/index.js`

- [ ] **Step 1: Locate the route registrations**

In `api/src/index.js`, find the lines:

```javascript
app.use("/user", require("./controllers/user"));
app.use("/file", require("./controllers/file"));
app.use("/cofounder", require("./controllers/cofounder"));
```

- [ ] **Step 2: Add the new route**

Append:

```javascript
app.use("/intro", require("./controllers/intro"));
```

So the block reads:

```javascript
app.use("/user", require("./controllers/user"));
app.use("/file", require("./controllers/file"));
app.use("/cofounder", require("./controllers/cofounder"));
app.use("/intro", require("./controllers/intro"));
```

- [ ] **Step 3: Smoke-test the route boots**

Restart `npm run dev` in `api/`. From another terminal:

```bash
curl -i -X POST http://localhost:8080/intro -H 'Content-Type: application/json' -d '{}'
```

Expected status: `401 Unauthorized` (passport rejects — proves the route is mounted and auth runs).

- [ ] **Step 4: Commit**

```bash
git add api/src/index.js
git commit -m "feat(api): mount /intro router"
```

---

## Task 7: Augment cofounder GET responses

**Files:**
- Modify: `api/src/controllers/cofounder.js` (the `GET /:id` around line 190, `GET /slug/:slug` around line 200)

The two route handlers must return three new fields when the requester is a signed-in cofounder: `already_contacted`, `contacted_at`, `intros_remaining_today`. Auth here is opportunistic — we want to read `req.user` if a valid cookie is present but not 401 anonymous viewers.

- [ ] **Step 1: Add the import**

Near the top of `api/src/controllers/cofounder.js`, after the existing `const UserObject = require("../models/cofounder");` line, add:

```javascript
const Intro = require("../models/intro");
```

- [ ] **Step 2: Read the current GET handlers**

Open the file and locate:

```javascript
router.get("/:id", async (req, res) => {
  try {
    const obj = await UserObject.findById(req.params.id);
    if (!obj) return res.status(404).send({ ok: false, code: ERROR_CODES.USER_NOT_EXISTS });
    return res.status(200).send({ ok: true, data: obj });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

router.get("/slug/:slug", async (req, res) => {
  try {
    const obj = await UserObject.findOne({ slug: req.params.slug });
    if (!obj) return res.status(404).send({ ok: false, code: ERROR_CODES.USER_NOT_EXISTS });
    return res.status(200).send({ ok: true, data: obj });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});
```

- [ ] **Step 3: Add a shared helper for intro state**

Just above the `router.get("/:id", ...)` line, add a small helper that the two routes will reuse. The helper uses `passport.authenticate("cofounder")` in a non-blocking way: if a valid cookie is present, populate `req.user`; otherwise continue with `req.user` undefined.

```javascript
const DAY_MS = 24 * 60 * 60 * 1000;
const DAILY_LIMIT = 5;

async function attachIntroState(viewerId, target) {
  const data = target.toObject ? target.toObject() : { ...target };
  if (!viewerId) return data;
  if (String(viewerId) === String(target._id)) return data;
  const [existing, dailyCount] = await Promise.all([
    Intro.findOne({ sender_id: viewerId, recipient_id: target._id }),
    Intro.countDocuments({ sender_id: viewerId, created_at: { $gte: new Date(Date.now() - DAY_MS) } }),
  ]);
  data.already_contacted = !!existing;
  data.contacted_at = existing ? existing.created_at : null;
  data.intros_remaining_today = Math.max(0, DAILY_LIMIT - dailyCount);
  return data;
}

function optionalCofounderAuth(req, res, next) {
  passport.authenticate("cofounder", { session: false }, (err, user) => {
    if (user) req.user = user;
    return next();
  })(req, res, next);
}
```

- [ ] **Step 4: Replace both GET handlers**

Replace the two existing handlers with:

```javascript
router.get("/:id", optionalCofounderAuth, async (req, res) => {
  try {
    const obj = await UserObject.findById(req.params.id);
    if (!obj) return res.status(404).send({ ok: false, code: ERROR_CODES.USER_NOT_EXISTS });
    const data = await attachIntroState(req.user && req.user._id, obj);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

router.get("/slug/:slug", optionalCofounderAuth, async (req, res) => {
  try {
    const obj = await UserObject.findOne({ slug: req.params.slug });
    if (!obj) return res.status(404).send({ ok: false, code: ERROR_CODES.USER_NOT_EXISTS });
    const data = await attachIntroState(req.user && req.user._id, obj);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});
```

- [ ] **Step 5: Smoke-test both anonymous and signed-in shapes**

Restart `npm run dev`. Pick any cofounder slug from your DB (look in Mongo or hit `POST /cofounder/search`).

Anonymous (no cookie):
```bash
curl -s 'http://localhost:8080/cofounder/slug/<some-slug>' | jq '.data | {first_name, already_contacted, intros_remaining_today}'
```
Expected: `already_contacted` and `intros_remaining_today` are `null` (missing).

Signed-in: from a browser logged into the app, navigate to `/contact/<some-slug>` and inspect the Network tab response for `/cofounder/slug/<some-slug>`. Expected: response includes `already_contacted: false`, `contacted_at: null`, `intros_remaining_today: 5`.

- [ ] **Step 6: Commit**

```bash
git add api/src/controllers/cofounder.js
git commit -m "feat(api): include intro state in cofounder GET responses"
```

---

## Task 8: End-to-end manual test of the API (before touching frontend)

**Files:** none

This is a checkpoint: prove the backend works end-to-end before wiring the UI.

- [ ] **Step 1: Send a real intro via API**

From a browser already signed in as a cofounder (so the `jwt` cookie is set), open DevTools console on any FYC page and run:

```javascript
fetch("/api/intro", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({
    recipient_id: "<paste a different cofounder _id here>",
    message: "Hey — testing the new intro flow end to end. Looking forward to your response when this works.",
  }),
}).then((r) => r.json()).then(console.log);
```

(If your frontend hits the API on a different origin, replace `/api/intro` with the full backend URL, e.g. `http://localhost:8080/intro`, and ensure `credentials: "include"`.)

Expected: `{ ok: true }`, and the recipient (or `albiona@selego.co` in dev due to the staging filter) receives the templated email with the sender card and message. The email's `Reply-To` header is the sender's email.

- [ ] **Step 2: Confirm persistence**

```bash
node -e "require('dotenv').config(); const m=require('mongoose'); m.connect(process.env.MONGODB_ENDPOINT).then(async () => { const I=require('./src/models/intro'); console.log(await I.find({}).sort({created_at:-1}).limit(3).lean()); process.exit(0); });"
```
(Run from `api/`.) Expected: the latest doc shows `sender_id`, `recipient_id`, `message`, `created_at`.

- [ ] **Step 3: Confirm 409 on retry**

Re-run the fetch from Step 1 unchanged.
Expected: `{ ok: false, code: "INTRO_ALREADY_SENT" }`, HTTP 409.

- [ ] **Step 4: Confirm 400 on too-short message**

Re-run with `message: "too short"`.
Expected: `INTRO_MESSAGE_TOO_SHORT`.

- [ ] **Step 5: Confirm GET now reflects state**

In the browser, navigate to `/contact/<that-recipient-slug>` and inspect the cofounder GET response. Expected: `already_contacted: true`, `contacted_at` set, `intros_remaining_today: 4`.

If any of these fail, fix before moving on — the frontend depends on this shape.

---

## Task 9: Wire CoffeeBlock to POST /intro

**Files:**
- Modify: `app/src/app/contact/[slug]/profile-client.jsx`

- [ ] **Step 1: Replace CoffeeBlock**

Open `app/src/app/contact/[slug]/profile-client.jsx`. Replace the existing `MAX` constant and `CoffeeBlock` function (everything from `const MAX = 600;` through the closing `}` of `CoffeeBlock`) with:

```javascript
const MAX = 600;
const MIN = 30;

export function CoffeeBlock({
  name,
  intro,
  openers,
  recipientId,
  signedIn,
  alreadyContacted,
  contactedAt,
  introsRemainingToday,
}) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const dailyLimitReached = !sent && !alreadyContacted && signedIn && introsRemainingToday <= 0;
  const showAsContacted = sent || alreadyContacted;
  const contactedDate = sent ? new Date() : contactedAt ? new Date(contactedAt) : null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!signedIn) return;
    if (note.trim().length < MIN) {
      toast.error(`Add a bit more — at least ${MIN} characters.`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await httpService.post(`/intro`, { recipient_id: recipientId, message: note.trim() }, {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      });
      if (res?.ok) {
        toast.success("Email sent.");
        setSent(true);
        return;
      }
      const code = res?.code;
      if (code === "INTRO_ALREADY_SENT") {
        toast("You've already reached out to this founder.");
        setSent(true);
      } else if (code === "INTRO_DAILY_LIMIT_REACHED") {
        toast.error("Daily limit reached — try tomorrow.");
      } else if (code === "INTRO_MESSAGE_TOO_SHORT") {
        toast.error(`Add a bit more — at least ${MIN} characters.`);
      } else if (code === "INTRO_MESSAGE_TOO_LONG") {
        toast.error(`Trim it down — max ${MAX} characters.`);
      } else if (code === "COFOUNDER_NOT_EXISTS") {
        toast.error("This profile is no longer available.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-16 bg-ink rounded-[22px] border-[1.5px] border-ink shadow-card text-primary-ink p-8 lg:p-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left — copy + opener suggestions */}
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-accent mb-4">
            Reach out
          </div>
          <h2 className="font-display font-bold text-[40px] lg:text-[56px] leading-[1.02] tracking-[-0.035em] text-primary-ink m-0">
            Send {name} a{" "}
            <span className="font-serif italic font-normal text-accent">
              coffee
            </span>
            .
          </h2>
          <p className="mt-5 text-[14.5px] leading-relaxed text-primary-ink/70">
            {intro}
          </p>

          {openers?.length > 0 && !showAsContacted && signedIn && !dailyLimitReached && (
            <>
              <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-primary-ink/55 mt-8 mb-3">
                Try one of these openers
              </div>
              <ul className="flex flex-col gap-2">
                {openers.map((o, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => setNote(o)}
                      className="w-full text-left text-[13px] text-primary-ink/80 bg-primary-ink/5 hover:bg-primary-ink/10 border border-primary-ink/15 rounded-xl px-3.5 py-2.5 transition-colors"
                    >
                      {o}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Right — state-dependent form */}
        {showAsContacted ? (
          <div className="flex flex-col justify-center">
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-primary-ink/55 mb-3">
              Already reached out
            </div>
            <p className="text-[14.5px] text-primary-ink/80">
              You sent {name} a note
              {contactedDate ? ` on ${contactedDate.toLocaleDateString()}` : ""}. Watch your inbox for a reply.
            </p>
          </div>
        ) : !signedIn ? (
          <div className="flex flex-col justify-center">
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-primary-ink/55 mb-3">
              Sign in to reach out
            </div>
            <p className="text-[14.5px] text-primary-ink/80 mb-5">
              Only signed-in cofounders can send a note — it's a small filter that keeps the signal high on both sides.
            </p>
            <a
              href={`/signin?redirect=${encodeURIComponent(`/contact/${name ? "" : ""}`)}`}
              className="inline-flex w-fit items-center gap-2 px-5 py-3 rounded-full bg-accent-2 text-ink text-sm font-semibold hover:bg-accent-2/90 transition-colors"
            >
              Sign in <span className="font-serif italic">↗</span>
            </a>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex flex-col">
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-primary-ink/55 mb-3">
              Your note
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, MAX))}
              placeholder={`Hi ${name || "there"} — I read your profile and…`}
              rows={9}
              disabled={dailyLimitReached}
              className="w-full bg-primary-ink/5 text-primary-ink placeholder:text-primary-ink/35 border border-primary-ink/15 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-accent transition-colors resize-none flex-1 min-h-[220px] disabled:opacity-50"
            />
            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="font-mono text-[11px] tracking-[0.12em] text-primary-ink/45">
                {note.length} / {MAX}{dailyLimitReached ? " · daily limit reached" : ""}
              </span>
              <button
                type="submit"
                disabled={submitting || dailyLimitReached || note.trim().length < MIN}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-accent-2 text-ink text-sm font-semibold hover:bg-accent-2/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? "Sending…" : "Send the note"}{" "}
                <span className="font-serif italic">↗</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
```

Note: the `Sign in` link's `redirect` uses the `name` placeholder in the snippet because this component doesn't currently receive the slug. Task 10 passes a real `signinRedirect` prop and we plug it in there.

- [ ] **Step 2: Add `signinRedirect` prop**

Update the function signature at the top of `CoffeeBlock` to accept `signinRedirect` and replace the `<a href={...}>` href with `{signinRedirect}`. Final destructuring line:

```javascript
export function CoffeeBlock({
  name,
  intro,
  openers,
  recipientId,
  signedIn,
  alreadyContacted,
  contactedAt,
  introsRemainingToday,
  signinRedirect,
}) {
```

And the Sign in `<a>`:

```jsx
<a
  href={signinRedirect}
  className="inline-flex w-fit items-center gap-2 px-5 py-3 rounded-full bg-accent-2 text-ink text-sm font-semibold hover:bg-accent-2/90 transition-colors"
>
  Sign in <span className="font-serif italic">↗</span>
</a>
```

- [ ] **Step 3: Commit**

```bash
git add app/src/app/contact/[slug]/profile-client.jsx
git commit -m "feat(app): wire CoffeeBlock to POST /intro with state-driven UI"
```

---

## Task 10: Pass new props from the profile page

**Files:**
- Modify: `app/src/app/contact/[slug]/page.jsx` (the `<CoffeeBlock ... />` call around line 354)

- [ ] **Step 1: Determine viewer identity in the page**

The page is a Server Component. It already fetches the cofounder by slug. We need:
- `signedIn`: whether a cofounder cookie is present on the request.
- The cofounder GET response now returns `already_contacted`, `contacted_at`, `intros_remaining_today` when signed in.
- A `viewer_id` so we can hide the section on own profile. Easiest: derive from the augmented response — if the response includes the new fields, the viewer is signed in; if `intros_remaining_today` is absent the viewer is anonymous; for self, the backend currently omits the fields too. To make "own profile" detection robust, the backend already short-circuits in `attachIntroState` when `viewerId === target._id`. The page therefore needs to know whether viewer == target by another means — the cleanest is a tiny extra field.

Update the backend helper from Task 7 to also set `is_self` for the viewer's own profile:

In `api/src/controllers/cofounder.js`, in `attachIntroState`, change:

```javascript
if (!viewerId) return data;
if (String(viewerId) === String(target._id)) return data;
```

to:

```javascript
if (!viewerId) return data;
if (String(viewerId) === String(target._id)) {
  data.is_self = true;
  return data;
}
```

Commit this small backend addition first:

```bash
git add api/src/controllers/cofounder.js
git commit -m "feat(api): mark is_self on cofounder GET when viewer is target"
```

- [ ] **Step 2: Update the page to read and forward the new fields**

Open `app/src/app/contact/[slug]/page.jsx` and find:

```jsx
<CoffeeBlock
  name={data.first_name}
  intro="Free to send. We don't intermediate — your note lands in their inbox. Be specific about what caught their eye."
  openers={openers}
/>
```

Replace with:

```jsx
{!data.is_self && (
  <CoffeeBlock
    name={data.first_name}
    intro="Free to send. We don't intermediate — your note lands in their inbox. Be specific about what caught their eye."
    openers={openers}
    recipientId={data._id}
    signedIn={typeof data.intros_remaining_today === "number"}
    alreadyContacted={!!data.already_contacted}
    contactedAt={data.contacted_at ?? null}
    introsRemainingToday={data.intros_remaining_today ?? 0}
    signinRedirect={`/signin?redirect=${encodeURIComponent(`/contact/${data.slug}`)}`}
  />
)}
```

The `signedIn` derivation works because `attachIntroState` only adds `intros_remaining_today` when a viewer is signed in (and not viewing self).

- [ ] **Step 3: Commit**

```bash
git add app/src/app/contact/[slug]/page.jsx
git commit -m "feat(app): pass intro state into CoffeeBlock on profile page"
```

---

## Task 11: End-to-end browser verification

**Files:** none

Spin up the API and the app and walk through each visible state.

- [ ] **Step 1: Start both servers**

Terminal A:
```bash
cd api && npm run dev
```
Terminal B:
```bash
cd app && npm run dev
```

- [ ] **Step 2: Anonymous viewer**

Open an incognito window, go to `/contact/<some-slug>`. Expected: the "Send a coffee" section shows the "Sign in to reach out" CTA. Clicking it goes to `/signin?redirect=/contact/<some-slug>`.

- [ ] **Step 3: Signed-in eligible viewer**

Sign in as a cofounder, visit another cofounder's profile. Expected: the textarea, openers list, and "Send the note" button render. Counter under the textarea shows `0 / 600`.

- [ ] **Step 4: Send the note**

Type a 30+ character note. Click "Send the note". Expected: toast "Email sent.", the form swaps to the "Already reached out · {today's date}" state. Recipient inbox (or `albiona@selego.co` in dev) receives the Brevo template email.

- [ ] **Step 5: Reload the page**

Hard refresh `/contact/<that-slug>`. Expected: still shows "Already reached out" — proving the server-side state is correct, not just the client-side optimistic flag.

- [ ] **Step 6: Try too-short message**

Visit another cofounder's profile, type 10 characters. Expected: the Send button is disabled (the disabled state already triggers from `note.trim().length < MIN`). Force-submit via the form (e.g. Enter) → toast "Add a bit more — at least 30 characters."

- [ ] **Step 7: Hit the daily limit (optional)**

Send 5 intros to 5 different cofounders (use seeded test cofounders or create temporary ones). On the 6th profile, expected: the textarea is visible but disabled with "daily limit reached" under it; Send button disabled.

- [ ] **Step 8: Own profile**

Navigate to your own `/contact/<your-slug>`. Expected: the "Send a coffee" section is not rendered at all.

If all eight steps pass, ship it.

---

## Self-Review

**Spec coverage:**

- ✅ User flow (signed-in / signed-out / already contacted / limit / self) — Tasks 9, 10
- ✅ `intro` model with unique pair index — Task 2
- ✅ `POST /intro` with all five error codes — Task 5
- ✅ `GET /cofounder/:id` and `GET /cofounder/slug/:slug` augmented — Task 7
- ✅ `GET /intro/sent` intentionally absent — confirmed
- ✅ Brevo template `INTRO_REQUEST: 2` plumbed — Task 3
- ✅ `sendTemplate` accepts `replyTo` — Task 4
- ✅ Error matrix (Brevo fail, race, 429, etc.) — Task 5 + Task 9
- ✅ "Reach out" not added to search cards — confirmed not in any task
- ✅ Frontend reuses `CoffeeBlock`, no new modal — Task 9

**Placeholder scan:** No "TBD", "TODO", or hand-wave steps. Every code block is complete.

**Type/name consistency:** `recipient_id` (snake) used in API body and DB; `recipientId` (camel) used as the React prop. Same for `already_contacted` vs `alreadyContacted`, `contacted_at` vs `contactedAt`, `intros_remaining_today` vs `introsRemainingToday`. Conversion happens cleanly in Task 10 props. `BREVO_TEMPLATES.INTRO_REQUEST` referenced in Task 3 (declaration) and Task 5 (use).

**Scope:** One feature, ~30 minutes of focused work per task on average. Reasonable single plan.
