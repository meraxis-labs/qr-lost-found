/**
 * SIGNUP PAGE — Route: /auth/signup
 * ---------------------------------
 * New users enter email and password here. Supabase may require email
 * confirmation (configured in the Supabase dashboard). So after signUp():
 * - If there's an error (e.g. weak password), we show it.
 * - If data.user exists but data.session is null, Supabase is waiting for
 *   email confirmation — we show "Check your email".
 * - If data.session exists, they're already signed in (e.g. confirmation
 *   disabled), so we redirect to the dashboard.
 */

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  /**
   * handleSubmit: call supabase.auth.signUp(). We clear previous error and
   * message so the user doesn't see stale feedback. The response tells us
   * whether we got a session (redirect to dashboard), need email confirmation
   * (show message), or got an error (show error string).
   */
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    setLoading(false);

    if (error) {
      const isAlreadyRegistered =
        error.message?.toLowerCase().includes("already registered") ||
        error.message?.toLowerCase().includes("already exists") ||
        error.message?.toLowerCase().includes("user already");
      if (isAlreadyRegistered) {
        setError("An account with this email already exists. Please log in instead.");
      } else {
        setError(error.message);
      }
      return;
    }

    // Supabase returns success for existing emails but with empty identities (no new user created).
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      setError("An account with this email already exists. Please log in instead.");
      return;
    }

    if (data.user && !data.session) {
      setMessage(
        "Signup successful. Please check your email to confirm your account before logging in."
      );
      return;
    }

    if (data.session) {
      window.location.href = "/dashboard";
      return;
    }

    setMessage("Signup request sent. You can try logging in now.");
  };

  const handleResendVerification = async () => {
    if (!email) return;
    setResendLoading(true);
    setResendSent(false);
    const { error } = await supabase.auth.resend({ email, type: "signup" });
    setResendLoading(false);
    if (!error) setResendSent(true);
  };

  const showConfirmMessage = message?.includes("check your email");

  const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "";
  const handleSocialSignup = async (provider: "google" | "github") => {
    if (!redirectTo) return;
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-start">
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-slate-50 transition-colors inline-flex items-center gap-1.5 touch-manipulation"
          >
            ← Back home
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6 shadow-xl">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-50 mb-2">
            Sign up for Tagback
          </h1>
          <p className="text-sm text-slate-400 mb-5">
            Create an account with your email and password.
          </p>

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

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-200"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-3 text-base text-slate-50 outline-none focus:border-sky-500 min-h-[48px] touch-manipulation"
              />
            </div>

            {error && (
              <div className="text-sm bg-red-950/40 border border-red-900 rounded-lg px-3 py-2 space-y-1">
                <p className="text-red-400">{error}</p>
                {error.includes("already exists") && (
                  <p>
                    <Link href="/auth/login" className="text-sky-400 hover:text-sky-300 underline-offset-2 hover:underline">
                      Log in
                    </Link>
                  </p>
                )}
              </div>
            )}

            {message && !error && (
              <div className="text-sm text-emerald-300 bg-emerald-950/40 border border-emerald-900 rounded-lg px-3 py-2 space-y-2">
                <p>{message}</p>
                {showConfirmMessage && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="text-sky-300 hover:text-sky-200 underline disabled:opacity-50"
                  >
                    {resendLoading ? "Sending…" : resendSent ? "Sent! Check your inbox." : "Resend verification email"}
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-sky-500 text-slate-950 text-base font-medium py-3 min-h-[48px] mt-2 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed transition touch-manipulation"
            >
              {loading ? "Signing up…" : "Sign up"}
            </button>

            <p className="text-center text-slate-500 text-sm mt-4">or continue with</p>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => handleSocialSignup("google")}
                className="flex-1 rounded-lg border border-slate-600 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition"
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialSignup("github")}
                className="flex-1 rounded-lg border border-slate-600 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition"
              >
                GitHub
              </button>
            </div>
          </form>

          <p className="mt-4 text-xs text-slate-500 text-center">
            By signing up you agree to our{" "}
            <Link href="/legal/terms" className="text-sky-400 hover:text-sky-300 underline-offset-2">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="text-sky-400 hover:text-sky-300 underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>

          <p className="mt-5 text-sm text-slate-400">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="text-sky-400 hover:text-sky-300 underline-offset-2 hover:underline"
            >
              Log in
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
