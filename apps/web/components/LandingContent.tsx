/**
 * LANDING CONTENT — Client wrapper for the home page
 * ---------------------------------------------------
 * If the user is logged in, redirects to /dashboard. Otherwise shows the
 * landing content. "Already have an account? Log in" is only shown when we
 * know the user is not logged in, so logged-in users never see it (they
 * are redirected first).
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { GetStartedLink } from "./GetStartedLink";

export function LandingContent() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return;
      setUser(data.user ? { id: data.user.id } : null);
    }).finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  // Redirecting or still loading: show minimal content to avoid flash of "Log in"
  if (loading || user) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
        <section className="max-w-lg w-full text-center space-y-8">
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl font-medium tracking-tight text-slate-100">
              QR lost &amp; found,
              <span className="text-sky-400"> privately.</span>
            </h1>
            <p className="text-slate-400 text-base sm:text-lg">
              Sticker a QR on your stuff. If someone finds it, they message
              you—no phone or email shared.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <GetStartedLink />
            {loading && <p className="text-slate-500 text-sm">Loading…</p>}
            {user && <p className="text-slate-500 text-sm">Redirecting to dashboard…</p>}
          </div>
          <p className="text-slate-600 text-sm max-w-xs mx-auto">
            Create a tag → print QR → get anonymous messages in your dashboard.
          </p>
        </section>
      </main>
    );
  }

  // Not logged in: show full content including "Already have an account? Log in"
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
      <section className="max-w-lg w-full text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-4xl font-medium tracking-tight text-slate-100">
            QR lost &amp; found,
            <span className="text-sky-400"> privately.</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Sticker a QR on your stuff. If someone finds it, they message
            you—no phone or email shared.
          </p>
        </div>
        <div className="flex flex-col items-center gap-4">
          <GetStartedLink />
          <p className="text-slate-500 text-sm">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="text-slate-400 hover:text-slate-300 underline-offset-2 hover:underline"
            >
              Log in
            </a>
          </p>
        </div>
        <p className="text-slate-600 text-sm max-w-xs mx-auto">
          Create a tag → print QR → get anonymous messages in your dashboard.
        </p>
      </section>
    </main>
  );
}
