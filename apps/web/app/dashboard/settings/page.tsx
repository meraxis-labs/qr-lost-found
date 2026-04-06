/**
 * SETTINGS PAGE — Route: /dashboard/settings
 * ------------------------------------------
 * Profile and account settings. Shows email (read-only), change-password form,
 * and optional "Send reset email" link. When arriving from password-reset link
 * (?password_reset=1), prompt user to set a new password.
 */

"use client";

import { FormEvent, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const inputClass =
  "w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-3 text-base text-slate-50 placeholder:text-slate-500 outline-none focus:border-sky-500 min-h-[48px] touch-manipulation";
const labelClass = "block text-sm font-medium text-slate-200 mb-1";

function SettingsContent() {
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

  const [displayName, setDisplayName] = useState("");
  const [displayNameLoading, setDisplayNameLoading] = useState(false);
  const [displayNameSuccess, setDisplayNameSuccess] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
      const name = (data.user.user_metadata?.display_name as string) ?? "";
      setDisplayName(name);
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
      const msg = "Password must be at least 6 characters.";
      setPasswordError(msg);
      toast.error(msg);
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = "Passwords don't match.";
      setPasswordError(msg);
      toast.error(msg);
      return;
    }

    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);

    if (error) {
      setPasswordError(error.message);
      toast.error(error.message);
      return;
    }

    setPasswordSuccess(true);
    toast.success("Password updated");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleUpdateDisplayName = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setDisplayNameLoading(true);
    setDisplayNameSuccess(false);
    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName.trim() || null },
    });
    setDisplayNameLoading(false);
    if (!error) {
      setDisplayNameSuccess(true);
      toast.success("Display name saved");
    } else {
      toast.error(error.message);
    }
  };

  const handleChangeEmail = async (e: FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(false);
    if (!newEmail.trim()) return;
    setEmailLoading(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    setEmailLoading(false);
    if (error) {
      setEmailError(error.message);
      toast.error(error.message);
      return;
    }
    setEmailSuccess(true);
    toast.success("Check your new inbox to confirm the email change");
    setUser((u) => (u ? { ...u, email: newEmail.trim() } : null));
    setNewEmail("");
  };

  const handleDeleteAccount = async (e: FormEvent) => {
    e.preventDefault();
    if (deleteConfirm !== "delete my account") return;
    setDeleteError(null);
    setDeleteLoading(true);
    try {
      const auth = supabase.auth as { deleteUser?: () => Promise<{ error: { message?: string } | null }> };
      const result = auth.deleteUser ? await auth.deleteUser() : { error: { message: "Not available" } };
      if (result?.error) {
        const msg =
          result.error.message ||
          "Account deletion is not available. Email support to request deletion.";
        setDeleteError(msg);
        toast.error(msg);
        setDeleteLoading(false);
        return;
      }
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch {
      const msg =
        "Account deletion is not available. Email support to request deletion.";
      setDeleteError(msg);
      toast.error(msg);
    }
    setDeleteLoading(false);
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

      {/* Display name */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6 mb-6">
        <h2 className="text-lg font-medium text-slate-200 mb-4">Display name</h2>
        <p className="text-slate-400 text-sm mb-3">Shown in the header (e.g. &quot;Hi, Alex&quot;). Optional.</p>
        <form onSubmit={handleUpdateDisplayName} className="flex flex-wrap items-end gap-3">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className={inputClass + " flex-1 min-w-0 max-w-xs"}
          />
          <button type="submit" disabled={displayNameLoading} className="btn btn-primary">
            {displayNameLoading ? "Saving…" : "Save"}
          </button>
        </form>
        {displayNameSuccess && (
          <p className="text-sm text-emerald-300 mt-2">Saved.</p>
        )}
      </section>

      {/* Email */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6 mb-6">
        <h2 className="text-lg font-medium text-slate-200 mb-4">Email</h2>
        <p className="text-slate-300 text-base mb-4">Current: {user?.email ?? "—"}</p>
        <form onSubmit={handleChangeEmail} className="space-y-3">
          <input
            type="email"
            inputMode="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="New email address"
            className={inputClass}
          />
          <button type="submit" disabled={emailLoading || !newEmail.trim()} className="btn btn-primary">
            {emailLoading ? "Updating…" : "Change email"}
          </button>
        </form>
        {emailError && <p className="text-sm text-red-400 mt-2">{emailError}</p>}
        {emailSuccess && <p className="text-sm text-emerald-300 mt-2">Check your new inbox to confirm.</p>}
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

      {/* Delete account */}
      <section className="rounded-2xl border border-red-900/50 bg-red-950/20 p-5 sm:p-6 mt-8">
        <h2 className="text-lg font-medium text-slate-200 mb-2">Delete account</h2>
        <p className="text-slate-400 text-sm mb-4">
          Permanently delete your account and all tags and messages. This cannot be undone.
        </p>
        <form onSubmit={handleDeleteAccount} className="space-y-3">
          <input
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder='Type "delete my account" to confirm'
            className={inputClass}
          />
          <button
            type="submit"
            disabled={deleteLoading || deleteConfirm !== "delete my account"}
            className="btn border border-red-600 text-red-300 hover:bg-red-950/40 px-4 py-3 rounded-lg font-medium min-h-[44px] disabled:opacity-50"
          >
            {deleteLoading ? "Deleting…" : "Delete my account"}
          </button>
        </form>
        {deleteError && <p className="text-sm text-red-400 mt-2">{deleteError}</p>}
      </section>
    </main>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <p className="text-slate-400">Loading…</p>
        </main>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
