"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { TagQR } from "@/components/TagQR";
import type { Tag, TagRow, Message, MessageRow } from "@/lib/types";
import { tagRowToTag, messageRowToMessage } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [messagesByTagId, setMessagesByTagId] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(true);
  const [createLabel, setCreateLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [expandedQRTagId, setExpandedQRTagId] = useState<string | null>(null);

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
    if (!user) return;

    let isMounted = true;

    void Promise.resolve(
      supabase
        .from("tags")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
    )
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          setTags([]);
          return;
        }
        setTags((data as TagRow[]).map(tagRowToTag));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Fetch messages for all tags; mark as read when first loaded (P2 #8).
  useEffect(() => {
    if (tags.length === 0) return;
    const tagIds = tags.map((t) => t.id);
    let isMounted = true;

    void Promise.resolve(
      supabase.from("messages").select("*").in("tag_id", tagIds).order("created_at", { ascending: false })
    )
      .then(async ({ data, error }) => {
        if (!isMounted || error) return;
        const rows = (data ?? []) as MessageRow[];
        const byTag: Record<string, Message[]> = {};
        const unreadIds: string[] = [];
        for (const row of rows) {
          const msg = messageRowToMessage(row);
          byTag[row.tag_id] = byTag[row.tag_id] ?? [];
          byTag[row.tag_id].push(msg);
          if (!row.read) unreadIds.push(row.id);
        }
        setMessagesByTagId(byTag);
        if (unreadIds.length > 0) {
          await supabase.from("messages").update({ read: true } as never).in("id", unreadIds);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [tags]);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !createLabel.trim()) return;
    setCreateError(null);
    setCreating(true);

    const { data, error } = await supabase
      .from("tags")
      .insert({
        owner_id: user.id,
        label: createLabel.trim() || null,
        is_active: true,
      } as never)
      .select()
      .single();

    setCreating(false);

    if (error) {
      setCreateError(error.message);
      return;
    }
    if (data) {
      setTags((prev) => [tagRowToTag(data as TagRow), ...prev]);
      setCreateLabel("");
    }
  };

  if (!user) {
    return null; // redirecting to login
  }

  return (
    <main className="flex-1 flex flex-col min-h-0 px-4 py-6 sm:py-8 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-2xl w-full mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-50">My tags</h1>
          <a
            href="/"
            className="text-sm text-slate-300 hover:text-slate-50 border border-slate-700 rounded-full px-4 py-2.5 min-h-[44px] inline-flex items-center touch-manipulation"
          >
            ← Home
          </a>
        </div>

        {/* Create tag form */}
        <form
          onSubmit={handleCreateTag}
          className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5 mb-6"
        >
          <label htmlFor="tag-label" className="block text-base sm:text-sm font-medium text-slate-200 mb-2">
            Create a new tag
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="tag-label"
              type="text"
              placeholder="e.g. My Wallet, Laptop Bag"
              value={createLabel}
              onChange={(e) => setCreateLabel(e.target.value)}
              className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 text-base text-slate-50 placeholder:text-slate-500 outline-none focus:border-sky-500 min-h-[48px]"
            />
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-sky-500 text-slate-950 text-base font-medium px-5 py-3 min-h-[48px] hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed transition touch-manipulation"
            >
              {creating ? "Adding…" : "Add tag"}
            </button>
          </div>
          {createError && (
            <p className="mt-2 text-sm text-red-400">{createError}</p>
          )}
        </form>

        {/* List or empty state */}
        {loading ? (
          <p className="text-base text-slate-400">Loading your tags…</p>
        ) : tags.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 text-center">
            <p className="text-slate-300 mb-2 text-base">No tags yet</p>
            <p className="text-base sm:text-sm text-slate-400 leading-relaxed">
              Create your first tag above. Each tag gets a unique link you can put on a QR sticker so finders can contact you anonymously.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {tags.map((tag) => {
              const messages = messagesByTagId[tag.id] ?? [];
              const showQR = expandedQRTagId === tag.id;
              return (
                <li
                  key={tag.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-medium text-slate-200 text-base block truncate">
                        {tag.label || "Unnamed tag"}
                      </span>
                      <span className="text-sm text-slate-500 font-mono">
                        {tag.id.slice(0, 8)}…
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={`/f/${tag.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-sky-400 hover:text-sky-300 py-2 px-3 min-h-[44px] inline-flex items-center touch-manipulation"
                      >
                        Finder link →
                      </a>
                      <button
                        type="button"
                        onClick={() => setExpandedQRTagId(showQR ? null : tag.id)}
                        className="text-sm text-slate-300 hover:text-slate-50 border border-slate-600 rounded-lg px-3 py-2.5 min-h-[44px] touch-manipulation"
                      >
                        {showQR ? "Hide QR" : "Show QR"}
                      </button>
                    </div>
                  </div>
                  {showQR && (
                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <TagQR tagId={tag.id} label={tag.label} />
                    </div>
                  )}
                  {messages.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <p className="text-sm font-medium text-slate-400 mb-2">
                        Messages ({messages.length})
                      </p>
                      <ul className="space-y-2">
                        {messages.map((msg) => (
                          <li
                            key={msg.id}
                            className="text-base sm:text-sm text-slate-300 bg-slate-900/60 rounded-lg p-3 border border-slate-800"
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <p className="text-sm text-slate-500 mt-2">
                              {new Date(msg.createdAt).toLocaleString()}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
