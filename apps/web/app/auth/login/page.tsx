"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
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
            Log in to Tagback
          </h1>
          <p className="text-sm text-slate-400 mb-5">
            Use your email and password to sign in.
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-3 text-base text-slate-50 outline-none focus:border-sky-500 min-h-[48px] touch-manipulation"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-sky-500 text-slate-950 text-base font-medium py-3 min-h-[48px] mt-2 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed transition touch-manipulation"
            >
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>

          <p className="mt-5 text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <a
              href="/auth/signup"
              className="text-sky-400 hover:text-sky-300 underline-offset-2 hover:underline"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
