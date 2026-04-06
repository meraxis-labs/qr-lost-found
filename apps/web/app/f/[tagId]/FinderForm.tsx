/**
 * FINDER FORM — Anonymous message via Server Action
 * ---------------------------------------------------
 * Submits through submitFinderMessage (rate limit, optional Turnstile, length cap).
 */

"use client";

import { FormEvent, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { submitFinderMessage } from "@/app/f/[tagId]/actions";
import { FINDER_MESSAGE_MAX_LENGTH } from "@/lib/finderLimits";

type Props = { tagId: string };

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export function FinderForm({ tagId }: Props) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = content.trim();
    if (!trimmed) {
      setError("Please enter a message.");
      return;
    }
    if (trimmed.length > FINDER_MESSAGE_MAX_LENGTH) {
      setError(
        `Message is too long (max ${FINDER_MESSAGE_MAX_LENGTH} characters).`
      );
      return;
    }
    if (turnstileSiteKey && !turnstileToken) {
      setError("Please complete the verification challenge.");
      return;
    }

    setLoading(true);
    const result = await submitFinderMessage({
      tagId,
      content: trimmed,
      turnstileToken: turnstileSiteKey ? turnstileToken : undefined,
    });
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSent(true);
    setContent("");
    setTurnstileToken(null);
  };

  if (sent) {
    return (
      <div className="rounded-lg bg-emerald-950/40 border border-emerald-900 p-4 text-base text-emerald-200 leading-relaxed">
        Message sent. The owner will be able to see it in their dashboard.
      </div>
    );
  }

  const remaining = FINDER_MESSAGE_MAX_LENGTH - content.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label htmlFor="finder-message" className="block text-sm font-medium text-slate-200">
        Your message
      </label>
      <textarea
        id="finder-message"
        required
        maxLength={FINDER_MESSAGE_MAX_LENGTH}
        rows={4}
        placeholder="e.g. I found your wallet at the café on Main St. How can I get it back to you?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 text-base text-slate-50 placeholder:text-slate-500 outline-none focus:border-sky-500 resize-none min-h-[120px]"
      />
      <p className="text-xs text-slate-500 text-right tabular-nums" aria-live="polite">
        {remaining} characters left
      </p>
      {turnstileSiteKey ? (
        <div className="flex justify-center">
          <Turnstile
            siteKey={turnstileSiteKey}
            onSuccess={setTurnstileToken}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
          />
        </div>
      ) : null}
      {error && <p className="text-sm text-red-400">{error}</p>}
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
