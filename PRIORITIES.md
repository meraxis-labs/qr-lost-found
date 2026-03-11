# Tagback — Build Priorities

What needs to happen first, in dependency order. Each tier should be done before the next.

---

## P0 — Prerequisites (do first)

Must be in place before any tag or messaging feature works.

| # | Item | Why first |
|---|------|-----------|
| 1 | **Supabase schema for tags & messages** | No tables ⇒ no tag creation, no messages, no dashboard data. Define `tags` (id, owner_id, label, created_at, is_active) and `messages` (id, tag_id, finder_token, content, created_at, read). Use RLS so owners see only their tags and messages. |
| 2 | **Use domain types in the app** | Import `Tag`, `Message`, `Owner` from root `index.ts` (or a `packages/shared` later) so API, server code, and UI share one shape. Prevents drift and clarifies contracts. |

---

## P1 — Foundation (enables all flows)

Enables “create tag,” “see my stuff,” and “finder can resolve a tag.”

| # | Item | Why now |
|---|------|--------|
| 3 | **Post-login redirect to dashboard** | Logged-in users need a destination. Redirect to `/dashboard` after login/signup instead of `/`. |
| 4 | **Minimal owner dashboard** | One page at `/dashboard`: list “My tags,” empty state “Create your first tag,” and a way to create a tag (name/label). Protects route so only authenticated users can access (middleware or server-side check). |
| 5 | **API or Server Actions for tags** | Create tag (insert into `tags` with `owner_id` from session). List tags for current user. Get single tag by id (public, for finder page). Without this, dashboard and finder page have no data. |
| 6 | **Finder route + message API** | Dynamic route e.g. `/f/[tagId]`: load tag by id (public), show “You found something?” and an anonymous contact form. Submit → Server Action or API that inserts into `messages` (tag_id, content, finder_token if you track it). No auth required for finder. |

---

## P2 — Core product (tag → QR → scan → message)

Makes the full loop work: create tag → get QR → finder scans → message stored → owner can see it.

| # | Item | Why now |
|---|------|--------|
| 7 | **QR code generation** | Add `qrcode` (or similar) to `apps/web`. When a tag is created (or from dashboard “Show QR”), generate QR that encodes the finder URL: `${BASE_URL}/f/${tagId}`. Display in dashboard; optional: download PNG. |
| 8 | **Show messages in dashboard** | On dashboard (or per-tag view), list messages for each tag. Mark as read when viewed. Uses existing `messages` table and RLS. |
| 9 | **Wire landing CTAs** | “Get started” → signup or dashboard (if logged in). “How it works” can stay as anchor; ensure “Login” / “Sign up” already go to auth. |

---

## P3 — Polish and UX

Improves clarity and professionalism; not blocking the core loop.

| # | Item | Why now |
|---|------|--------|
| 10 | **Button styles** | Define `.btn`, `.btn-primary`, `.btn-outline` in `globals.css` (or Tailwind @layer) so landing and auth buttons look intentional. |
| 11 | **Sticker export (optional)** | Print-friendly view or “Download sticker” (e.g. QR + short instructions) so users can print and stick. |
| 12 | **Auth middleware** | Optional `middleware.ts` to redirect unauthenticated users from `/dashboard` to `/auth/login`. Cleaner than per-page checks. |
| 13 | **`clean` script in web app** | Add `"clean": "rm -rf .next"` (or equivalent) in `apps/web/package.json` so `turbo run clean` works. |

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

1. **Define Supabase schema** (P0) — migrations or SQL for `tags` and `messages` + RLS.
2. **Dashboard + tag CRUD** (P1) — redirect after login to `/dashboard`, minimal dashboard page, create/list tags via Server Actions or API.
3. **Finder page + send message** (P1) — `/f/[tagId]` page and Server Action (or API) to save a message; then add QR generation (P2) so the full loop works.

After that, add “view messages” in dashboard (P2), then polish (P3) and later roadmap (P4).
