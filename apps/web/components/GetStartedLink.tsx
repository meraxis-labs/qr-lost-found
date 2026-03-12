/**
 * GET STARTED LINK — Smart CTA on the landing page
 * -------------------------------------------------
 * Renders a single button that goes to:
 * - /dashboard if the user is already logged in
 * - /auth/signup if they're not
 * We check auth with supabase.auth.getUser() on mount and subscribe to
 * onAuthStateChange so the label and destination update if the user signs
 * in or out without leaving the page.
 */

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function GetStartedLink() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);

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

  const href = user ? "/dashboard" : "/auth/signup";

  return (
    <a href={href} className="btn btn-primary">
      {loading ? "Get started" : user ? "Go to dashboard" : "Get started"}
    </a>
  );
}
