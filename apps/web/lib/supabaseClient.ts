/**
 * SUPABASE CLIENT — Single place we talk to the backend
 * ------------------------------------------------------
 * Supabase provides the database (Postgres tables: tags, messages) and
 * authentication (email/password). We use createBrowserClient from
 * @supabase/ssr so the session is stored in cookies, which allows the
 * auth middleware to see the session and not redirect logged-in users
 * from /dashboard back to login.
 *
 * Usage: import { supabase } from "@/lib/supabaseClient", then call
 * supabase.auth.getUser(), supabase.from("tags").select(), etc.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

// NEXT_PUBLIC_ prefix is required so Next.js exposes these to the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in apps/web/.env.local"
  );
}

/**
 * createBrowserClient uses cookies for the session so middleware can read it.
 * Typed with Database for .from("tags") and .from("messages").
 */
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
