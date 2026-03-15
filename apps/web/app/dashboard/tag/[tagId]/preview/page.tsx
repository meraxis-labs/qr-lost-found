/**
 * FINDER PREVIEW PAGE — Route: /dashboard/tag/[tagId]/preview
 * ------------------------------------------------------------
 * Owner-only. Shows exactly what finders will see (title + message) but
 * does not allow sending a message. Instead shows a placeholder:
 * "Here's where the finder will write their message." The real finder URL
 * remains /f/[tagId] for actual finders.
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { TagRow } from "@/lib/types";
import { tagRowToTag } from "@/lib/types";
import type { Tag } from "@repo/types";

const DEFAULT_TITLE = "You found something?";
const DEFAULT_MESSAGE =
  "This item has a Tagback tag. Send a short message to the owner anonymously — they'll get it without seeing your contact info.";

export default function FinderPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const tagId = typeof params?.tagId === "string" ? params.tagId : null;

  const [user, setUser] = useState<{ id: string } | null>(null);
  const [tag, setTag] = useState<Tag | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (!isMounted) return;
      if (error || !data.user) {
        router.replace("/auth/login");
        return;
      }
      setUser({ id: data.user.id });
    });
    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!user || !tagId) return;
    let isMounted = true;
    void Promise.resolve(
      supabase
        .from("tags")
        .select("*")
        .eq("id", tagId)
        .eq("owner_id", user.id)
        .single()
    ).then(({ data, error }) => {
      if (!isMounted) return;
      if (error || !data) {
        router.replace("/dashboard");
        return;
      }
      setTag(tagRowToTag(data as TagRow));
    }).finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [user, tagId, router]);

  if (!user) return null;
  if (loading) {
    return (
      <main className="flex-1 flex flex-col min-h-0 items-center justify-center px-4 py-6 sm:py-8">
        <p className="text-slate-400">Loading preview…</p>
      </main>
    );
  }
  if (!tag) return null;

  const title = tag.finderTitle?.trim() || DEFAULT_TITLE;
  const message = tag.finderMessage?.trim() || DEFAULT_MESSAGE;

  return (
    <main className="flex-1 flex flex-col min-h-0 items-center justify-center px-4 py-6 sm:py-8 pb-[env(safe-area-inset-bottom)]">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-end">
          <Link
            href={`/dashboard/tag/${tagId}`}
            className="text-sm text-slate-400 hover:text-slate-50 transition-colors"
          >
            ← Back to customize
          </Link>
        </div>
        <p className="text-xs text-slate-500 text-center">
          Preview — finders use the link from your QR or share link to send messages.
        </p>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6 shadow-xl border-dashed border-slate-600">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-50 mb-2">
            {title}
          </h1>
          <p className="text-base sm:text-sm text-slate-400 mb-4 leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
          <div className="rounded-lg bg-slate-900/80 border border-slate-700 border-dashed p-4 min-h-[120px] flex items-center justify-center">
            <p className="text-sm text-slate-500 text-center">
              Here&apos;s where the finder will write their message.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
