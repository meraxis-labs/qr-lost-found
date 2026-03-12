/**
 * SUPABASE CLIENT — Single place we talk to the backend
 * ------------------------------------------------------
 * Supabase gives us:
 * - A Postgres database (tables: tags, messages)
 * - Auth (email/password sign up and sign in)
 *
 * This file creates one shared client that the whole app uses. We read
 * the URL and "anon" (public) key from environment variables. The anon
 * key is safe to use in the browser; it only lets users do what our
 * database rules (RLS) allow.
 *
 * Where to use it: any component or page that needs to fetch tags,
 * insert a message, or check if the user is logged in should
 * `import { supabase } from "@/lib/supabaseClient"`.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// These must be set in apps/web/.env.local (see project README).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail immediately in development so we don't get confusing errors later
  // when a component tries to call supabase.from("tags") and nothing works.
  throw new Error(
    "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in apps/web/.env.local"
  );
}

// One client for the whole app. Typed with Database so .from("tags") and
// .from("messages") know the column names and types.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
