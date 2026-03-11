// Top-bar auth: Log in / Sign up, or user + Log out. No floating widget.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

/**
 * Renders a minimal top bar: home link on the left, auth on the right.
 * When signed in: email + Log out. When not: Log in and Sign up as text links.
 */
export function AuthStatus() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getUser()
      .then(({ data, error: err }) => {
        if (!isMounted) return;
        if (err) {
          const msg = err.message?.toLowerCase() ?? "";
          const isNoSession = msg.includes("session") && (msg.includes("missing") || msg.includes("not found"));
          if (!isNoSession) setError(err.message);
          setUser(null);
        } else {
          setUser(data.user ?? null);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
    const { error: err } = await supabase.auth.signOut();
    if (err) setError(err.message);
    else router.push("/");
  };

  return (
    <header className="w-full border-b border-slate-800/60">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-slate-300 hover:text-slate-50 text-sm font-medium transition">
          Tagback
        </Link>
        <nav className="flex items-center gap-4">
          {loading ? (
            <span className="text-slate-500 text-sm">…</span>
          ) : user ? (
            <>
              <span className="text-slate-500 text-sm truncate max-w-[140px] sm:max-w-[200px]" title={user.email ?? undefined}>
                {user.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-slate-400 hover:text-slate-200 text-sm touch-manipulation"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-slate-400 hover:text-slate-200 text-sm transition">
                Log in
              </Link>
              <Link href="/auth/signup" className="text-slate-400 hover:text-slate-200 text-sm transition">
                Sign up
              </Link>
            </>
          )}
          {error && <span className="text-red-400 text-xs ml-1">{error}</span>}
        </nav>
      </div>
    </header>
  );
}

