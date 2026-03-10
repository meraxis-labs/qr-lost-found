// Login page for email/password authentication via Supabase.
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
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

    // On successful login, redirect to the homepage for now.
    router.push("/");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute top-4 left-4">
        <a
          href="/"
          className="text-xs text-slate-300 hover:text-slate-50 border border-slate-700 rounded-full px-3 py-1"
        >
          ← Back home
        </a>
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-xl">
        <h1 className="text-lg font-semibold text-slate-50 mb-1">
          Login to Tagback
        </h1>
        <p className="text-xs text-slate-400 mb-4">
          Use your email and password managed by Supabase Auth.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-xs font-medium text-slate-200"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1.5 text-sm text-slate-50 outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-xs font-medium text-slate-200"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1.5 text-sm text-slate-50 outline-none focus:border-sky-500"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-md px-2 py-1">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-sky-500 text-slate-950 text-sm font-medium py-1.5 mt-2 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>

        <p className="mt-4 text-[11px] text-slate-400">
          Don&apos;t have an account?{" "}
          <a
            href="/auth/signup"
            className="text-sky-400 hover:text-sky-300 underline-offset-2 hover:underline"
          >
            Sign up
          </a>
          .
        </p>
      </div>
    </main>
  );
}

