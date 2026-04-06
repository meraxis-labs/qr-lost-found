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
  {
    step: 1,
    title: "Create a tag in minutes",
    description:
      "Give your item a name, choose an icon, and we instantly generate a smart QR for it.",
  },
  {
    step: 2,
    title: "Print or stick the QR",
    description:
      "Download, print, or add it to a label. Stick it on keys, bags, wallets, devices, or pet collars.",
  },
  {
    step: 3,
    title: "Finder scans & sends a message",
    description:
      "Anyone can scan with their phone camera, type a short message, and hit send. No app, no login needed.",
  },
  {
    step: 4,
    title: "You reply safely from your dashboard",
    description:
      "You receive a private message linked to that item and decide if/when to share your contact details.",
  },
];

const FEATURES = [
  {
    title: "Privacy-first by default",
    description: "Finders never see your number or email unless you choose to share it.",
  },
  {
    title: "Zero-friction for finders",
    description: "Scan, type, send—no app download, no accounts, no instructions needed.",
  },
  {
    title: "Everything in one place",
    description: "Manage all your tagged items and conversations from a single dashboard.",
  },
  {
    title: "Works anywhere a QR works",
    description: "Print at home, use label printers, or add to existing stickers and cards.",
  },
  {
    title: "Designed for real-world loss",
    description: "Short, clear flows so stressed finders can contact you in seconds.",
  },
  {
    title: "Built on Supabase",
    description: "Modern, secure stack with authentication and storage you can trust.",
  },
];

const USE_CASES: { label: string; iconId: string }[] = [
  { label: "Keys & keychains", iconId: "keys" },
  { label: "Wallets & cards", iconId: "wallet" },
  { label: "Backpacks & bags", iconId: "bag" },
  { label: "Luggage & cases", iconId: "briefcase" },
  { label: "Phones & devices", iconId: "phone" },
  { label: "Pet collars", iconId: "pet" },
];

const FAQ_ITEMS = [
  {
    q: "Does the finder need an app or account?",
    a: "No. They just scan the QR with their phone camera and type a message in their browser.",
  },
  {
    q: "Can people see my phone number or email?",
    a: "Not unless you decide to share it in a reply. By default we only show your item name and message form.",
  },
  {
    q: "What happens if I lose multiple things?",
    a: "Create one tag per item—each QR is unique so messages are automatically linked to the right thing.",
  },
  {
    q: "Can I change or disable a tag later?",
    a: "Yes. You can update item details or archive tags from your dashboard any time.",
  },
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
            Turn any item into a smart, private “return to owner” tag so honest finders can reach you—
            without ever revealing your personal contact details.
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
          <div className="space-y-3 text-center mb-10">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-100">
              How it works for you &amp; the finder
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
              From “oh no, I lost it” to “it’s back with me” in four simple steps.
            </p>
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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

      {/* Features / benefits */}
      <section className="border-t border-slate-800 px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] items-start">
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-100">
                Built for when losing things really matters
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                Tagback is for the everyday disasters: missing keys, left-behind backpacks, a pet that
                slips out, or a phone left in a rideshare. We make it effortless for the honest person
                who finds your stuff to get it back to you.
              </p>
              <ul className="grid sm:grid-cols-2 gap-4 sm:gap-5 pt-2">
                {FEATURES.map(({ title, description }) => (
                  <li
                    key={title}
                    className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 sm:p-4 text-left"
                  >
                    <h3 className="text-slate-200 font-medium text-sm sm:text-base">{title}</h3>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1">{description}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4 rounded-2xl border border-sky-500/30 bg-sky-500/5 p-5 sm:p-6 text-left">
              <p className="text-xs font-semibold tracking-wide uppercase text-sky-300">
                What the finder sees
              </p>
              <p className="text-slate-200 text-sm sm:text-base">
                A clean page with your item name, a short explanation, and a single message box. That’s
                it—no sign-up, no ads, no dark patterns.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                <li className="flex gap-2">
                  <span className="mt-0.5 text-sky-400" aria-hidden>
                    •
                  </span>
                  <span>They confirm what they found and how to reach them.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 text-sky-400" aria-hidden>
                    •
                  </span>
                  <span>You get a private message, tied to that specific item.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 text-sky-400" aria-hidden>
                    •
                  </span>
                  <span>You reply from your dashboard—no phone number exposed.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="border-t border-slate-800 bg-slate-900/40 px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-3 mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-100">Tag what matters</h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
              From everyday carry to bigger trips away from home, Tagback is flexible enough to cover
              the things you really care about.
            </p>
          </div>
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

      {/* FAQ + final CTA */}
      <section className="border-t border-slate-800 px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)] items-start">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-100 mb-4">
              Questions you might have
            </h2>
            <dl className="space-y-4">
              {FAQ_ITEMS.map((item) => (
                <div
                  key={item.q}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 sm:p-4 text-left"
                >
                  <dt className="text-slate-200 text-sm sm:text-base font-medium">{item.q}</dt>
                  <dd className="text-slate-400 text-xs sm:text-sm mt-1">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 text-center lg:text-left">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-100">
              Ready to tag your first item?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Create your first tag, print the QR, and stick it on something you would hate to lose.
              The whole flow takes just a couple of minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 sm:gap-4">
              <GetStartedLink />
              <span className="text-slate-500 text-sm">
                Already using Tagback?{" "}
                <a
                  href="/auth/login"
                  className="text-sky-400 hover:text-sky-300 underline-offset-2 hover:underline"
                >
                  Log in
                </a>
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
