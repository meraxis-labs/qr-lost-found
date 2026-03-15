# Tagback — Build Priorities

What needs to happen first, in dependency order. Each tier should be done before the next.

---

## P0 — Prerequisites (do first)

Must be in place before any tag or messaging feature works.

| # | Item | Status | Why first |
|---|------|--------|-----------|
| 1 | **Supabase schema for tags & messages** | Done | No tables ⇒ no tag creation, no messages, no dashboard data. Define `tags` (id, owner_id, label, created_at, is_active) and `messages` (id, tag_id, finder_token, content, created_at, read). Use RLS so owners see only their tags and messages. |
| 2 | **Use domain types in the app** | Done | Import `Tag`, `Message`, `Owner` from root `index.ts` (or a `packages/shared` later) so API, server code, and UI share one shape. Prevents drift and clarifies contracts. |

---

## P1 — Foundation (enables all flows)

Enables “create tag,” “see my stuff,” and “finder can resolve a tag.”

| # | Item | Status | Why now |
|---|------|--------|--------|
| 3 | **Post-login redirect to dashboard** | Done | Logged-in users need a destination. Redirect to `/dashboard` after login/signup instead of `/`. |
| 4 | **Minimal owner dashboard** | Done | One page at `/dashboard`: list “My tags,” empty state “Create your first tag,” and a way to create a tag (name/label). Protects route so only authenticated users can access (middleware or server-side check). |
| 5 | **API or Server Actions for tags** | Done | Create tag (insert into `tags` with `owner_id` from session). List tags for current user. Get single tag by id (public, for finder page). Without this, dashboard and finder page have no data. |
| 6 | **Finder route + message API** | Done | Dynamic route e.g. `/f/[tagId]`: load tag by id (public), show “You found something?” and an anonymous contact form. Submit → Server Action or API that inserts into `messages` (tag_id, content, finder_token if you track it). No auth required for finder. |

---

## P2 — Core product (tag → QR → scan → message)

Makes the full loop work: create tag → get QR → finder scans → message stored → owner can see it.

| # | Item | Status | Why now |
|---|------|--------|--------|
| 7 | **QR code generation** | Done | Add `qrcode` (or similar) to `apps/web`. When a tag is created (or from dashboard “Show QR”), generate QR that encodes the finder URL: `${BASE_URL}/f/${tagId}`. Display in dashboard; optional: download PNG. |
| 8 | **Show messages in dashboard** | Done | On dashboard (or per-tag view), list messages for each tag. Mark as read when viewed. Uses existing `messages` table and RLS. |
| 9 | **Wire landing CTAs** | Done | “Get started” → signup or dashboard (if logged in). “How it works” can stay as anchor; ensure “Login” / “Sign up” already go to auth. |

---

## P3 — Polish and UX

Improves clarity and professionalism; not blocking the core loop.

| # | Item | Status | Why now |
|---|------|--------|--------|
| 10 | **Button styles** | Done | Define `.btn`, `.btn-primary`, `.btn-outline` in `globals.css` (or Tailwind @layer) so landing and auth buttons look intentional. |
| 11 | **Sticker export (optional)** | Partial | Print-friendly view or “Download sticker” (e.g. QR + short instructions) so users can print and stick. Download PNG exists; full print sheet / PDF not yet. |
| 12 | **Auth middleware** | Done | Optional `middleware.ts` to redirect unauthenticated users from `/dashboard` to `/auth/login`. Cleaner than per-page checks. |
| 13 | **`clean` script in web app** | Done | Add `"clean": "rm -rf .next"` (or equivalent) in `apps/web/package.json` so `turbo run clean` works. |

---

## P4 — Later / Non-MVP

Explicitly after MVP; order can change.

| # | Item | Note |
|---|------|------|
| 14 | **`packages/shared`** | Move types + shared QR helpers here when adding mobile or a second consumer. |
| 15 | **Mobile app (`apps/mobile`)** | Expo app for owners: tag management, push notifications. |
| 16 | **Premium plan** | Multiple tags, custom messages, etc. |
| 17 | **Physical sticker store** | E-commerce / fulfillment. |
| 18 | **README clone URL** | Update if repo name/fork differs from `meraxis-tagback`. |

---

## Suggested first 3 steps

1. ~~**Define Supabase schema** (P0)~~ — Done.
2. ~~**Dashboard + tag CRUD** (P1)~~ — Done.
3. ~~**Finder page + send message** (P1)~~ — Done.

Next: finish P3 (auth middleware, clean script, full sticker/print export), then P4 and feature upgrades below.

---

## Feature upgrades (backlog)

Candidate improvements beyond the current MVP. **Done** = already implemented; **Partial** = partly there; **—** = not started.

### Auth & account

