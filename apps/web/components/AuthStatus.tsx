/**
 * AUTH STATUS — Top bar for login and navigation
 * ----------------------------------------------
 * Rendered in the root layout so it appears on every page. Shows "Tagback"
 * (home link) on the left; on the right: loading "…", or user email + Log out,
 * or Log in + Sign up. The header stays in document flow (not position:fixed)
 * so page content never overlaps it on mobile.
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

export function AuthStatus() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * On mount we do two things:
   * 1. getUser() — Check if there's already a session (e.g. user just landed
   *    or came back from login). This runs once when the component mounts.
   * 2. onAuthStateChange() — Subscribe to sign-in/sign-out events so we update
   *    the UI when the user logs in/out in this tab or another tab, without
   *    reloading the page.
   * We use isMounted so we don't call setState after the component has unmounted
   * (e.g. if the user navigates away before the promise resolves), which would
   * cause React warnings and possible bugs.
   */
  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getUser()
      .then(({ data, error: err }) => {
        if (!isMounted) return;
        if (err) {
          const msg = err.message?.toLowerCase() ?? "";
          // "Missing session" or "session not found" is normal when logged out;
          // we only show other errors (e.g. network) in the UI.
          const isNoSession =
            msg.includes("session") &&
            (msg.includes("missing") || msg.includes("not found"));
          if (!isNoSession) setError(err.message);
          setUser(null);
        } else {
          setUser(data.user ?? null);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
    });

    // Cleanup: unsubscribe when the component unmounts so we don't leak listeners.
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * handleLogout: sign out via Supabase and redirect to home. We clear any
   * previous error so the user doesn't see an old message. router.push("/")
   * sends them to the landing page after the session is cleared.
   */
  const handleLogout = async () => {
    setError(null);
    const { error: err } = await supabase.auth.signOut();
    if (err) setError(err.message);
    else router.push("/");
  };

  return (
    <header
      className="shrink-0 w-full border-b border-slate-800/60 bg-slate-950 z-10"
      role="banner"
    >
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="text-slate-300 hover:text-slate-50 text-sm font-medium transition-colors truncate min-w-0"
        >
          Tagback
        </Link>
        <nav className="flex items-center gap-3 sm:gap-4 shrink-0 min-w-0">
          {loading ? (
            <span className="text-slate-500 text-sm" aria-hidden>
              …
            </span>
          ) : user ? (
            <>
              <span
                className="text-slate-500 text-sm truncate max-w-[120px] sm:max-w-[200px]"
                title={user.email ?? undefined}
              >
                {user.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-slate-400 hover:text-slate-200 text-sm touch-manipulation whitespace-nowrap"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-slate-400 hover:text-slate-200 text-sm transition-colors whitespace-nowrap"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="text-slate-400 hover:text-slate-200 text-sm transition-colors whitespace-nowrap"
              >
                Sign up
              </Link>
            </>
          )}
          {error && (
            <span className="text-red-400 text-xs truncate max-w-[80px] sm:max-w-none">
              {error}
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
