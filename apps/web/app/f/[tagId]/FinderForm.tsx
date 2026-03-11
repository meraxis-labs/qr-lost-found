"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/types";

type Props = { tagId: string };

type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];

export function FinderForm({ tagId }: Props) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

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

  if (sent) {
    return (
      <div className="rounded-md bg-emerald-950/40 border border-emerald-900 p-3 text-sm text-emerald-200">
        Message sent. The owner will be able to see it in their dashboard.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label htmlFor="finder-message" className="block text-xs font-medium text-slate-200">
        Your message
      </label>
      <textarea
        id="finder-message"
        required
        rows={3}
        placeholder="e.g. I found your wallet at the café on Main St. How can I get it back to you?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none focus:border-sky-500 resize-none"
      />
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-sky-500 text-slate-950 text-sm font-medium py-2 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {loading ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