| Status | Item |
|--------|------|
| Done | Password reset — "Forgot password?" flow and email reset link (Supabase supports it). |
| Done | Social login — Google / Apple / GitHub via Supabase Auth. |
| Done | Profile / settings page — change email, password, delete account. |
| Done | Email verification — clearer "Confirm your email" state and resend verification. |
| Done | Optional display name — show in dashboard (e.g. "Hi, Alex") instead of only email. |

### Dashboard & tags

| Status | Item |
|--------|------|
| — | Edit tag label — in-place or modal edit (currently create + remove only). |
| — | Activate / deactivate tag — toggle `is_active` without deleting (pause a tag). |
| — | Search and filter tags — by label; filter by "has messages" / "no messages". |
| — | Sort tags — by date created, label A–Z, message count. |
| — | Pagination or infinite scroll — for users with many tags. |
| Done | Tag stats on card — e.g. "3 messages", "Last message 2 days ago" (message count shown). |
| — | Bulk actions — select multiple tags to deactivate or export. |
| — | Custom finder message per tag — owner-defined text on finder page (e.g. "Thanks for finding my wallet…"). |

### Messages

| Status | Item |
|--------|------|
| — | Unread badge — total unread count in header or dashboard (e.g. "3 new"). |
| — | Mark as unread — allow marking a message unread for follow-up. |
| — | Reply to finder — use `finder_token` so owner can send anonymous reply (e.g. `/f/[tagId]/reply/[token]`). |
| — | Real-time message updates — Supabase Realtime so new messages appear without refresh. |
| — | Email or push on new message — notify owner when a finder sends a message. |
| — | Delete message — soft-delete or hard-delete single messages. |
| — | Export messages — CSV or PDF per tag or all. |

### Finder experience

| Status | Item |
|--------|------|
| — | Optional location — "Where did you find it?" (city/place or share location); store and show to owner only. |
| — | Photo from finder — optional image upload (e.g. proof of item); store in Supabase Storage. |
| — | Character limit + counter — e.g. 500 chars with live counter. |
| — | Abuse prevention — rate limit (e.g. one message per IP/tag per day), optional CAPTCHA (e.g. Turnstile). |
| — | Custom thank-you — after submit, show owner-defined text. |
| — | Localization — multiple languages for finder page (and later full app). |

### QR & stickers

| Status | Item |
|--------|------|
| Done | Copy URL + Download PNG — in TagQR component. |
| — | Print-ready PDF — export one or many tags as single PDF (e.g. A4) with QR + label for sticker sheets. |
| — | SVG or high-res PNG — for scaling and professional printing. |
| — | Batch PDF — select multiple tags, generate one PDF with many QRs. |
| — | Short URL — redirect (e.g. `tbk.io/abc`) so QR is smaller; redirect to `/f/[tagId]`. |
| — | Optional logo in QR — small logo in center (if still scannable). |

### UX & UI

| Status | Item |
|--------|------|
| — | Toast notifications — success/error toasts for "Tag created", "Message sent", "Link copied". |
| — | Loading skeletons — skeleton cards/lists instead of "Loading your tags…". |
| — | Empty-state illustrations — for "No tags yet", "No messages". |
| — | Theme toggle — dark (current) / light mode with persistence. |
| — | Onboarding tour — first-time flow: "Create a tag → get QR → stick it on something". |
| — | PWA — installable app, optional offline for visited pages. |
| — | Accessibility — ARIA, focus order, skip links, screen reader labels for QR and actions. |

### Technical & reliability

| Status | Item |
|--------|------|
| — | Rate limiting — on finder form submit (and optionally auth) to prevent spam. |
| — | Error boundaries — React error boundaries and fallback UI. |
| — | Retry / refresh — "Retry" or "Refresh" on failed tag/message loads. |
| — | API routes — Next.js API routes for webhooks (e.g. "new message" → send email) or server-only logic. |
| — | Privacy-safe analytics — e.g. finder page view count per tag (no PII). |

### Plans & monetization

| Status | Item |
|--------|------|
| — | Free tier — e.g. max 3 or 5 tags per account. |
| — | Premium — more tags, custom finder message, optional "no branding", priority support. |
| — | Sticker store — order pre-printed Tagback stickers (fulfillment or partner). |

### Trust & legal

| Status | Item |
|--------|------|
| — | Privacy policy & Terms of Service — pages + links in footer and signup. |
| — | FAQ / Help — "How it works", "Is it really anonymous?", "How do I print?". |
| — | Contact / support — simple form or email for support. |

### Discovery & growth

| Status | Item |
|--------|------|
| — | Public stats — e.g. "X items reunited" or "Y messages sent" on landing page. |
| — | i18n — full app translation (landing, auth, dashboard, finder) for 2–3 languages. |
