/**
 * GET STARTED LINK — Smart CTA on the landing page
 * -------------------------------------------------
 * A single button that goes to /dashboard if the user is logged in, or
 * /auth/signup if not. The button label changes too ("Go to dashboard" vs
 * "Get started"). We need to know auth state, so we call getUser() on mount
 * and subscribe to onAuthStateChange so we update if they sign in/out without
 * leaving the page.
 */

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function GetStartedLink() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * We only need the user's id to decide href and label; we don't need the
   * full User object. isMounted prevents setState after unmount (e.g. user
   * navigates away before getUser() resolves). We unsubscribe from
   * onAuthStateChange in the cleanup so we don't leave a listener active.
   */
  useEffect(() => {
    let isMounted = true;

    void Promise.resolve(supabase.auth.getUser())
      .then(({ data }) => {
        if (!isMounted) return;
        setUser(data.user ? { id: data.user.id } : null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ? { id: session.user.id } : null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Single destination: dashboard if logged in, signup otherwise.
  const href = user ? "/dashboard" : "/auth/signup";

  return (
    <a href={href} className="btn btn-primary">
      {loading ? "Get started" : user ? "Go to dashboard" : "Get started"}
    </a>
  );
}
