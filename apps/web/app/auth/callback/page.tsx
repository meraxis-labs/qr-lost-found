/**
 * AUTH CALLBACK — Route: /auth/callback
 * --------------------------------------
 * Supabase redirects here after password reset (or email confirm) with tokens
 * in the URL hash. The client absorbs the session and we redirect to settings.
 * Add this URL to Supabase Dashboard → Auth → URL Configuration → Redirect URLs.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    let isMounted = true;

    async function finish() {
      // Supabase redirects with hash: #access_token=...&refresh_token=...&type=recovery
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      const params = new URLSearchParams(hash.replace(/^#/, ""));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!isMounted) return;
        if (error) {
          setStatus("error");
          return;
        }
        setStatus("ok");
        const target =
          type === "recovery"
            ? "/dashboard/settings?password_reset=1"
            : searchParams.get("next") || "/dashboard/settings";
        router.replace(target);
        return;
      }

      // No tokens in hash — maybe already have session (e.g. refresh)
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (!error && session) {
        setStatus("ok");
        router.replace(searchParams.get("next") || "/dashboard/settings");
        return;
      }

      setStatus("error");
    }

    void finish();
  }, [router, searchParams]);

  if (status === "loading") {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <p className="text-slate-400">Signing you in…</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-sm text-center space-y-4">
          <p className="text-slate-300">
            This link is invalid or has expired. Request a new password reset from the login page.
          </p>
          <Link
            href="/auth/forgot-password"
            className="inline-block rounded-lg bg-sky-500 text-slate-950 text-base font-medium py-3 px-4 hover:bg-sky-400 transition"
          >
            Reset password
          </Link>
          <p className="text-sm text-slate-500">
            <Link href="/auth/login" className="text-sky-400 hover:text-sky-300 underline">
              Back to log in
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <p className="text-slate-400">Redirecting…</p>
    </main>
  );
}
