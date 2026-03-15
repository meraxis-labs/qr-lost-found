/**
 * SETTINGS PAGE — Route: /dashboard/settings
 * ------------------------------------------
 * Profile and account settings. Shows email (read-only), change-password form,
 * and optional "Send reset email" link. When arriving from password-reset link
 * (?password_reset=1), prompt user to set a new password.
 */

"use client";

import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const inputClass =
  "w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-3 text-base text-slate-50 placeholder:text-slate-500 outline-none focus:border-sky-500 min-h-[48px] touch-manipulation";
const labelClass = "block text-sm font-medium text-slate-200 mb-1";

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPasswordReset = searchParams.get("password_reset") === "1";

  const [user, setUser] = useState<{ id: string; email: string | undefined } | null>(null);
  const [loading, setLoading] = useState(true);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (!isMounted) return;
      if (error || !data.user) {
        router.replace("/auth/login");
        return;
      }
      setUser({
        id: data.user.id,
        email: data.user.email ?? undefined,
      });
    }).finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }

    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);

    if (error) {
      setPasswordError(error.message);
      return;
    }

    setPasswordSuccess(true);
    setNewPassword("");
    setConfirmPassword("");
  };

  if (loading) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <p className="text-slate-400">Loading…</p>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-8 sm:py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-slate-400 hover:text-slate-50 transition-colors inline-flex items-center gap-1.5 touch-manipulation"
        >
          ← Dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-semibold text-slate-100 mb-8">Settings</h1>

      {/* Profile / email */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6 mb-6">
        <h2 className="text-lg font-medium text-slate-200 mb-4">Account</h2>
        <div className="space-y-2">
          <label className={labelClass}>Email</label>
          <p className="text-slate-300 text-base">{user?.email ?? "—"}</p>
        </div>
      </section>

      {/* Change password */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6">
        <h2 className="text-lg font-medium text-slate-200 mb-4">Password</h2>
        {isPasswordReset && (
          <p className="text-sm text-sky-300 bg-sky-950/40 border border-sky-800 rounded-lg px-3 py-2 mb-4">
            Set a new password below.
          </p>
        )}
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="new-password" className={labelClass}>
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className={labelClass}>
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          {passwordError && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
              {passwordError}
            </p>
          )}
          {passwordSuccess && (
            <p className="text-sm text-emerald-300 bg-emerald-950/40 border border-emerald-900 rounded-lg px-3 py-2">
              Password updated.
            </p>
          )}
          <button
            type="submit"
            disabled={passwordLoading}
            className="btn btn-primary w-full sm:w-auto"
          >
            {passwordLoading ? "Updating…" : "Update password"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          Forgot your password?{" "}
          <Link
            href="/auth/forgot-password"
            className="text-sky-400 hover:text-sky-300 underline-offset-2 hover:underline"
          >
            Send reset link
          </Link>
        </p>
      </section>
    </main>
  );
}
