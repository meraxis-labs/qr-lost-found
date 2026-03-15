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
import { getTagIconEmoji } from "@/lib/tagIcons";

const HOW_IT_WORKS = [
  { step: 1, title: "Create a tag", description: "Name your item, get a unique QR." },
  { step: 2, title: "Stick the QR", description: "Print or show it—finders scan with their camera." },
  { step: 3, title: "They message you", description: "No app or account. Your contact stays hidden." },
  { step: 4, title: "Reply in dashboard", description: "Messages land here. You choose when to share details." },
];

const FEATURES = [
  { title: "Private", description: "Finders never see your number or email unless you reply." },
  { title: "Simple for finders", description: "Scan, type, send—no signup." },
  { title: "One dashboard", description: "All tags and messages in one place." },
];

const USE_CASES: { label: string; iconId: string }[] = [
  { label: "Keys & keychains", iconId: "keys" },
  { label: "Wallets & cards", iconId: "wallet" },
  { label: "Backpacks & bags", iconId: "bag" },
  { label: "Luggage & cases", iconId: "briefcase" },
  { label: "Phones & devices", iconId: "phone" },
  { label: "Pet collars", iconId: "pet" },
];

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

  // Not logged in: show full landing with How it works, features, use cases
  return (
    <main className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="max-w-2xl w-full space-y-4">
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-slate-100">
            QR lost &amp; found,
            <span className="text-sky-400"> privately.</span>
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-xl mx-auto">
            Sticker a QR on your stuff. Finders message you—no phone or email shared.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <GetStartedLink />
            <a
              href="#how-it-works"
              className="btn btn-outline min-h-[44px] touch-manipulation"
            >
              How it works
            </a>
          </div>
          <p className="text-slate-500 text-sm pt-2">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="text-sky-400 hover:text-sky-300 underline-offset-2 hover:underline"
            >
              Log in
            </a>
          </p>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="scroll-mt-6 border-t border-slate-800 bg-slate-900/40 px-4 sm:px-6 py-12 sm:py-16"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-100 text-center mb-8">
            How it works
          </h2>
          <ol className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {HOW_IT_WORKS.map(({ step, title, description }) => (
              <li
                key={step}
                className="rounded-xl bg-slate-800/60 border border-slate-700 p-4 sm:p-5 flex flex-col"
              >
                <span
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 font-semibold flex items-center justify-center text-sm mb-3"
                  aria-hidden
                >
                  {step}
                </span>
                <h3 className="text-slate-200 font-medium text-sm sm:text-base">
                  {title}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  {description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-800 px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-3xl mx-auto">
          <ul className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {FEATURES.map(({ title, description }) => (
              <li key={title} className="text-center">
                <h3 className="text-slate-200 font-medium">{title}</h3>
                <p className="text-slate-400 text-sm mt-1">{description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Use cases */}
      <section className="border-t border-slate-800 bg-slate-900/40 px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-lg font-semibold text-slate-100 mb-8">Tag what matters</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
            {USE_CASES.map(({ label, iconId }) => (
              <li
                key={label}
                className="flex flex-col items-center rounded-xl bg-slate-800/60 border border-slate-700 p-6 sm:p-8"
              >
                <span
                  className="text-5xl sm:text-6xl mb-3 select-none"
                  aria-hidden
                  role="img"
                >
                  {getTagIconEmoji(iconId)}
                </span>
                <span className="text-slate-200 font-medium text-sm sm:text-base">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-slate-800 px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <h2 className="text-xl font-semibold text-slate-100">Ready to get your stuff back?</h2>
          <GetStartedLink />
          <p className="text-slate-500 text-sm">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="text-sky-400 hover:text-sky-300 underline-offset-2 hover:underline"
            >
              Log in
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
