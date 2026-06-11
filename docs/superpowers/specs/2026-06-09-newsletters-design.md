# Weekly newsletters — design

**Date:** 2026-06-09
**Status:** Approved (pending review)

## Goal

Ship a weekly newsletter system serving two audiences from one piece of infrastructure:

1. **User digest** — personalized weekly email to every signed-in cofounder, showing founders that match their city plus a small generic "new this week" block. Drives re-engagement back to the app.
2. **Growth newsletter** — weekly email to a public subscriber list (captured via a footer form on the marketing site), showing platform highlights and a sign-up CTA.

Both are sent automatically by a weekly cron in the existing API process — no editorial work, no admin UI for composing copy. Content is generated from app data each cycle.

## Non-goals (v1)

- Editorial / manual newsletter composition (admin composer, CMS).
- In-app inbox for received newsletters.
- A/B testing or per-recipient subject-line variation.
- Engagement analytics in our own DB (Brevo's dashboard is the source of truth).
- Profile-settings UI toggle for the digest (the schema field is writable, but no UI ships in v1 — unsubscribe is via the email link).
- Double opt-in for the public list.
- Welcome / onboarding drip series. Different problem, different cadence.
- Multi-instance cron coordination. Single API process for now; if we scale out, we add a Mongo advisory lock then.

## Decisions (locked)

| Question | Choice |
|---|---|
| Audience | Both: signed-in users + public subscribers |
| Authoring | Fully automated from app data |
| Cadence | Weekly, Tuesday 09:00 Europe/Paris |
| User digest personalization | Per-user matches (city-based, complementary skills) + generic block |
| Prospect signup | Footer email-capture form on every page |
| User opt-in posture | Auto-enrolled with unsubscribe link in every email |
| Prospect opt-in posture | Single opt-in (no confirmation email) |
| Send mechanism | Brevo transactional templates, one send per recipient |
| Cron host | `node-cron` in the existing Express API process |

## User flows

### New prospect (not signed in)

1. Lands on any marketing page (`/`, `/concept`, etc.).
2. Scrolls to the footer, sees the subscribe form: email input + "Subscribe" button.
3. Submits. Form shows success state: "Thanks — first issue lands next Tuesday." No confirmation email.
4. On the next weekly cron run, receives `WEEKLY_GROWTH`. Each issue includes a unique unsubscribe link.

### Signed-in cofounder

1. Already enrolled by default (`digest_unsubscribed_at == null`).
2. Receives `WEEKLY_USER_DIGEST` each Tuesday with personalized matches + generic block.
3. To opt out: clicks the unsubscribe link in any received issue. Lands on a server-rendered confirmation page. Their `digest_unsubscribed_at` is stamped — they receive no further digests.
4. To resubscribe: profile-settings UI is not shipped in v1; for now resubscribe is a manual request to support. (Field is writable on `PUT /me` so a future toggle is a frontend-only task.)

### Recipient of either email

- `From:` the app sender (existing `SENDER_EMAIL` from `brevo.js`).
- `Reply-To:` the same sender — these are broadcast emails, not conversations. Replies to support, not "the platform".
- Unsubscribe link is a one-click HMAC-signed URL that flips the flag and shows confirmation HTML.

## Architecture overview

```
Tue 09:00 Europe/Paris
        │
        ▼
┌──────────────────────────┐
│ node-cron in api/src     │  weekly-digest.js
│ "0 9 * * 2" Europe/Paris │
└──────────┬───────────────┘
           │
           ├── Pass A: runUserDigest()
           │     ├── cursor over approved cofounders where digest_unsubscribed_at == null
           │     ├── for each: compute city-matches + generic block
           │     ├── brevo.sendTemplate(WEEKLY_USER_DIGEST, { params })
           │     └── stamp digest_last_sent_at on success
           │
           └── Pass B: runGrowthNewsletter()
                 ├── compute shared payload once (new founders, stats)
                 ├── cursor over newsletter_subscribers where unsubscribed_at == null
                 ├── for each: brevo.sendTemplate(WEEKLY_GROWTH, { params })
                 └── stamp last_sent_at on success
```

Two passes are independent; if Pass A throws, Pass B still attempts. Per-recipient errors are logged and counted, never thrown out of the loop.

## Data model

### New collection: `newsletter_subscriber`

```js
// api/src/models/newsletter-subscriber.js
const Schema = new mongoose.Schema({
  email:           { type: String, required: true, lowercase: true, trim: true },
  source:          { type: String, enum: ["footer"], default: "footer" },
  created_at:      { type: Date, default: Date.now },
  unsubscribed_at: { type: Date, default: null },
  last_sent_at:    { type: Date, default: null },
});

Schema.index({ email: 1 }, { unique: true });
Schema.index({ unsubscribed_at: 1 }); // for cron query
```

- `source` enum starts at `["footer"]` only; future entry points (`"hero_cta"`, etc.) extend the enum.
- Unsubscribed rows are kept; resubscribe clears `unsubscribed_at` rather than inserting a duplicate. Unique index on `email` enforces one row per address forever.
- `last_sent_at` is stamped after a successful Brevo call — useful when debugging "did this person get last week's send?".

### Modified collection: `cofounder`

Add two fields:

```js
digest_unsubscribed_at: { type: Date, default: null, index: true },
digest_last_sent_at:    { type: Date, default: null },
```

- No `digest_enabled` boolean — `digest_unsubscribed_at == null` *is* "enrolled". Single source of truth.
- Existing users get `null` (Mongoose default) → automatically enrolled, matching the auto-enroll decision. No migration script needed.
- The index on `digest_unsubscribed_at` speeds the cron's `find({ digest_unsubscribed_at: null, ... })` query.

### No send-log collection

Brevo's dashboard is the source of truth for delivery. We don't duplicate it in Mongo. If we later need our own audit log, we add it then.

## API

### `POST /newsletter/subscribe` — footer form submit

- **Auth:** none.
- **Body:** `{ email }`.
- **Flow:**
  1. Validate email with `validator.isEmail`.
  2. Lowercase + trim.
  3. `findOneAndUpdate({ email }, { $setOnInsert: { source: "footer", created_at: now }, $set: { unsubscribed_at: null } }, { upsert: true })`. Idempotent: new email inserts, existing reactivates, no race conditions.
  4. Return `{ ok: true }` regardless of whether the row was new or reactivated. **Do not leak whether the email already existed** — matches the anti-enumeration posture of `/forgot-password`.
- **No confirmation email in v1.** Single opt-in. The first weekly send is their welcome.

| HTTP | code | Meaning |
|---|---|---|
| 200 | — | Subscribed (new or reactivated) |
| 400 | `INVALID_EMAIL` | `isEmail` failed |
| 500 | `SERVER_ERROR` | catch-all |

### `GET /newsletter/unsubscribe?token=...` — one-click unsubscribe

- **Auth:** none — the token is the auth.
- **Token format:** `base64url(payload).base64url(hmac)` where:
  - `payload = JSON.stringify({ type, id })`.
  - `hmac = HMAC_SHA256(payload, NEWSLETTER_SECRET)`.
  - `type` is `"subscriber"` (id → `newsletter_subscriber._id`) or `"cofounder"` (id → `cofounder._id`).
- **Flow:**
  1. Decode and verify HMAC. Reject with 400 + simple "invalid link" HTML page on tamper.
  2. Look up the doc by id. If missing → 404 + "link expired" HTML page.
  3. Stamp the appropriate field (`unsubscribed_at` or `digest_unsubscribed_at`) with `now`. Idempotent.
  4. Return inline HTML confirmation page styled with the cream/ink palette: "You're unsubscribed. Visit the homepage."
- **Why server-rendered HTML, not a Next.js page:** emails get clicked from contexts where the SPA is slow to boot; users need immediate visible confirmation. Also keeps the unsubscribe path independent of frontend deploys.

| HTTP | code | Meaning |
|---|---|---|
| 200 | — | Unsubscribed (or already unsubscribed) |
| 400 | `INVALID_TOKEN` | HMAC fails or payload malformed |
| 404 | `RECIPIENT_NOT_FOUND` | doc deleted between issuance and click |

### `POST /newsletter/_run` — staging manual trigger

- **Auth:** header `x-admin-secret` matching `config.ADMIN_TRIGGER_SECRET`.
- **Body:** `{ pass?: "user" | "growth" }` (optional — defaults to both).
- **Returns:** `{ attempted, sent, skipped, failed }` for each pass.
- **Purpose:** dry-run the cron in staging without waiting for Tuesday. Brevo's existing `regexp_exception_staging` filter prevents real users from receiving the staging send.
- **Production:** the endpoint is registered but the cron is the normal trigger. Calling it manually in production should not be necessary; we keep it for emergency re-runs.

### Modifications to existing endpoints

- `PUT /cofounder/me` (profile self-edit): allow optional `digest_unsubscribed_at` in the update payload. Required so a future profile-settings toggle can flip the flag without a new endpoint. Whitelist the field explicitly; do not allow arbitrary field writes.

## Brevo integration

### Templates

Two new transactional templates, created manually in the Brevo dashboard, with IDs added to `BREVO_TEMPLATES` in `api/src/utils/constants.js`:

```js
WEEKLY_USER_DIGEST: <id-from-brevo>,
WEEKLY_GROWTH:      <id-from-brevo>,
```

### `WEEKLY_USER_DIGEST` template params

```js
{
  recipient_first_name: "Alice",
  matches: [                                 // up to 5
    { first_name, last_name, city, skills, profile_url },
    ...
  ],
  generic_recent: [                          // up to 3
    { first_name, last_name, city, skills, profile_url },
    ...
  ],
  has_matches: true,                         // Brevo template conditional
  has_generic: true,                         // Brevo template conditional
  unsubscribe_url: "https://findyourcofounder.io/api/newsletter/unsubscribe?token=...",
}
```

The `has_matches` / `has_generic` flags drive `{% if %}` blocks in the Brevo template so the email reads cleanly when one section is empty.

### `WEEKLY_GROWTH` template params

```js
{
  new_founders: [                            // up to 5
    { first_name, last_name, city, skills, profile_url },
    ...
  ],
  stats: {
    total_active_founders: 412,
    total_cities:          23,
    new_this_week:         17,
  },
  signup_url:      "https://findyourcofounder.io/signup",
  unsubscribe_url: "https://findyourcofounder.io/api/newsletter/unsubscribe?token=...",
}
```

### Service changes

`api/src/services/brevo.js` is **not** modified. `sendTemplate()` already supports `replyTo` (added in the intro flow PR) and that is sufficient here. The staging email filter (`regexp_exception_staging`) protects against accidental sends in staging.

## Cron job

### Registration

```js
// api/src/index.js
const cron = require("node-cron");
const { runWeeklyDigest } = require("./jobs/weekly-digest");

if (ENVIRONMENT === "production") {
  cron.schedule("0 9 * * 2", runWeeklyDigest, { timezone: "Europe/Paris" });
}
```

Production only. In staging, use `POST /newsletter/_run` for manual triggering.

### `runWeeklyDigest()`

```js
async function runWeeklyDigest() {
  console.log("[digest] starting weekly run", new Date().toISOString());
  try { await runUserDigest(); } catch (e) { console.error("[digest] user pass failed", e); }
  try { await runGrowthNewsletter(); } catch (e) { console.error("[digest] growth pass failed", e); }
  console.log("[digest] done");
}
```

Passes are isolated — one failing pass does not abort the other.

### `runUserDigest()`

1. **Preflight:** if `BREVO_KEY` or `NEWSLETTER_SECRET` is missing, log and return. No partial sends.
2. **Cursor:** `Cofounder.find({ digest_unsubscribed_at: null, deleted_at: null, approved: true }).cursor()` to avoid loading the whole collection into memory.
3. **Per cofounder:**
   - **Matches query (same-city, complementary skills):** `Cofounder.find({ _id: { $ne: self }, deleted_at: null, approved: true, city: self.city, skills: { $nin: self.skills } }).sort({ created_at: -1 }).limit(5)`. If `self.city` is missing/empty, fall back to skipping the matches block (set `has_matches: false`).
   - **Generic block:** `Cofounder.find({ _id: { $ne: self }, deleted_at: null, approved: true, created_at: { $gte: now - 7d } }).sort({ created_at: -1 }).limit(3)`.
   - **Skip if both empty** — no value in sending an empty digest.
   - Sign an unsubscribe token: `signToken({ type: "cofounder", id: self._id })`.
   - Build params, call `brevo.sendTemplate(WEEKLY_USER_DIGEST, { emailTo: [{ email: self.email, name: self.first_name }], params })`.
   - On success: `Cofounder.updateOne({ _id: self._id }, { digest_last_sent_at: now })`.
   - On Brevo failure: log + increment `failed` counter. Do not stamp `last_sent_at`. **Do not retry inside the run** — next week's send is the retry.
4. **Polite pacing:** `await sleep(100)` between sends. Brevo's transactional quota is generous, but a 100ms floor protects us from accidental bursts.
5. **Circuit breaker:** if 10 consecutive Brevo calls fail, abort the pass with a logged error. Prevents burning quota when Brevo is fully down.
6. **End of pass:** log `{ attempted, sent, skipped, failed }`.

### `runGrowthNewsletter()`

1. **Preflight:** same as Pass A.
2. **Shared payload, computed once:**
   - `new_founders`: `Cofounder.find({ deleted_at: null, approved: true, created_at: { $gte: now - 7d } }).sort({ created_at: -1 }).limit(5)`.
   - `stats`: aggregate counts — `total_active_founders` (`countDocuments({ deleted_at: null, approved: true })`), `total_cities` (`distinct("city")` length, ignoring empty), `new_this_week` (`countDocuments({ created_at: { $gte: now - 7d } })`).
3. **Cursor:** `NewsletterSubscriber.find({ unsubscribed_at: null }).cursor()`.
4. **Per subscriber:**
   - Sign an unsubscribe token: `signToken({ type: "subscriber", id: sub._id })`.
   - Build params (shared payload + per-recipient `unsubscribe_url`).
   - `brevo.sendTemplate(WEEKLY_GROWTH, { emailTo: [{ email: sub.email }], params })`.
   - Stamp `last_sent_at` on success.
5. Same pacing, circuit breaker, and end-of-pass log as Pass A.

## Token utility

```js
// api/src/utils/newsletter-token.js
const crypto = require("crypto");
const { NEWSLETTER_SECRET } = require("../config");

function b64url(buf) { return buf.toString("base64url"); }

function signToken({ type, id }) {
  const payload = JSON.stringify({ type, id: String(id) });
  const hmac = crypto.createHmac("sha256", NEWSLETTER_SECRET).update(payload).digest();
  return `${b64url(Buffer.from(payload))}.${b64url(hmac)}`;
}

function verifyToken(token) {
  const [payloadB64, hmacB64] = (token || "").split(".");
  if (!payloadB64 || !hmacB64) return null;
  const payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  const expected = crypto.createHmac("sha256", NEWSLETTER_SECRET).update(payload).digest();
  const got = Buffer.from(hmacB64, "base64url");
  if (got.length !== expected.length || !crypto.timingSafeEqual(got, expected)) return null;
  try { return JSON.parse(payload); } catch { return null; }
}

module.exports = { signToken, verifyToken };
```

Stateless (no DB token storage). Tokens do not expire by design — unsubscribe links from a 2-year-old email should still work.

## Frontend

### New: footer subscribe form

**File:** `app/src/components/newsletter-footer.jsx`.

- Compact form: email input + "Subscribe" button.
- States: `idle`, `submitting`, `success`, `error`.
- Success copy: "Thanks — first issue lands next Tuesday."
- Error copy: "Couldn't subscribe, try again."
- POSTs to `/newsletter/subscribe` via the existing `httpService`.
- Visual treatment follows `fyc-design` (cream/ink palette, brutalist shadow on the button). The skill rules apply at implementation time.

**Mount point:** in the global footer if one exists, otherwise in `app/src/app/layout.jsx` so it appears on every marketing page. Confirm location at implementation time by reading the layout file.

### Unsubscribe page

Server-rendered HTML straight from the Express API (no Next.js page). Inline `<style>` block matches the cream/ink palette so the page visually belongs to the app even when rendered from the API origin.

### Profile-settings toggle

**Out of scope for v1.** The `digest_unsubscribed_at` field is writable via `PUT /me` so a future frontend-only PR can add the toggle without touching the API.

## Error handling — full matrix

| Scenario | Response / behavior |
|---|---|
| `BREVO_KEY` or `NEWSLETTER_SECRET` missing at cron time | Log + return; no partial sends |
| Brevo errors for one recipient | Log + count; loop continues; `last_sent_at` not stamped |
| 10 consecutive Brevo failures | Abort the current pass with logged error |
| `POST /subscribe` with existing email | `200 { ok: true }`, row reactivated if it was unsubscribed |
| `POST /subscribe` with invalid email | `400 INVALID_EMAIL` |
| `POST /subscribe` race (two concurrent inserts) | Mongo unique index → one upsert wins, other reactivates; both return 200 |
| `GET /unsubscribe` with tampered token | `400` + "invalid link" HTML page |
| `GET /unsubscribe` with valid token, doc missing | `404` + "link expired" HTML page |
| `GET /unsubscribe` already-unsubscribed | Idempotent; show confirmation page anyway |
| Cron overlap (long-running previous pass) | Single-process API → cannot happen. Multi-instance future → add Mongo lock |
| Cofounder soft-deleted mid-run | Cursor already loaded the doc; Brevo send proceeds. Acceptable — they may receive one last digest |

## Testing

- **Unit:**
  - `newsletter-token.js`: sign/verify round-trip, tamper detection, malformed input.
  - `POST /subscribe` controller: email validation, lowercase/trim, idempotent reactivation.
  - Match-list computation in the cron job: same-city filter, complementary-skills filter (`$nin`), exclude self, fall back gracefully when self.city is empty, top-5 ordering by `created_at` desc.
- **Integration:**
  - `POST /subscribe` → row exists with correct fields → second call with same email keeps the same `_id` and reactivates.
  - `GET /unsubscribe` with a valid token flips the flag.
  - Cron pass (with mocked Brevo): cursor processes all eligible cofounders, calls `sendTemplate` with the expected shape, stamps `last_sent_at` only on success.
- **Manual (staging):**
  - `POST /newsletter/_run` with the admin secret; confirm Brevo's staging filter limits sends to `selego.co`.
  - Confirm both templates render correctly with real params from a real run.
  - Click unsubscribe from a received email; confirm the flag flips and the confirmation page renders.

## What you need to do manually

These steps live outside the repo and cannot be merged in a PR.

### Before the cron is enabled in production

1. **Generate `NEWSLETTER_SECRET`** — 32+ random bytes (`openssl rand -base64 48`). Set in:
   - Staging API environment.
   - Production API environment.
   - Do **not** reuse `JWT_SECRET` — separate purposes.
2. **Generate `ADMIN_TRIGGER_SECRET`** — same approach. Set in both environments. Used to gate `POST /newsletter/_run`.
3. **Create two Brevo transactional templates** in the Brevo dashboard:
   - `WEEKLY_USER_DIGEST` — design layout with sections for `matches`, `generic_recent`, and the `unsubscribe_url` footer. Use `{% if has_matches %}` / `{% if has_generic %}` conditionals.
   - `WEEKLY_GROWTH` — design layout with `new_founders`, `stats`, `signup_url` CTA, `unsubscribe_url` footer.
   - Test-send each template from Brevo to yourself with sample params before paste-IDs go to prod.
4. **Paste both template IDs** into `BREVO_TEMPLATES` in `api/src/utils/constants.js` and ship the change.
5. **Verify `APP_URL`** is set correctly in production (existing config — just confirm it's `https://findyourcofounder.io` or the correct prod domain). Unsubscribe links derive from this.
6. **Decide on a footer mount location** — confirm whether `app/src/app/layout.jsx` already has a shared footer component or if `<NewsletterFooter />` needs to be added directly into the root layout.

### Before the first real send

7. **Trigger `POST /newsletter/_run` in staging** with the admin secret. Confirm:
   - Brevo's staging filter limits sends to `selego.co` addresses.
   - Both templates render correctly with real data.
   - Clicking unsubscribe flips the flag and shows the confirmation page.
8. **Pick the launch Tuesday** — the cron starts firing the next Tuesday after the prod deploy. If that's bad timing (e.g., a holiday), defer the deploy or temporarily comment out the `cron.schedule(...)` line.

### Ongoing operations

9. **Monitor the first 2–3 sends** in Brevo dashboard for bounce / spam-complaint rate. If bounce > 5%, investigate before sending again.
10. **Support workflow for resubscribe requests** — until the profile-settings toggle ships, anyone wanting to resubscribe to the digest needs a manual `Cofounder.updateOne({...}, { digest_unsubscribed_at: null })` run from a maintenance script or DB tool.

## Out of scope — likely follow-ups

- Profile-settings toggle to enable/disable the digest (frontend-only; the API field is already writable).
- Welcome / onboarding drip series for newly signed-up cofounders.
- Per-user "best time to send" heuristics.
- In-app preview of the next issue.
- Engagement metrics in our own DB (currently only in Brevo's dashboard).
- A/B testing of subject lines.
- Secondary entry points for the public list (hero CTA, etc.) — the `source` enum is ready for expansion.
