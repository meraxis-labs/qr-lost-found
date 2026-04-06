<!-- Root-level README for the Tagback monorepo: high-level product + developer onboarding. -->

# Tagback by Meraxis

> Privacy-preserving QR code system that connects finders with owners — anonymously.

---

## What it does

Tagback lets you print QR stickers and attach them to your valuables. If someone finds your lost item, they scan the QR code and can send you an anonymous message — no personal info exposed on either side.

---

## Monorepo Structure

```
meraxis-tagback/
├── apps/
│   ├── web/          # Next.js — QR landing pages, owner dashboard, messaging UI
│   └── mobile/       # Expo (React Native) — owner app, tag management, push notifications
├── packages/
│   └── shared/       # Shared TypeScript types, QR utilities
├── turbo.json
└── package.json
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Web | Next.js (App Router) |
| Mobile | Expo / React Native |
| Backend | Next.js API Routes → Fastify (post-MVP) |
| Database | Supabase (Postgres + Auth + Realtime) |
| Monorepo | Turborepo |
| QR Generation | `qrcode` npm package |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Install

```bash
git clone https://github.com/meraxis/meraxis-tagback.git
cd meraxis-tagback
npm install
```

### Run all apps in dev mode

```bash
npm run dev
```

### Run individual apps

```bash
# Web only
cd apps/web && npm run dev

# Mobile only
cd apps/mobile && npx expo start
```

---

## Environment Variables

Create `.env.local` in `apps/web/`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Optional — finder form (defaults: 8 messages per IP+tag per 24h)
# FINDER_RATE_LIMIT_MAX=8
# FINDER_RATE_LIMIT_WINDOW_HOURS=24

# Optional — Cloudflare Turnstile on /f/[tagId] (set both for CAPTCHA)
# NEXT_PUBLIC_TURNSTILE_SITE_KEY=
# TURNSTILE_SECRET_KEY=
```

---

## Roadmap

- [ ] QR code generation + sticker export
- [ ] Anonymous finder → owner messaging
- [ ] Owner dashboard (manage tags, read messages)
- [ ] Push notifications (mobile)
- [ ] Premium plan (multiple tags, custom messages)
- [ ] Physical sticker store

---

## License

MIT © [Meraxis](https://meraxis.com)
