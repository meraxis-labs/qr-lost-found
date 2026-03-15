/**
 * TERMS OF SERVICE — Route: /legal/terms
 */

import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Tagback",
  description: "Tagback terms of service."
};

export default function TermsPage() {
  return (
    <main className="flex-1 max-w-3xl mx-auto px-4 py-10 sm:py-14">
      <Link
        href="/"
        className="text-sm text-slate-400 hover:text-slate-50 transition-colors inline-flex items-center gap-1.5 mb-8"
      >
        ← Back
      </Link>
      <h1 className="text-2xl sm:text-3xl font-semibold text-slate-100 mb-6">
        Terms of Service
      </h1>
      <p className="text-slate-400 text-sm mb-8">Last updated: March 2025</p>

      <div className="prose prose-invert prose-slate max-w-none space-y-6 text-slate-300 text-sm sm:text-base">
        <section>
          <h2 className="text-lg font-medium text-slate-200 mt-8 mb-2">1. Acceptance</h2>
          <p>
            By using Tagback (“the service”), you agree to these terms. If you do not agree, do not
            use the service.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-slate-200 mt-8 mb-2">2. Use of the service</h2>
          <p>
            You may use Tagback to create QR tags for your belongings and to receive messages from
            finders. You must not use the service for anything illegal, to harass others, or to
            impersonate anyone. You are responsible for the content of your tags and any messages
            you send in reply to finders.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-slate-200 mt-8 mb-2">3. Account</h2>
          <p>
            You must provide accurate information when signing up. You are responsible for keeping
            your password secure. We may suspend or terminate your account if you breach these terms.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-slate-200 mt-8 mb-2">4. Disclaimer</h2>
          <p>
            The service is provided “as is.” We do not guarantee that finders will message you or
            that lost items will be returned. We are not liable for any loss or damage arising from
            your use of Tagback or from interactions with finders.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-slate-200 mt-8 mb-2">5. Changes</h2>
          <p>
            We may update these terms from time to time. Continued use of the service after changes
            constitutes acceptance. For significant changes we will try to notify you (e.g. by email
            or a notice in the app).
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-slate-200 mt-8 mb-2">6. Contact</h2>
          <p>
            Questions about these terms? Use our{" "}
            <Link href="/contact" className="text-sky-400 hover:text-sky-300 underline-offset-2">
              Contact
            </Link>{" "}
            page.
          </p>
        </section>
      </div>
    </main>
  );
}
