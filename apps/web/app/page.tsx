import { AuthStatus } from "../components/AuthStatus";
import { GetStartedLink } from "../components/GetStartedLink";

/**
 * Marketing / landing page for the Tagback web app.
 * Get started → signup or dashboard (if logged in). Login / Sign up go to auth.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Global auth status + Logout button lives in the top-right corner. */}
      <AuthStatus />
      {/* Hero section: product positioning + primary CTAs */}
      <section className="max-w-3xl w-full space-y-6 text-center">
        <p className="text-sm font-semibold tracking-[0.25em] text-slate-400 uppercase">
          Meraxis Tagback
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          QR lost &amp; found,
          <span className="text-sky-400"> without giving up privacy.</span>
        </h1>
        <p className="text-slate-300 text-base md:text-lg">
          Print QR stickers, attach them to your valuables, and let finders
          contact you anonymously via Supabase-powered messaging.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
          <GetStartedLink />
          <a
            href="#how-it-works"
            className="btn btn-outline"
          >
            How it works
          </a>
          <a
            href="/auth/login"
            className="btn btn-outline"
          >
            Login
          </a>
          <a
            href="/auth/signup"
            className="btn btn-outline"
          >
            Sign up
          </a>
        </div>
      </section>

      {/* Three-column explainer for the main value props / flow */}
      <section
        id="how-it-works"
        className="mt-16 grid gap-6 md:grid-cols-3 max-w-4xl w-full"
      >
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-left">
          <h2 className="text-sm font-semibold text-slate-300 mb-1">
            1. Create tags
          </h2>
          <p className="text-sm text-slate-400">
            Generate QR codes for each item. Tags are linked to an anonymous
            Supabase profile, not raw contact info.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-left">
          <h2 className="text-sm font-semibold text-slate-300 mb-1">
            2. Attach &amp; forget
          </h2>
          <p className="text-sm text-slate-400">
            Print and stick them on your valuables. If something gets lost, the
            QR routes finders to a safe contact form.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-left">
          <h2 className="text-sm font-semibold text-slate-300 mb-1">
            3. Get anonymous pings
          </h2>
          <p className="text-sm text-slate-400">
            Messages land in your owner dashboard, backed by Supabase Auth,
            without exposing phone numbers or email.
          </p>
        </div>
      </section>

      {/* CTA: sign up to create tags and get finder links (P0/P1 done). */}
      <section
        id="get-started"
        className="mt-16 max-w-xl w-full text-center text-sm text-slate-400"
      >
        <p>
          Create an account to add your first tag and get a unique finder link.
          Put it on a QR sticker so anyone who finds your item can message you
          anonymously.
        </p>
      </section>
    </main>
  );
}
