# Supabase

Schema and migrations for Tagback (tags + messages, RLS).

## Applying migrations

With the [Supabase CLI](https://supabase.com/docs/guides/cli) installed and linked to your project:

```bash
supabase db push
```

Or, if running migrations manually against a remote DB, use the SQL in `migrations/` in order (oldest timestamp first).

## Tables

- **tags** — One per item; `owner_id` = `auth.users.id`. RLS: owners manage their tags; public can read active tags (for finder page).
- **messages** — Finder submissions per tag. RLS: anyone can insert; only tag owner can select/update (e.g. mark read).
