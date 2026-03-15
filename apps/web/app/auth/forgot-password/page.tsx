/**
 * FORGOT PASSWORD — Route: /auth/forgot-password
 * ----------------------------------------------
 * User enters email; we send a password reset link via Supabase.
 * Success: "Check your email for a reset link." Link back to login.
 */

"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

function getRedirectUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth/callback`;
  }
  return process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    : "";
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const redirectTo = getRedirectUrl();
    if (!redirectTo) {
      setError("Could not determine reset URL. Please try again.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-start">
          <Link
            href="/auth/login"
            className="text-sm text-slate-400 hover:text-slate-50 transition-colors inline-flex items-center gap-1.5 touch-manipulation"
          >
            ← Back to log in
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6 shadow-xl">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-50 mb-2">
            Reset password
          </h1>
          <p className="text-sm text-slate-400 mb-5">
            Enter your email and we&apos;ll send you a link to set a new password.
          </p>

          {sent ? (
            <div className="space-y-4">
              <p className="text-sm text-emerald-300 bg-emerald-950/40 border border-emerald-900 rounded-lg px-3 py-2">
                Check your email for a reset link. It may take a few minutes.
              </p>
              <Link
                href="/auth/login"
                className="block w-full text-center rounded-lg bg-sky-500 text-slate-950 text-base font-medium py-3 min-h-[48px] hover:bg-sky-400 transition touch-manipulation"
              >
                Back to log in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-200"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-3 text-base text-slate-50 placeholder:text-slate-500 outline-none focus:border-sky-500 min-h-[48px] touch-manipulation"
                />
              </div>

              {error && (
                <div className="text-sm bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-sky-500 text-slate-950 text-base font-medium py-3 min-h-[48px] mt-2 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed transition touch-manipulation"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}

          <p className="mt-5 text-sm text-slate-400">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="text-sky-400 hover:text-sky-300 underline-offset-2 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
