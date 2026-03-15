/**
 * FOOTER — Legal and help links
 * Shown on all pages via root layout.
 */

import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="shrink-0 border-t border-slate-800 bg-slate-950/60 py-6 px-4"
      role="contentinfo"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-slate-500">
        <Link href="/legal/privacy" className="hover:text-slate-300 transition-colors">
          Privacy
        </Link>
        <Link href="/legal/terms" className="hover:text-slate-300 transition-colors">
          Terms
        </Link>
        <Link href="/help" className="hover:text-slate-300 transition-colors">
          FAQ &amp; Help
        </Link>
        <Link href="/contact" className="hover:text-slate-300 transition-colors">
          Contact
        </Link>
      </div>
    </footer>
  );
}
