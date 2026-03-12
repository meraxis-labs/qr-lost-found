/**
 * LANDING PAGE (Home)
 * ------------------
 * This is the first page users see at "/". It explains what Tagback does
 * and has a single call-to-action: "Get started" (which goes to signup
 * or dashboard depending on login state). Log in / Sign up are in the
 * header (AuthStatus), not on this page.
 */

import { GetStartedLink } from "../components/GetStartedLink";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
      <section className="max-w-lg w-full text-center space-y-8">
        {/* Headline and short value proposition */}
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
        {/* Main CTA: Get started (or "Go to dashboard" if logged in) + Log in link */}
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
        {/* One-line flow explanation */}
        <p className="text-slate-600 text-sm max-w-xs mx-auto">
          Create a tag → print QR → get anonymous messages in your dashboard.
        </p>
      </section>
    </main>
  );
}
