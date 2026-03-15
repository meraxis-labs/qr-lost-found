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

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Create a tag",
    description:
      "Sign up free, give your item a name (e.g. “Keys”, “Backpack”), and we generate a unique QR code. You can add a short note so finders know what they’re looking at.",
  },
  {
    step: 2,
    title: "Print & stick the QR",
    description:
      "Download or print the QR sticker and attach it to your item. Anyone who finds it can scan with their phone camera—no app or account needed.",
  },
  {
    step: 3,
    title: "Finder scans and messages you",
    description:
      "When someone finds your item, they scan the QR and land on a simple “You found something?” page. They type a message and send—anonymously. Your phone and email stay hidden.",
  },
  {
    step: 4,
    title: "You get the message in your dashboard",
    description:
      "New messages show up in your Tagback dashboard. Reply through the link we provide—only then do you choose whether to share contact details. No spam, no random calls.",
  },
];

const FEATURES = [
  {
    title: "Your contact stays private",
    description:
      "Finders never see your phone number or email unless you reply. No more writing your number on a tag for the whole world to see.",
  },
  {
    title: "Zero friction for finders",
    description:
      "No app, no signup, no download. They scan the QR, type where they found it and how to reach them, and send. Takes seconds.",
  },
  {
    title: "One dashboard for all your tags",
    description:
      "Keys, wallet, backpack, luggage—manage every tag and every message in one place. Mark messages read, reply, and get your stuff back.",
  },
];

const USE_CASES = [
  "Keys & keychains",
  "Wallets & cards",
  "Backpacks & bags",
  "Luggage & cases",
  "Phones & devices",
  "Pet collars",
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
            Sticker a QR on your stuff. If someone finds it, they message you—your
            phone and email stay private until you choose to reply.
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
        className="scroll-mt-6 border-t border-slate-800 bg-slate-900/40 px-4 sm:px-6 py-16 sm:py-20"
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-100 text-center mb-4">
            How it works
          </h2>
          <p className="text-slate-400 text-center max-w-xl mx-auto mb-12">
            From creating your first tag to getting a message from a finder—here’s
            the full workflow.
          </p>
          <ol className="space-y-10 sm:space-y-12">
            {HOW_IT_WORKS.map(({ step, title, description }) => (
              <li key={step} className="flex gap-4 sm:gap-6">
                <span
                  className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-sky-500/20 text-sky-400 font-semibold flex items-center justify-center text-lg"
                  aria-hidden
                >
                  {step}
                </span>
                <div className="pt-0.5">
                  <h3 className="text-lg sm:text-xl font-medium text-slate-200">
                    {title}
                  </h3>
                  <p className="text-slate-400 mt-2 text-base sm:text-lg leading-relaxed">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-800 px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-100 text-center mb-4">
            Why Tagback?
          </h2>
          <p className="text-slate-400 text-center max-w-xl mx-auto mb-12">
            Built for people who want their stuff back without handing out their
            number to strangers.
          </p>
          <ul className="grid sm:grid-cols-3 gap-8 sm:gap-10">
            {FEATURES.map(({ title, description }) => (
              <li key={title} className="text-center sm:text-left">
                <h3 className="text-slate-200 font-medium text-base sm:text-lg">
                  {title}
                </h3>
                <p className="text-slate-400 text-sm sm:text-base mt-2 leading-relaxed">
                  {description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* For finders */}
      <section className="border-t border-slate-800 bg-slate-900/40 px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-100 mb-3">
            Found something with a Tagback QR?
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Scan the QR with your phone camera. You’ll see a short message from the
            owner and a form to send them a note—no account or app required. They’ll
            get your message and can reply to arrange return.
          </p>
        </div>
      </section>

      {/* Use cases */}
      <section className="border-t border-slate-800 px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-100 mb-4">
            Tag what matters
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mb-10 max-w-xl mx-auto">
            Put a QR on anything you might lose—finders can reach you without ever
            seeing your contact details.
          </p>
          <ul className="flex flex-wrap justify-center gap-3">
            {USE_CASES.map((label) => (
              <li key={label}>
                <span className="inline-block px-4 py-2 rounded-full bg-slate-800 text-slate-300 text-sm border border-slate-700">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-slate-800 px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-100">
            Ready to get your stuff back?
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Create your first tag in under a minute. Free to start—no credit card
            required.
          </p>
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
