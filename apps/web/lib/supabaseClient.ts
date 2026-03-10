/**
 * Supabase client singleton for the Next.js web app.
 *
 * This is the primary way UI components and server actions will talk to
 * the database (Postgres) and to Supabase Auth / Storage / Realtime.
 *
 * We expose only the public (anon) client from here. Anything that needs
 * elevated privileges should use Supabase Service Role keys on the server
 * side only (never in client-side code).
 */
import { createClient } from "@supabase/supabase-js";

// These environment variables are provided by the Supabase dashboard.
// They must be defined in apps/web/.env.local (see README).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  /**
   * Fail fast in development if configuration is incomplete.
   *
   * This throws during module initialization so that developers
   * immediately see a clear error instead of subtle runtime failures
   * when calling Supabase later.
   */
  throw new Error(
    "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in apps/web/.env.local"
  );
}

// Shared Supabase client instance used across the app.
// Import { supabase } from "@/lib/supabaseClient" wherever you need it.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
