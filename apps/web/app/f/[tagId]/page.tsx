/**
 * FINDER PAGE — Route: /f/[tagId] (e.g. /f/abc123-def456)
 * --------------------------------------------------------
 * Public page: no login required. When someone scans a Tagback QR or opens
 * a finder link they land here. We look up the tag by ID; if it exists and
 * is_active we show the FinderForm so they can send an anonymous message.
 * If the tag doesn't exist or is inactive we call notFound() and Next.js
 * renders the not-found.tsx page.
 *
 * This is a Server Component: we await params and run the Supabase query on
 * the server, so the initial HTML already has the tag (or 404). That avoids
 * a loading spinner. The form is a Client Component (FinderForm) because it
 * needs useState and form submission.
 */

import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { TagRow } from "@/lib/types";
import { FinderForm } from "@/app/f/[tagId]/FinderForm";

type Props = { params: Promise<{ tagId: string }> };

export default async function FinderPage({ params }: Props) {
  // In Next.js 15, params is a Promise; we await it to get { tagId }.
  const { tagId } = await params;

  const { data, error } = await supabase
    .from("tags")
    .select("id, is_active, finder_title, finder_message")
    .eq("id", tagId)
    .eq("is_active", true)
    .single();

  const row = data as Pick<TagRow, "id" | "is_active" | "finder_title" | "finder_message"> | null;

  if (error || !row) {
    notFound();
  }

  const title =
    row.finder_title?.trim() || "You found something?";
  const message =
    row.finder_message?.trim() ||
    "This item has a Tagback tag. Send a short message to the owner anonymously — they'll get it without seeing your contact info.";

  return (
    <main className="flex-1 flex flex-col min-h-0 items-center justify-center px-4 py-6 sm:py-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6 shadow-xl">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-50 mb-2">
          {title}
        </h1>
        <p className="text-base sm:text-sm text-slate-400 mb-4 leading-relaxed whitespace-pre-wrap">
          {message}
        </p>
        <FinderForm tagId={tagId} />
      </div>
    </main>
  );
}
