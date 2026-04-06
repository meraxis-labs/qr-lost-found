# Code review — Tagback web app

Findings from inspection of the codebase (Supabase usage, middleware, types, and main routes). Use this as a backlog of improvements; priority suggestions are at the bottom.

---

## Architecture and Supabase usage

1. **Browser Supabase client used from a Server Component** — `apps/web/app/f/[tagId]/page.tsx` imports `supabase` from `@/lib/supabaseClient`, which uses `createBrowserClient`. That helper is for **client** code only. Server Components should use **`createServerClient`** from `@supabase/ssr` with cookies from `next/headers` (or a dedicated server-only module). Using the browser client on the server is the wrong abstraction and can mis-handle cookies/session.

2. **Finder writes from the client** — `FinderForm` inserts into `messages` with the anon key from the browser. Acceptable if **RLS** is strict, but there is no app-level **rate limiting**, **length limits**, or **CAPTCHA** in code. For stronger guarantees, consider Server Actions or route handlers.

3. **Middleware fails open** — If `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing, middleware returns `NextResponse.next()` and does **not** redirect unauthenticated users away from `/dashboard`. A misconfigured deploy could expose dashboard routes until client-side redirects run.

---

## Type safety and TypeScript

4. **Repeated `as never` on Supabase calls** — Inserts/updates in `FinderForm`, `dashboard/page.tsx`, and `dashboard/tag/[tagId]/page.tsx` disable type checking. Usually indicates **`Database` generics** or **Insert/Update** shapes not matching the client. Prefer fixing types or using `satisfies` instead of casting.

5. **Casts on query results** — Patterns like `(data as TagRow[])` are common with Supabase; risk can be reduced with **centralized narrowing helpers** or **generated types** from the Supabase CLI.

6. **`user_metadata?.display_name as string`** — Used in `AuthStatus` and settings without validation. Prefer a **runtime check** (`typeof x === "string"`) or a small helper.

---

## Error handling and observability

7. **Swallowed errors** — In `dashboard/page.tsx`, the messages `useEffect` chain ends with `.catch(() => {})`, so failures are silent (no user feedback, no logging).

8. **Tag list load on error** — On tags fetch error, state is set to an empty list without an error message, so users may think they have no tags.

9. **`navigator.clipboard` in `TagQR`** — Copy can fail (permissions, insecure context). No `.catch` or fallback UI.

---

## Duplication and organization

10. **Repeated auth bootstrap** — Dashboard, customize tag, preview, and settings repeat `useEffect` + `supabase.auth.getUser()` + `router.replace("/auth/login")`. Middleware already protects `/dashboard/*`, but client checks are duplicated; consider a **`dashboard` layout** wrapper or shared **`useRequireUser()`** hook.

11. **Duplicated finder copy** — `DEFAULT_TITLE` / `DEFAULT_MESSAGE` (and similar strings) appear in multiple files. Centralize in one module or `packages/shared` to avoid drift.

12. **Large client pages** — e.g. `dashboard/page.tsx` mixes auth, CRUD, messages, QR, and delete. Splitting into **components + hooks** would improve readability and testing.

13. **`index.ts` at repo root as `@repo/types`** — Works but is unconventional; a **`packages/types`** (or `packages/shared`) package scales better for web + mobile.

---

## UX, HTML, and Next.js details

14. **Login “Sign up” uses `<a href>`** — Full page navigation instead of `next/link` (minor inconsistency).

15. **QR URL uses `window.location.origin`** — Fine for client-only QR generation; for **emails, SSR, or print**, prefer **`NEXT_PUBLIC_APP_URL`** (or similar) so URLs are explicit per environment.

---

## Dependencies and quality gates

16. **`next`: `"latest"`** — Unpinned major versions hurt reproducible builds. Prefer a **semver range** or controlled upgrades.

17. **No automated tests** — No `test` script in `apps/web/package.json`; auth and Supabase flows lack regression coverage.

18. **`skipLibCheck: true`** — Skips checking declaration files; common for speed, with the usual tradeoff.

---

## What is already in good shape

- Middleware matcher for `/dashboard` and `next` query param for post-login redirect.
- Separation of **domain types** vs **DB rows** with `tagRowToTag` / `messageRowToMessage` in `lib/types.ts`.
- Login uses full `window.location.href` after sign-in so the session cookie is visible to middleware (documented in code).
- Consistent, verbose file-level comments (team preference may vary).

---

## Suggested priority order

1. Add a **server Supabase client** and use it in `f/[tagId]/page.tsx` (and any other RSC that talks to Supabase).
2. Remove **`as never`** by aligning `Database` types with Supabase’s expectations.
3. Stop **swallowing** errors on the dashboard messages path; surface UI or logging.
4. Deduplicate **defaults** and **auth guards**, and **pin `next`** to a known version.
