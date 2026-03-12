/**
 * SUPABASE CLIENT — Single place we talk to the backend
 * ------------------------------------------------------
 * Supabase provides the database (Postgres tables: tags, messages) and
 * authentication (email/password). This file creates one shared client
 * that the whole app imports. We use the "anon" (anonymous) key — it's
 * safe to use in the browser because Row Level Security (RLS) in Postgres
 * restricts what each user can read/write. We never put the "service role"
 * key in frontend code; that would bypass RLS.
 *
 * Usage: import { supabase } from "@/lib/supabaseClient", then call
 * supabase.auth.getUser(), supabase.from("tags").select(), etc.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// NEXT_PUBLIC_ prefix is required so Next.js exposes these to the browser.
// Without them, process.env.NEXT_PUBLIC_* would be undefined in client components.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  /**
   * We throw during module load so the app fails fast. If we didn't, the
   * client would be created with undefined and every Supabase call would
   * fail with a cryptic error. This way the developer sees a clear message
   * to set the env vars in apps/web/.env.local.
   */
  throw new Error(
    "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in apps/web/.env.local"
  );
}

/**
 * createClient<Database> makes the client typed: .from("tags") and
 * .from("messages") know the table shapes, so .select(), .insert(), and
 * .update() get autocomplete and type checking.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
