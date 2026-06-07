# Founder intro flow — design

**Date:** 2026-06-06
**Status:** Approved (pending review)

## Goal

Let a signed-in cofounder send a one-shot intro email to another cofounder from their public profile page (`/contact/[slug]`), via a Brevo transactional template. The recipient replies directly to the sender's real email — no in-app messaging, no acceptance step. Each intro is persisted to support rate limits, deduplication, and a clear "already reached out" UX.

## Non-goals (v1)

- In-app DMs, inboxes, threads, read receipts.
- Two-sided accept/decline flow.
- Recipient opt-out, mute, or block lists.
- Public/anonymous contact form (signed-in only).
- Recipient-side dashboard of received intros.
- Inbound email proxying (replies go straight to the sender's real email).

## User flow

### Sender (signed-in cofounder)

1. Lands on `/contact/[slug]` of another founder.
2. The existing "Send a coffee" section (`CoffeeBlock` in `profile-client.jsx`) renders one of these states based on data already on the cofounder GET response:
   - Not signed in → the textarea is replaced with a "Sign in to reach out" CTA → `/signin?redirect=/contact/[slug]`.
   - Already contacted → textarea + button replaced with "Already reached out · {date}".
   - Daily limit reached → textarea visible but Send button disabled with helper text "Daily limit reached — try tomorrow".
   - Viewing own profile → whole section hidden.
   - Eligible → the existing textarea + openers + "Send the note" button.
3. On submit, the existing `handleSend` calls `POST /intro` with `{ recipient_id, message }` instead of the placeholder toast.
4. On success, the form swaps to the "Already reached out · today" state and a success toast confirms.

### Recipient

1. Receives an email rendered from Brevo template `#2 — Intro Request`.
2. Email shows sender's profile preview (name, city, skills, link to their profile) + the sender's message.
3. `Reply-To` is the sender's real email address. Recipient hits Reply in their mail client; conversation continues off-platform.

## Decisions (locked)

| Question | Choice |
|---|---|
| Mechanism | Email intro via Brevo transactional template |
| Who can send | Only signed-in cofounders |
| Persistence | Persisted as `intro` records |
| Per-pair limit | 1 ever (unique compound index) |
| Per-sender daily limit | 5 in last 24h |
| Recipient controls | None — publishing a profile = open to intros |
| Email content | Sender profile preview |
| Reply mechanism | `Reply-To` = sender's real email |
| Entry points | `/contact/[slug]` only (not search cards) |

## Data model

New collection: `intro`.

```js
// api/src/models/intro.js
const Schema = new mongoose.Schema({
  sender_id:    { type: ObjectId, ref: "cofounder", required: true, index: true },
  recipient_id: { type: ObjectId, ref: "cofounder", required: true, index: true },
  message:      { type: String, required: true, trim: true, maxlength: 600 },
  created_at:   { type: Date, default: Date.now },
});

// "1 per pair ever" enforced at DB level
Schema.index({ sender_id: 1, recipient_id: 1 }, { unique: true });
```

No `status`, `read_at`, or `replied_at` fields in v1. The existing `invites_sent` / `invites_accepted` counters on `cofounder` are vestigial and are not touched by this flow.

## API

### `POST /intro` — send an intro

- **Auth:** cofounder (passport).
- **Body:** `{ recipient_id, message }`.
- **Flow:**
  1. Validate `message.trim().length` is between 30 and 600 (matches the existing `CoffeeBlock` `MAX` constant).
  2. Reject if `recipient_id === req.user._id`.
  3. Load recipient; reject if missing or `deleted_at != null`.
  4. Count sender's intros in the last 24h; reject if ≥ 5.
  5. Check pair uniqueness with `findOne({sender_id, recipient_id})`; reject if exists.
  6. Send the Brevo template (see below). Throw on failure — no DB row written if send fails.
  7. Insert the `intro` doc. Catch `E11000` (race) and convert to 409.
  8. Return `{ ok: true }`.

| HTTP | code | Meaning |
|---|---|---|
| 400 | `INTRO_MESSAGE_TOO_SHORT` | < 30 chars after trim |
| 400 | `INTRO_MESSAGE_TOO_LONG` | > 600 chars |
| 400 | `INTRO_CANNOT_CONTACT_SELF` | recipient_id is self |
| 404 | `COFOUNDER_NOT_EXISTS` | recipient missing or deleted |
| 409 | `INTRO_ALREADY_SENT` | pair already exists |
| 429 | `INTRO_DAILY_LIMIT_REACHED` | sender hit 5/day |
| 500 | `SERVER_ERROR` | catch-all |

### Modifications to existing cofounder GET endpoints

`GET /cofounder/:id` and `GET /cofounder/slug/:slug` are extended so that, when the requester is a signed-in cofounder, the response includes:

```js
{
  ...existing cofounder fields,
  already_contacted: boolean,
  contacted_at: Date | null,
  intros_remaining_today: number,  // max(0, 5 - count in last 24h)
}
```

- `already_contacted` / `contacted_at`: from `Intro.findOne({ sender_id: req.user._id, recipient_id: target._id })`.
- `intros_remaining_today`: from `Intro.countDocuments({ sender_id: req.user._id, created_at: { $gte: Date.now() - 24h } })`.
- Signed-out → all three fields omitted; frontend shows "Sign in to reach out".

`GET /intro/sent` is intentionally **not** added — the embedded fields are enough.

## Brevo integration

- New template `INTRO_REQUEST: 2` in `BREVO_TEMPLATES` (`api/src/utils/constants.js`).
- Template is already created in Brevo as transactional template `#2`, with params:
  `recipient_first_name`, `sender_name`, `sender_city`, `sender_skills`, `sender_email`, `sender_profile_url`, `message`.
- `api/src/services/brevo.js` `sendTemplate()` is extended to forward an optional `replyTo: { email, name }` field into the request body (Brevo accepts this top-level on `/smtp/email`).
- Call shape from the controller:
  ```js
  await brevo.sendTemplate(BREVO_TEMPLATES.INTRO_REQUEST, {
    emailTo: [{ email: recipient.email, name: recipient.first_name }],
    params: {
      recipient_first_name: recipient.first_name,
      sender_name: `${sender.first_name} ${sender.last_name}`,
      sender_city: sender.city || "",
      sender_skills: (sender.skills || []).join(", "),
      sender_email: sender.email,
      sender_profile_url: `${config.APP_URL}/contact/${sender.slug}`,
      message: req.body.message,
    },
    replyTo: { email: sender.email, name: `${sender.first_name} ${sender.last_name}` },
  });
  ```

## Frontend

No new components. The flow reuses the existing "Send a coffee" section.

### Modified

- `app/src/app/contact/[slug]/profile-client.jsx` (`CoffeeBlock`):
  - Accepts new props: `recipientId`, `signedIn`, `alreadyContacted`, `contactedAt`, `introsRemainingToday`.
  - `handleSend` calls `POST /intro` with `{ recipient_id: recipientId, message: note }` and handles 200/409/429/4xx/5xx (see error matrix). Removes the placeholder `setTimeout` + "coming soon" toast.
  - Renders the four states described in the user flow (eligible / signed-out / already contacted / limit reached). All states reuse the existing dark-ink section shell so the page layout doesn't shift.
  - Message length: minimum 30 chars (currently no minimum), maximum 600 chars (existing `MAX` constant — kept as-is so the design language doesn't change). The API enforces the same bounds.
- `app/src/app/contact/[slug]/page.jsx`:
  - Passes the new props through to `<CoffeeBlock />` based on the cofounder GET response.
  - Hides the section entirely when the viewer is looking at their own profile.

### Not modified

- Search result cards (`card.jsx`) — no entry point there.
- `ProfileClickPing` — unchanged.

## Error handling — full matrix

| Scenario | Server response | Frontend reaction |
|---|---|---|
| Brevo `sendTemplate` returns falsy / `code` | 500 `SERVER_ERROR`, no DB row | Toast generic error; form stays so user can retry |
| Unique-index collision (race) | 409 `INTRO_ALREADY_SENT` | Swap form to "Already reached out" state |
| 24h count race (two requests in same second) | Second request gets 429 | Toast "Daily limit reached" + disable Send button |
| Sender not signed in | 401 from passport | Frontend renders "Sign in to reach out" instead of the form — should not reach this in normal flow |
| Self-contact (manual API call) | 400 `INTRO_CANNOT_CONTACT_SELF` | Toast (UI normally hides the section on own profile) |
| Recipient soft-deleted between page load and submit | 404 `COFOUNDER_NOT_EXISTS` | Toast |

## Testing

- Unit: validation branches in the POST /intro controller (length bounds, self, missing recipient).
- Integration: full happy-path (POST → Brevo mock called with right params → row inserted), 409 race (concurrent inserts), 429 daily-limit.
- Manual: confirm Brevo template renders correctly with the params; confirm Reply on the received email opens a draft to the sender's real address.

## Out of scope (potential follow-ups)

- Sender dashboard of intros.
- Recipient toggle "I'm open to intros".
- Soft accept/decline tracking.
- Cleanup of vestigial `invites_sent` / `invites_accepted` fields and the `POST /:id/invite-sent` endpoint.
