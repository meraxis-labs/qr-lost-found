/**
 * DASHBOARD PAGE — Route: /dashboard
 * -----------------------------------
 * Only for logged-in users. Create tags, list with search/sort/filter/pagination,
 * edit label, pause (deactivate) tags, QR, and messages. Unread messages stay
 * unread until the owner expands that tag’s messages (then we mark them read).
 * New messages sync via Supabase Realtime (subscription in AuthStatus); per-message
 * mark unread, delete, and CSV export. Reply-to-finder is deferred to a later flow.
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  DbTagUpdate,
} from "@/lib/types";
import { tagRowToTag, messageRowToMessage } from "@/lib/types";
import { DEFAULT_TAG_ICON_ID, getTagIconEmoji } from "@/lib/tagIcons";
import { toast } from "sonner";
import { dispatchUnreadChanged } from "@/lib/unreadMessages";
import {
  MESSAGE_REALTIME_EVENT,
  type MessageRealtimeDetail,
} from "@/lib/messageRealtime";
import {
  buildMessagesCsv,
  downloadTextFile,
} from "@/lib/exportMessagesCsv";

const PAGE_SIZE = 10;

type SortKey =
  | "newest"
  | "oldest"
  | "label_asc"
  | "label_desc"
  | "messages_desc"
  | "messages_asc";
type FilterKey = "all" | "has_messages" | "no_messages";

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

  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [filterKey, setFilterKey] = useState<FilterKey>("all");
  const [page, setPage] = useState(1);

  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editLabelDraft, setEditLabelDraft] = useState("");
  const [savingLabelId, setSavingLabelId] = useState<string | null>(null);

  const [togglingTagId, setTogglingTagId] = useState<string | null>(null);

  /** Tags whose message list is expanded in the UI (unread tags start collapsed). */
  const [openMessageTags, setOpenMessageTags] = useState<Set<string>>(new Set());

  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);

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
        for (const row of rows) {
          const msg = messageRowToMessage(row);
          byTag[row.tag_id] = byTag[row.tag_id] ?? [];
          byTag[row.tag_id].push(msg);
        }
        setMessagesByTagId(byTag);
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

  /** Auto-expand message panels for tags that have no unread messages. */
  useEffect(() => {
    setOpenMessageTags((prev) => {
      const next = new Set(prev);
      for (const tag of tags) {
        const msgs = messagesByTagId[tag.id] ?? [];
        if (msgs.length === 0) continue;
        if (msgs.every((m) => m.read)) next.add(tag.id);
      }
      return next;
    });
  }, [tags, messagesByTagId]);

  /**
   * Merge Realtime payloads broadcast from AuthStatus (single WebSocket; RLS-scoped).
   */
  useEffect(() => {
    if (!user) return;

    const handler = (e: Event) => {
      const d = (e as CustomEvent<MessageRealtimeDetail>).detail;
      const tagIds = new Set(tags.map((t) => t.id));

      if (d.eventType === "INSERT" && d.newRecord) {
        const row = d.newRecord;
        if (!tagIds.has(row.tag_id)) {
          setMessagesRetryKey((k) => k + 1);
          return;
        }
        const msg = messageRowToMessage(row);
        setMessagesByTagId((prev) => {
          const list = prev[row.tag_id] ?? [];
          if (list.some((m) => m.id === msg.id)) return prev;
          const nextList = [msg, ...list].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          return { ...prev, [row.tag_id]: nextList };
        });
        toast.info("New message");
        return;
      }

      if (d.eventType === "UPDATE" && d.newRecord) {
        const row = d.newRecord;
        if (!tagIds.has(row.tag_id)) {
          setMessagesRetryKey((k) => k + 1);
          return;
        }
        const msg = messageRowToMessage(row);
        setMessagesByTagId((prev) => ({
          ...prev,
          [row.tag_id]: (prev[row.tag_id] ?? []).map((m) =>
            m.id === msg.id ? msg : m
          ),
        }));
        return;
      }

      if (d.eventType === "DELETE" && d.oldRecord) {
        const row = d.oldRecord;
        if (!tagIds.has(row.tag_id)) return;
        setMessagesByTagId((prev) => ({
          ...prev,
          [row.tag_id]: (prev[row.tag_id] ?? []).filter((m) => m.id !== row.id),
        }));
      }
    };

    window.addEventListener(MESSAGE_REALTIME_EVENT, handler as EventListener);
    return () =>
      window.removeEventListener(MESSAGE_REALTIME_EVENT, handler as EventListener);
  }, [user, tags]);

  const markTagMessagesRead = useCallback(async (tagId: string) => {
    const msgs = messagesByTagId[tagId] ?? [];
    const unreadIds = msgs.filter((m) => !m.read).map((m) => m.id);
    if (unreadIds.length === 0) return;
    const { error } = await supabase
      .from("messages")
      .update({ read: true })
      .in("id", unreadIds);
    if (error) {
      toast.error(error.message);
      return;
    }
    setMessagesByTagId((prev) => ({
      ...prev,
      [tagId]: (prev[tagId] ?? []).map((m) => ({ ...m, read: true })),
    }));
    dispatchUnreadChanged();
  }, [messagesByTagId]);

  const handleOpenMessages = (tagId: string) => {
    setOpenMessageTags((prev) => new Set(prev).add(tagId));
    void markTagMessagesRead(tagId);
  };

  const markMessageUnread = async (tagId: string, messageId: string) => {
    const { error } = await supabase
      .from("messages")
      .update({ read: false })
      .eq("id", messageId);
    if (error) {
      toast.error(error.message);
      return;
    }
    setMessagesByTagId((prev) => ({
      ...prev,
      [tagId]: (prev[tagId] ?? []).map((m) =>
        m.id === messageId ? { ...m, read: false } : m
      ),
    }));
    dispatchUnreadChanged();
  };

  const deleteMessage = async (tagId: string, messageId: string) => {
    if (!confirm("Delete this message? This cannot be undone.")) return;
    setDeletingMessageId(messageId);
    const { error } = await supabase.from("messages").delete().eq("id", messageId);
    setDeletingMessageId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    setMessagesByTagId((prev) => ({
      ...prev,
      [tagId]: (prev[tagId] ?? []).filter((m) => m.id !== messageId),
    }));
    dispatchUnreadChanged();
    toast.success("Message deleted");
  };

  const exportMessagesForTag = (tag: Tag) => {
    const messages = messagesByTagId[tag.id] ?? [];
    if (messages.length === 0) return;
    const csv = buildMessagesCsv(tag, messages);
    const safe =
      (tag.label ?? "tag").replace(/[^\w\-]+/g, "_").slice(0, 40) || "tag";
    downloadTextFile(
      `tagback-messages-${safe}-${tag.id.slice(0, 8)}.csv`,
      csv,
      "text/csv"
    );
    toast.success("Export downloaded");
  };

  const unreadTotal = useMemo(() => {
    let n = 0;
    for (const mid of Object.keys(messagesByTagId)) {
      for (const m of messagesByTagId[mid] ?? []) {
        if (!m.read) n += 1;
      }
    }
    return n;
  }, [messagesByTagId]);

  const filteredSortedTags = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = [...tags];

    if (q) {
      list = list.filter((t) => {
        const label = (t.label ?? "").trim().toLowerCase();
        return label.includes(q) || (q === "unnamed" && !t.label?.trim());
      });
    }

    if (filterKey === "has_messages") {
      list = list.filter((t) => (messagesByTagId[t.id]?.length ?? 0) > 0);
    } else if (filterKey === "no_messages") {
      list = list.filter((t) => (messagesByTagId[t.id]?.length ?? 0) === 0);
    }

    const msgCount = (id: string) => messagesByTagId[id]?.length ?? 0;

    list.sort((a, b) => {
      switch (sortKey) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "label_asc": {
          const la = (a.label ?? "").trim().toLowerCase() || "\uffff";
          const lb = (b.label ?? "").trim().toLowerCase() || "\uffff";
          return la.localeCompare(lb);
        }
        case "label_desc": {
          const la = (a.label ?? "").trim().toLowerCase() || "";
          const lb = (b.label ?? "").trim().toLowerCase() || "";
          return lb.localeCompare(la);
        }
        case "messages_desc":
          return msgCount(b.id) - msgCount(a.id);
        case "messages_asc":
          return msgCount(a.id) - msgCount(b.id);
        default:
          return 0;
      }
    });

    return list;
  }, [tags, searchQuery, filterKey, sortKey, messagesByTagId]);

  const totalPages = Math.max(1, Math.ceil(filteredSortedTags.length / PAGE_SIZE));

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const pagedTags = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredSortedTags.slice(start, start + PAGE_SIZE);
  }, [filteredSortedTags, page]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterKey, sortKey]);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !createLabel.trim()) return;
    setCreateError(null);

    const trimmedLabel = createLabel.trim();
    const nameExists = tags.some(
      (t) => (t.label ?? "").trim().toLowerCase() === trimmedLabel.toLowerCase()
    );
    if (nameExists) {
      const msg =
        "A tag with this name already exists. Please choose a different name.";
      setCreateError(msg);
      toast.error(msg);
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
      toast.error(error.message);
      return;
    }
    if (data) {
      setTags((prev) => [tagRowToTag(data as TagRow), ...prev]);
      setCreateLabel("");
      setCreateIcon(DEFAULT_TAG_ICON_ID);
      toast.success("Tag added");
    }
  };

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
      toast.error(error.message);
      return;
    }
    toast.success("Tag removed");
    setTags((prev) => prev.filter((t) => t.id !== tagId));
    setMessagesByTagId((prev) => {
      const next = { ...prev };
      delete next[tagId];
      return next;
    });
    dispatchUnreadChanged();
  };

  const startEditLabel = (tag: Tag) => {
    setEditingTagId(tag.id);
    setEditLabelDraft(tag.label ?? "");
  };

  const cancelEditLabel = () => {
    setEditingTagId(null);
    setEditLabelDraft("");
  };

  const saveEditLabel = async (tagId: string) => {
    if (!user) return;
    const trimmed = editLabelDraft.trim();
    const nameExists = tags.some(
      (t) =>
        t.id !== tagId &&
        (t.label ?? "").trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (nameExists) {
      toast.error("A tag with this name already exists.");
      return;
    }
    setSavingLabelId(tagId);
    const patch: DbTagUpdate = { label: trimmed || null };
    const { error } = await supabase
      .from("tags")
      .update(patch)
      .eq("id", tagId)
      .eq("owner_id", user.id);
    setSavingLabelId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    setTags((prev) =>
      prev.map((t) =>
        t.id === tagId ? { ...t, label: trimmed || undefined } : t
      )
    );
    setEditingTagId(null);
    setEditLabelDraft("");
    toast.success("Tag name updated");
  };

  const handleToggleActive = async (tag: Tag) => {
    if (!user) return;
    const next = !tag.isActive;
    setTogglingTagId(tag.id);
    const { error } = await supabase
      .from("tags")
      .update({ is_active: next })
      .eq("id", tag.id)
      .eq("owner_id", user.id);
    setTogglingTagId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    setTags((prev) =>
      prev.map((t) => (t.id === tag.id ? { ...t, isActive: next } : t))
    );
    toast.success(next ? "Tag activated — finder link works again" : "Tag paused — finder link disabled");
  };

  if (!user) {
    return null;
  }

  return (
    <main className="flex-1 flex flex-col min-h-0 px-4 py-6 sm:py-8 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-2xl w-full mx-auto">
        <div className="mb-6 flex flex-wrap items-center gap-2 justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-50">My tags</h1>
            {unreadTotal > 0 && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-600/80 text-slate-50"
                aria-live="polite"
              >
                {unreadTotal} new
              </span>
            )}
          </div>
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
          <>
            <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-3 sm:p-4 mb-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex-1 block min-w-0">
                  <span className="sr-only">Search tags by name</span>
                  <input
                    type="search"
                    placeholder="Search by name…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 outline-none focus:border-sky-500 min-h-[44px]"
                  />
                </label>
                <div className="flex flex-wrap gap-2 sm:shrink-0">
                  <label className="flex items-center gap-2 text-sm text-slate-400 whitespace-nowrap">
                    <span className="hidden sm:inline">Sort</span>
                    <select
                      value={sortKey}
                      onChange={(e) => setSortKey(e.target.value as SortKey)}
                      className="rounded-lg bg-slate-900 border border-slate-700 px-2 py-2 text-sm text-slate-200 min-h-[44px]"
                    >
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="label_asc">Name A–Z</option>
                      <option value="label_desc">Name Z–A</option>
                      <option value="messages_desc">Most messages</option>
                      <option value="messages_asc">Fewest messages</option>
                    </select>
                  </label>
                  <select
                    value={filterKey}
                    onChange={(e) => setFilterKey(e.target.value as FilterKey)}
                    className="rounded-lg bg-slate-900 border border-slate-700 px-2 py-2 text-sm text-slate-200 min-h-[44px]"
                    aria-label="Filter tags"
                  >
                    <option value="all">All tags</option>
                    <option value="has_messages">Has messages</option>
                    <option value="no_messages">No messages</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Showing {filteredSortedTags.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filteredSortedTags.length)} of {filteredSortedTags.length}
                {filteredSortedTags.length !== tags.length && ` (filtered from ${tags.length})`}
              </p>
            </div>

            {filteredSortedTags.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No tags match your search or filters.</p>
            ) : (
              <>
                <ul className="space-y-3">
                  {pagedTags.map((tag) => {
                    const messages = messagesByTagId[tag.id] ?? [];
                    const showQR = expandedQRTagId === tag.id;
                    const unreadForTag = messages.filter((m) => !m.read).length;
                    const messagesOpen =
                      messages.length === 0 ||
                      openMessageTags.has(tag.id) ||
                      (unreadForTag === 0 && messages.length > 0);

                    return (
                      <li
                        key={tag.id}
                        className={`rounded-xl border bg-slate-900/40 p-4 sm:p-5 ${
                          tag.isActive ? "border-slate-800" : "border-amber-900/50 opacity-90"
                        }`}
                      >
                        <div className="flex flex-col gap-3">
                          <div className="min-w-0 flex items-start gap-3">
                            <span className="text-2xl shrink-0" aria-hidden>
                              {getTagIconEmoji(tag.icon)}
                            </span>
                            <div className="min-w-0 flex-1">
                              {editingTagId === tag.id ? (
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <input
                                    type="text"
                                    value={editLabelDraft}
                                    onChange={(e) => setEditLabelDraft(e.target.value)}
                                    className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-base text-slate-50 outline-none focus:border-sky-500 min-h-[44px]"
                                    autoFocus
                                    aria-label="Tag name"
                                  />
                                  <div className="flex gap-2 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => void saveEditLabel(tag.id)}
                                      disabled={savingLabelId === tag.id}
                                      className="rounded-lg bg-sky-500 text-slate-950 text-sm font-medium px-3 py-2 min-h-[44px] disabled:opacity-50"
                                    >
                                      {savingLabelId === tag.id ? "Saving…" : "Save"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={cancelEditLabel}
                                      className="rounded-lg border border-slate-600 text-slate-300 text-sm px-3 py-2 min-h-[44px]"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-medium text-slate-200 text-base block truncate">
                                    {tag.label || "Unnamed tag"}
                                  </span>
                                  {!tag.isActive && (
                                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-950/80 text-amber-200 border border-amber-800/60">
                                      Paused
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => startEditLabel(tag)}
                                    className="text-xs text-sky-400 hover:text-sky-300 underline touch-manipulation"
                                  >
                                    Rename
                                  </button>
                                </div>
                              )}
                              <p className="text-xs text-slate-500 mt-1">
                                {messages.length} message{messages.length === 1 ? "" : "s"}
                                {unreadForTag > 0 && (
                                  <span className="text-sky-400 font-medium"> · {unreadForTag} new</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
                            <Link
                              href={`/dashboard/tag/${tag.id}`}
                              className="text-sm text-slate-300 hover:text-slate-50 border border-slate-600 rounded-lg px-3 py-2.5 min-h-[44px] inline-flex items-center justify-center touch-manipulation text-center"
                            >
                              Customize
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
                              onClick={() => void handleToggleActive(tag)}
                              disabled={togglingTagId === tag.id}
                              className="text-sm text-slate-300 hover:text-slate-50 border border-slate-600 rounded-lg px-3 py-2.5 min-h-[44px] touch-manipulation disabled:opacity-50 sm:col-span-1 col-span-2"
                            >
                              {togglingTagId === tag.id
                                ? "…"
                                : tag.isActive
                                  ? "Pause tag"
                                  : "Activate"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag.id)}
                              disabled={removingTagId === tag.id}
                              className="text-sm text-red-400 hover:text-red-300 border border-red-900/60 hover:border-red-800 rounded-lg px-3 py-2.5 min-h-[44px] touch-manipulation disabled:opacity-50 col-span-2 sm:col-span-3"
                            >
                              {removingTagId === tag.id ? "Removing…" : "Remove tag"}
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
                            {!messagesOpen ? (
                              <button
                                type="button"
                                onClick={() => handleOpenMessages(tag.id)}
                                className="w-full text-left rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-200 hover:border-sky-600/60 transition touch-manipulation"
                              >
                                Show {messages.length} message{messages.length === 1 ? "" : "s"}
                                {unreadForTag > 0 && (
                                  <span className="text-sky-400 font-medium">
                                    {" "}
                                    ({unreadForTag} new)
                                  </span>
                                )}
                              </button>
                            ) : (
                              <>
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                  <p className="text-sm font-medium text-slate-400">
                                    Messages ({messages.length})
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => exportMessagesForTag(tag)}
                                    className="text-xs text-sky-400 hover:text-sky-300 border border-slate-600 rounded-lg px-2.5 py-1.5 min-h-[36px] touch-manipulation"
                                  >
                                    Export CSV
                                  </button>
                                </div>
                                <ul className="space-y-2">
                                  {messages.map((msg) => (
                                    <li
                                      key={msg.id}
                                      className="text-base sm:text-sm text-slate-300 bg-slate-900/60 rounded-lg p-3 border border-slate-800"
                                    >
                                      <p className="whitespace-pre-wrap">{msg.content}</p>
                                      <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <p className="text-sm text-slate-500 flex-1 min-w-0">
                                          {new Date(msg.createdAt).toLocaleString()}
                                          {msg.read ? "" : " · Unread"}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5 shrink-0">
                                          {msg.read && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                void markMessageUnread(tag.id, msg.id)
                                              }
                                              className="text-xs text-slate-400 hover:text-slate-200 border border-slate-600 rounded px-2 py-1 touch-manipulation"
                                            >
                                              Mark unread
                                            </button>
                                          )}
                                          <button
                                            type="button"
                                            disabled={deletingMessageId === msg.id}
                                            onClick={() =>
                                              void deleteMessage(tag.id, msg.id)
                                            }
                                            className="text-xs text-red-400 hover:text-red-300 border border-red-900/50 rounded px-2 py-1 touch-manipulation disabled:opacity-50"
                                          >
                                            {deletingMessageId === msg.id
                                              ? "…"
                                              : "Delete"}
                                          </button>
                                        </div>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {totalPages > 1 && (
                  <nav
                    className="mt-6 flex flex-wrap items-center justify-center gap-2"
                    aria-label="Tag list pagination"
                  >
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 disabled:opacity-40 min-h-[44px] touch-manipulation"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-slate-400 px-2">
                      Page {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 disabled:opacity-40 min-h-[44px] touch-manipulation"
                    >
                      Next
                    </button>
                  </nav>
                )}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
