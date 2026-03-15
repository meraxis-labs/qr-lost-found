/**
 * PRIVACY POLICY — Route: /legal/privacy
 */

import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Tagback",
  description: "Tagback privacy policy: how we handle your data."
};

export default function PrivacyPage() {
  return (
    <main className="flex-1 max-w-3xl mx-auto px-4 py-10 sm:py-14">
      <Link
        href="/"
        className="text-sm text-slate-400 hover:text-slate-50 transition-colors inline-flex items-center gap-1.5 mb-8"
      >
        ← Back
      </Link>
      <h1 className="text-2xl sm:text-3xl font-semibold text-slate-100 mb-6">
        Privacy Policy
      </h1>
      <p className="text-slate-400 text-sm mb-8">Last updated: March 2025</p>

      <div className="prose prose-invert prose-slate max-w-none space-y-6 text-slate-300 text-sm sm:text-base">
        <section>
          <h2 className="text-lg font-medium text-slate-200 mt-8 mb-2">1. What we collect</h2>
          <p>
            We collect the information you provide when you sign up (email address and password)
            and when you create tags (label, optional message). When someone finds your item and
            sends a message, we store that message and associate it with your tag. We do not
            share your email or phone number with finders unless you choose to reply and provide it.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-slate-200 mt-8 mb-2">2. How we use it</h2>
          <p>
            We use your data to run the service: to let you manage your tags, receive messages
            from finders, and communicate with you (e.g. password reset emails). We do not sell
            your personal information to third parties.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-slate-200 mt-8 mb-2">3. Finders</h2>
          <p>
            People who scan your QR and send a message do so without creating an account. We store
            their message and, if you reply, facilitate that exchange. We do not show your contact
            details to finders unless you explicitly share them in a reply.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-slate-200 mt-8 mb-2">4. Data storage and security</h2>
          <p>
            Data is stored using Supabase (hosted infrastructure). We rely on industry-standard
            security practices. You can delete your account and associated data from the Settings
            page or by contacting us.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-slate-200 mt-8 mb-2">5. Contact</h2>
          <p>
            For privacy-related questions, contact us via the{" "}
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
