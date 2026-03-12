/**
 * FINDER PAGE (public, no login required)
 * ---------------------------------------
 * Route: /f/[tagId] — e.g. /f/abc123-def456
 * When someone scans a Tagback QR code or opens a finder link, they land
 * here. We look up the tag by ID; if it exists and is active, we show
 * the FinderForm so they can send an anonymous message to the owner.
 * If the tag doesn't exist or is inactive, we show the 404 (not-found) page.
 *
 * This is a Server Component: we fetch the tag on the server so the
 * page can render without a loading spinner. The form itself is a Client
 * Component (FinderForm) because it needs useState and form submission.
 */

import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { TagRow } from "@/lib/types";
import { FinderForm } from "@/app/f/[tagId]/FinderForm";

type Props = { params: Promise<{ tagId: string }> };

export default async function FinderPage({ params }: Props) {
  const { tagId } = await params;

  const { data, error } = await supabase
    .from("tags")
    .select("id, label, is_active")
    .eq("id", tagId)
    .eq("is_active", true)
    .single();

  const row = data as Pick<TagRow, "id" | "label" | "is_active"> | null;

  if (error || !row) {
    notFound(); // Renders the not-found.tsx page
  }

  return (
    <main className="flex-1 flex flex-col min-h-0 items-center justify-center px-4 py-6 sm:py-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6 shadow-xl">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-50 mb-2">
          You found something?
        </h1>
        <p className="text-base sm:text-sm text-slate-400 mb-4 leading-relaxed">
          This item has a Tagback tag. Send a short message to the owner
          anonymously — they'll get it without seeing your contact info.
        </p>
        {row.label && (
          <p className="text-sm text-slate-500 mb-4">
            Tag: <span className="text-slate-300">{row.label}</span>
          </p>
        )}
        <FinderForm tagId={tagId} />
      </div>
    </main>
  );
}
