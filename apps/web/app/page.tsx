/**
 * LANDING PAGE (Home) — Route: /
 * -----------------------------
 * The first page users see. If logged in, they are redirected to /dashboard.
 * Otherwise we show the Tagback pitch; "Already have an account? Log in" is
 * only shown when not logged in (LandingContent handles auth and redirect).
 *
 * Suspense: LandingContent uses `useSearchParams` (e.g. `?config=missing` when
 * Supabase env is absent and middleware sent the user here from /dashboard).
 */

import { Suspense } from "react";
import { LandingContent } from "../components/LandingContent";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <p className="text-slate-500 text-sm">Loading…</p>
        </main>
      }
    >
      <LandingContent />
    </Suspense>
  );
}
