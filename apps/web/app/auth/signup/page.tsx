// Signup page for creating a new Supabase email/password account.
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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
      setError(error.message);
      return;
    }

    // Supabase can be configured to require email confirmation.
    if (data.user && !data.session) {
      setMessage(
        "Signup successful. Please check your email to confirm your account before logging in."
      );
      return;
    }

    // If a session is returned immediately, route to the dashboard.
    if (data.session) {
      router.push("/dashboard");
      return;
    }

    setMessage("Signup request sent. You can try logging in now.");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-6 sm:py-8">
      <div className="absolute top-4 left-4">
        <a
          href="/"
          className="text-sm text-slate-300 hover:text-slate-50 border border-slate-700 rounded-full px-4 py-2.5 min-h-[44px] inline-flex items-center touch-manipulation"
        >
          ← Back home
        </a>
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6 shadow-xl">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-50 mb-2">
          Sign up for Tagback
        </h1>
        <p className="text-sm text-slate-400 mb-5">
          Create an account using Supabase Auth email/password.
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
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 text-base text-slate-50 placeholder:text-slate-500 outline-none focus:border-sky-500 min-h-[48px]"
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
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 text-base text-slate-50 outline-none focus:border-sky-500 min-h-[48px]"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {message && !error && (
            <p className="text-sm text-emerald-300 bg-emerald-950/40 border border-emerald-900 rounded-lg px-3 py-2">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-sky-500 text-slate-950 text-base font-medium py-3 min-h-[48px] mt-2 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed transition touch-manipulation"
          >
            {loading ? "Signing up…" : "Sign up"}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-400">
          Already have an account?{" "}
          <a
            href="/auth/login"
            className="text-sky-400 hover:text-sky-300 underline-offset-2 hover:underline"
          >
            Login
          </a>
          .
        </p>
      </div>
    </main>
  );
}

