/**
 * DASHBOARD PAGE — Route: /dashboard
 * -----------------------------------
 * Only for logged-in users. Shows a form to create tags and a list of the
 * user's tags; each tag can show its finder link, a QR code (via TagQR),
 * and messages from finders. If not logged in we redirect to /auth/login.
 * We load tags and messages from Supabase; when we first load messages we
 * mark them as read so the owner has a clear "seen" state.
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { TagQR } from "@/components/TagQR";
import { IconPicker } from "@/components/IconPicker";
import type {
  Tag,
  TagRow,
  Message,
  MessageRow,
  DbTagInsert,
} from "@/lib/types";
import { tagRowToTag, messageRowToMessage } from "@/lib/types";
import { DEFAULT_TAG_ICON_ID, getTagIconEmoji } from "@/lib/tagIcons";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [messagesByTagId, setMessagesByTagId] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(true);
  const [createLabel, setCreateLabel] = useState("");
  const [createIcon, setCreateIcon] = useState<string | null>(DEFAULT_TAG_ICON_ID);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [expandedQRTagId, setExpandedQRTagId] = useState<string | null>(null);
  const [removingTagId, setRemovingTagId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [tagsError, setTagsError] = useState<string | null>(null);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [tagsRetryKey, setTagsRetryKey] = useState(0);
  const [messagesRetryKey, setMessagesRetryKey] = useState(0);

  /**
   * Effect 1 — Auth guard: On mount we check if there's a logged-in user.
   * If not (error or no data.user), we redirect to login with router.replace
   * (replace so the user can't go "back" into the dashboard without logging in).
   * We only need user.id for the rest of the page, so we set user to { id }.
   * isMounted prevents setState after unmount (e.g. redirect happens before
   * getUser() resolves).
   */
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

  /**
   * Effect 2 — Load tags: Once we have a user we fetch all tags where
   * owner_id equals that user's id. We order by created_at descending so
   * newest first. The DB returns rows in snake_case (TagRow); we map them
   * to Tag (camelCase) with tagRowToTag for use in the UI. We set loading
   * to false in finally so the UI shows "Loading…" until this request
   * completes (or errors). If the request fails we set tags to [] so we
   * don't show stale data.
   */
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    setTagsError(null);

    void (async () => {
      try {
        const { data, error } = await supabase
          .from("tags")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });
        if (!isMounted) return;
        if (error) {
          setTagsError(error.message || "Could not load tags.");
          setTags([]);
          return;
        }
        setTags(((data ?? []) as TagRow[]).map(tagRowToTag));
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [user, tagsRetryKey]);

  /**
   * Effect 3 — Load messages and mark as read: Once we have tags we fetch
   * all messages for those tag IDs. We group them by tag_id (messagesByTagId)
   * so each tag card can show its own messages. We also collect unread
   * message IDs and call update({ read: true }) so the first time the owner
   * sees the dashboard after a new message, we mark it read. We use .in("tag_id", tagIds)
   * to get messages for all tags in one query instead of one per tag.
   */
  useEffect(() => {
    if (tags.length === 0) return;
    const tagIds = tags.map((t) => t.id);
    let isMounted = true;
    setMessagesError(null);

    void (async () => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .in("tag_id", tagIds)
          .order("created_at", { ascending: false });
        if (!isMounted) return;
        if (error) {
          setMessagesError(error.message || "Could not load messages.");
          return;
        }
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
          const { error: markError } = await supabase
            .from("messages")
            .update({ read: true })
            .in("id", unreadIds);
          if (!isMounted) return;
          if (markError) {
            setMessagesError(
              markError.message || "Could not mark messages as read."
            );
          }
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        setMessagesError(
          err instanceof Error ? err.message : "Could not load messages."
        );
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [tags, messagesRetryKey]);

  /**
   * handleCreateTag: On form submit we insert a new row into the "tags" table
   * with the current user's id as owner_id, the trimmed label (or null if empty),
   * and is_active: true. We use .select().single() so Supabase returns the
   * newly created row (including its id and created_at). We then prepend it
   * to the tags state so the new tag appears at the top without refetching,
   * and clear the input. If the insert fails we show the error message.
   */
  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !createLabel.trim()) return;
    setCreateError(null);

    const trimmedLabel = createLabel.trim();
    const nameExists = tags.some(
      (t) => (t.label ?? "").trim().toLowerCase() === trimmedLabel.toLowerCase()
    );
    if (nameExists) {
      setCreateError("A tag with this name already exists. Please choose a different name.");
      return;
    }

    setCreating(true);
    const insertPayload: DbTagInsert = {
      owner_id: user.id,
      label: trimmedLabel || null,
      is_active: true,
      icon: createIcon ?? null,
    };
    const { data, error } = await supabase
      .from("tags")
      .insert(insertPayload)
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
      setCreateIcon(DEFAULT_TAG_ICON_ID);
    }
  };

  /**
   * handleRemoveTag: Delete a tag by id. The DB has ON DELETE CASCADE on messages,
   * so the tag's messages are removed automatically. We only allow delete for the
   * current user's tags (RLS enforces this). On success we remove the tag from
   * local state and clear its messages from messagesByTagId.
   */
  const handleRemoveTag = async (tagId: string) => {
    if (!user) return;
    const tagLabel = tags.find((t) => t.id === tagId)?.label ?? "Unnamed tag";
    if (!confirm(`Remove "${tagLabel}"? The finder link will stop working and any messages will be deleted.`)) {
      return;
    }
    setRemoveError(null);
    setRemovingTagId(tagId);
    const { error } = await supabase.from("tags").delete().eq("id", tagId).eq("owner_id", user.id);
    setRemovingTagId(null);
    if (error) {
      setRemoveError(error.message);
      return;
    }
    setTags((prev) => prev.filter((t) => t.id !== tagId));
    setMessagesByTagId((prev) => {
      const next = { ...prev };
      delete next[tagId];
      return next;
    });
  };

  /**
   * While we're redirecting to login (user is null but we haven't left the
   * page yet), we return null so we don't briefly flash the dashboard
   * content. The first effect will call router.replace and then we'll unmount.
   */
  if (!user) {
    return null;
  }

  return (
    <main className="flex-1 flex flex-col min-h-0 px-4 py-6 sm:py-8 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-2xl w-full mx-auto">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-50">My tags</h1>
        </div>

        <form
          onSubmit={handleCreateTag}
          className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5 mb-6 space-y-4"
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
          <IconPicker value={createIcon} onChange={setCreateIcon} />
          {createError && (
            <p className="mt-2 text-sm text-red-400">{createError}</p>
          )}
        </form>

        {removeError && (
          <p className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
            {removeError}
          </p>
        )}

        {tagsError && (
          <div className="mb-4 rounded-lg border border-red-900 bg-red-950/40 px-3 py-3 text-sm text-red-300 space-y-2">
            <p>{tagsError}</p>
            <button
              type="button"
              onClick={() => {
                setTagsError(null);
                setLoading(true);
                setTagsRetryKey((k) => k + 1);
              }}
              className="text-sky-400 hover:text-sky-300 underline touch-manipulation"
            >
              Retry
            </button>
          </div>
        )}

        {messagesError && tags.length > 0 && (
          <div className="mb-4 rounded-lg border border-amber-900/60 bg-amber-950/30 px-3 py-2 text-sm text-amber-200">
            <p className="inline mr-2">{messagesError}</p>
            <button
              type="button"
              onClick={() => {
                setMessagesError(null);
                setMessagesRetryKey((k) => k + 1);
              }}
              className="text-sky-400 hover:text-sky-300 underline touch-manipulation"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-base text-slate-400">Loading your tags…</p>
        ) : tagsError ? null : tags.length === 0 ? (
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
                  <div className="flex flex-col gap-3">
                    <div className="min-w-0 flex items-center gap-3">
                      <span className="text-2xl shrink-0" aria-hidden>
                        {getTagIconEmoji(tag.icon)}
                      </span>
                      <div className="min-w-0">
                        <span className="font-medium text-slate-200 text-base block truncate">
                          {tag.label || "Unnamed tag"}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 w-full">
                      <Link
                        href={`/dashboard/tag/${tag.id}`}
                        className="text-sm text-slate-300 hover:text-slate-50 border border-slate-600 rounded-lg px-3 py-2.5 min-h-[44px] inline-flex items-center justify-center touch-manipulation text-center"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setExpandedQRTagId(showQR ? null : tag.id)}
                        className="text-sm text-slate-300 hover:text-slate-50 border border-slate-600 rounded-lg px-3 py-2.5 min-h-[44px] touch-manipulation"
                      >
                        {showQR ? "Hide QR" : "Show QR"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag.id)}
                        disabled={removingTagId === tag.id}
                        className="text-sm text-red-400 hover:text-red-300 border border-red-900/60 hover:border-red-800 rounded-lg px-3 py-2.5 min-h-[44px] touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {removingTagId === tag.id ? "Removing…" : "Remove"}
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
