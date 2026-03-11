// Simple auth status indicator and logout control for the web app.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

/**
 * Displays the current authenticated user's email (if any) and exposes
 * a basic Logout button. Intended to be dropped into layouts or pages
 * while we flesh out the rest of the UI.
 */
export function AuthStatus() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // On initial load, ask Supabase for the current user (if a session exists).
    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          setError(error.message);
          setUser(null);
        } else {
          setUser(data.user ?? null);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // Subscribe to auth state changes so UI stays in sync with login/logout.
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    setError(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="fixed top-4 right-4 rounded-full bg-slate-900/80 border border-slate-700 px-4 py-2.5 text-sm text-slate-300 min-h-[44px] flex items-center">
        Checking session…
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 rounded-2xl bg-slate-900/80 border border-slate-700 px-4 py-2 flex items-center gap-2 text-sm text-slate-200 min-h-[44px] flex-wrap justify-end max-w-[calc(100vw-2rem)]">
      {user ? (
        <>
          <span className="truncate max-w-[12rem] sm:max-w-[16rem]">
            Signed in as <span className="font-medium">{user.email}</span>
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-slate-600 px-3 py-2 min-h-[44px] text-sm hover:border-slate-400 hover:text-slate-50 transition touch-manipulation"
          >
            Logout
          </button>
        </>
      ) : (
        <span className="flex items-center gap-2 text-slate-400 flex-wrap">
          <span>Not signed in</span>
          <a
            href="/auth/login"
            className="rounded-full border border-slate-600 px-3 py-2 min-h-[44px] inline-flex items-center text-sm hover:border-slate-400 hover:text-slate-50 transition touch-manipulation"
          >
            Login
          </a>
          <a
            href="/auth/signup"
            className="rounded-full border border-slate-600 px-3 py-2 min-h-[44px] inline-flex items-center text-sm hover:border-slate-400 hover:text-slate-50 transition touch-manipulation"
          >
            Signup
          </a>
        </span>
      )}
      {error && <span className="ml-2 text-red-400 text-sm">({error})</span>}
    </div>
  );
}

