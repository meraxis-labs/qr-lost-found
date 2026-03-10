## Tagback by Meraxis

Privacy-preserving QR code system that connects finders with owners — anonymously.


### What it does

Tagback lets you print QR stickers and attach them to your valuables. If someone finds your lost item, they scan the QR code and can send you an anonymous message — no personal info exposed on either side.


### Monorepo structure

```text
meraxis-tagback/
├── apps/
│   ├── web/          # Next.js — QR landing pages, owner dashboard, messaging UI
│   └── mobile/       # Expo (React Native) — owner app, tag management, push notifications
├── packages/
│   └── shared/       # Shared TypeScript types, QR utilities
├── turbo.json
└── package.json
```


### Tech stack

- **Web**: Next.js (App Router)
- **Mobile**: Expo / React Native
- **Backend**: Next.js API Routes → Fastify (post-MVP)
- **Database**: Supabase (Postgres + Auth + Realtime)
- **Monorepo**: Turborepo
- **QR generation**: `qrcode` npm package


### Getting started

#### Prerequisites

- **Node.js**: 18+
- **Package manager**: npm or yarn
- **Accounts**: Supabase account


#### Install

```bash
git clone https://github.com/meraxis/meraxis-tagback.git
cd meraxis-tagback
npm install
```


#### Run all apps in dev mode

```bash
npm run dev
```


#### Run individual apps

```bash
# Web only
cd apps/web && npm run dev

# Mobile only
cd apps/mobile && npx expo start
```


### Environment variables

Create `.env.local` in `apps/web/`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```


### Roadmap

- **QR code generation + sticker export**
- **Anonymous finder → owner messaging**
- **Owner dashboard** (manage tags, read messages)
- **Push notifications** (mobile)
- **Premium plan** (multiple tags, custom messages)
- **Physical sticker store**


### License

MIT © Meraxis