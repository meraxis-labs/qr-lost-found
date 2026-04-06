"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Route-level error UI — catches runtime errors in the current segment tree.
 */
export default function RouteError({
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
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 min-h-[50dvh]">
      <div className="max-w-md w-full rounded-2xl border border-red-900/60 bg-red-950/30 p-6 text-center space-y-4">
        <h1 className="text-lg font-semibold text-slate-100">
          Something went wrong
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          {error.message || "An unexpected error occurred. You can try again or go back home."}
        </p>
        <div className="flex flex-wrap gap-3 justify-center pt-2">
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
    </main>
  );
}
