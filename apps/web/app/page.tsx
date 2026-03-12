/**
 * LANDING PAGE (Home) — Route: /
 * -----------------------------
 * The first page users see. It explains what Tagback does and has one main
 * CTA: "Get started" (or "Go to dashboard" if already logged in). Log in /
 * Sign up live in the header (AuthStatus), not here, to keep the page simple.
 */

import { GetStartedLink } from "../components/GetStartedLink";

export default function HomePage() {
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
