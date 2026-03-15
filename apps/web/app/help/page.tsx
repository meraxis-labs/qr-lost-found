/**
 * FAQ / HELP — Route: /help
 * "How it works", "Is it really anonymous?", "How do I print?"
 */

import Link from "next/link";

export const metadata = {
  title: "FAQ & Help — Tagback",
  description: "How Tagback works, privacy, and how to print your QR tags."
};

const FAQ = [
  {
    q: "How it works",
    a: "Create a tag for your item (e.g. keys, wallet), get a unique QR code, and stick it on the item or save it on your phone. If someone finds it, they scan the QR, see a short message, and can send you a note—no app or account needed. You get the message in your Tagback dashboard and can reply when you choose.",
  },
  {
    q: "Is it really anonymous?",
    a: "Yes. Finders never see your email or phone number unless you decide to share them in a reply. They only see the message you set on the tag (e.g. “Thanks for finding my keys!”) and a form to send you a message. Your contact details stay private until you choose to share them.",
  },
  {
    q: "How do I print my QR?",
    a: "From your dashboard, open a tag and use “Download PNG” to save the QR image, or use “Copy URL” and paste it into any QR generator. Print the image on sticker paper or tape it to your item. You can also show the QR on your phone screen if you prefer not to print.",
  },
  {
    q: "Do finders need an account?",
    a: "No. Anyone who finds your item can scan the QR with their phone camera, type a message, and send—no signup or app install required.",
  },
  {
    q: "What if I lose my account access?",
    a: "Use “Forgot password?” on the login page to get a reset link by email. If you still can’t access your account, contact us via the Contact page.",
  },
];

export default function HelpPage() {
  return (
    <main className="flex-1 max-w-2xl mx-auto px-4 py-10 sm:py-14">
      <Link
        href="/"
        className="text-sm text-slate-400 hover:text-slate-50 transition-colors inline-flex items-center gap-1.5 mb-8"
      >
        ← Back
      </Link>
      <h1 className="text-2xl sm:text-3xl font-semibold text-slate-100 mb-2">
        FAQ &amp; Help
      </h1>
      <p className="text-slate-400 text-sm mb-10">
        How it works, privacy, printing, and more.
      </p>

      <ul className="space-y-8">
        {FAQ.map(({ q, a }) => (
          <li key={q}>
            <h2 className="text-lg font-medium text-slate-200 mb-2">{q}</h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">{a}</p>
          </li>
        ))}
      </ul>

      <p className="mt-12 text-slate-500 text-sm">
        Still have questions?{" "}
        <Link href="/contact" className="text-sky-400 hover:text-sky-300 underline-offset-2">
          Contact us
        </Link>
        .
      </p>
    </main>
  );
}
