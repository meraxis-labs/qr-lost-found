/**
 * FINDER FORM — Anonymous message form on the finder page
 * -------------------------------------------------------
 * Used on /f/[tagId]. The finder types a message and submits; we insert a row
 * into the "messages" table with tag_id and content. The owner sees it in
 * their dashboard. We don't collect email or name — it's anonymous. After
 * success we show a confirmation and hide the form so they can't double-submit.
 */

"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/types";

type Props = { tagId: string };

// Type for inserting a row into messages — ensures we only send allowed columns.
type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];

export function FinderForm({ tagId }: Props) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  /**
   * handleSubmit: on form submit we insert one row into the messages table.
   * We use the Database type so TypeScript knows the shape (tag_id, content).
   * We don't set finder_token here — the DB or RLS can handle anonymity.
   * After success we set sent=true so we show the success message instead of
   * the form; we also clear content so if the component re-renders we don't
   * show stale text.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const row: MessageInsert = {
      tag_id: tagId,
      content: content.trim(),
    };

    const { error } = await supabase.from("messages").insert(row as never);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
    setContent("");
  };

  // After a successful send we replace the form with a short confirmation.
  if (sent) {
    return (
      <div className="rounded-lg bg-emerald-950/40 border border-emerald-900 p-4 text-base text-emerald-200 leading-relaxed">
        Message sent. The owner will be able to see it in their dashboard.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label htmlFor="finder-message" className="block text-sm font-medium text-slate-200">
        Your message
      </label>
      <textarea
        id="finder-message"
        required
        rows={4}
        placeholder="e.g. I found your wallet at the café on Main St. How can I get it back to you?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 text-base text-slate-50 placeholder:text-slate-500 outline-none focus:border-sky-500 resize-none min-h-[120px]"
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-sky-500 text-slate-950 text-base font-medium py-3 min-h-[48px] hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed transition touch-manipulation"
      >
        {loading ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
