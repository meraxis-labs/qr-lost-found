"use client";

import { useEffect } from "react";
import Link from "next/link";
import "./globals.css";

/**
 * Root error boundary — must define html/body. Catches errors in root layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-[100dvh] flex flex-col items-center justify-center bg-slate-950 text-slate-50 antialiased px-4">
        <div className="max-w-md w-full rounded-2xl border border-red-900/60 bg-red-950/30 p-6 text-center space-y-4">
          <h1 className="text-lg font-semibold text-slate-100">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-400">
            Tagback hit a critical error. Try again or return home.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-lg bg-sky-500 text-slate-950 text-sm font-medium px-4 py-2.5 min-h-[44px] hover:bg-sky-400 transition touch-manipulation"
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded-lg border border-slate-600 text-slate-200 text-sm font-medium px-4 py-2.5 min-h-[44px] inline-flex items-center hover:bg-slate-800/80 transition touch-manipulation"
            >
              Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
