/**
 * LANDING PAGE (Home) — Route: /
 * -----------------------------
 * The first page users see. If logged in, they are redirected to /dashboard.
 * Otherwise we show the Tagback pitch; "Already have an account? Log in" is
 * only shown when not logged in (LandingContent handles auth and redirect).
 */

import { LandingContent } from "../components/LandingContent";

export default function HomePage() {
  return <LandingContent />;
}
