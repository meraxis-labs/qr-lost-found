/**
 * CONTACT / SUPPORT — Route: /contact
 * Simple way to get in touch for support or general questions.
 */

import Link from "next/link";

export const metadata = {
  title: "Contact — Tagback",
  description: "Contact Tagback for support or questions."
};

const SUPPORT_EMAIL = "support@getmeraxis.com";

export default function ContactPage() {
  return (
    <main className="flex-1 max-w-xl mx-auto px-4 py-10 sm:py-14">
      <Link
        href="/"
        className="text-sm text-slate-400 hover:text-slate-50 transition-colors inline-flex items-center gap-1.5 mb-8"
      >
        ← Back
      </Link>
      <h1 className="text-2xl sm:text-3xl font-semibold text-slate-100 mb-2">
        Contact &amp; Support
      </h1>
      <p className="text-slate-400 text-sm sm:text-base mb-8">
        Have a question, feedback, or need help? Get in touch.
      </p>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
        <p className="text-slate-300 text-sm">
          Email us at{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-sky-400 hover:text-sky-300 underline-offset-2 break-all"
          >
            {SUPPORT_EMAIL}
          </a>
          . We’ll do our best to respond within a few business days.
        </p>
        <p className="text-slate-500 text-sm">
          For account or billing issues, include the email address you use for Tagback so we can
          look up your account.
        </p>
      </div>

      <p className="mt-8 text-slate-500 text-sm">
        <Link href="/help" className="text-sky-400 hover:text-sky-300 underline-offset-2">
          FAQ &amp; Help
        </Link>
        {" · "}
        <Link href="/legal/privacy" className="text-sky-400 hover:text-sky-300 underline-offset-2">
          Privacy
        </Link>
        {" · "}
        <Link href="/legal/terms" className="text-sky-400 hover:text-sky-300 underline-offset-2">
          Terms
        </Link>
      </p>
    </main>
  );
}
