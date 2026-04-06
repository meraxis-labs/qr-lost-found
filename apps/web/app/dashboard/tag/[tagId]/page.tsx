/**
 * CUSTOMIZE FINDER PAGE — Route: /dashboard/tag/[tagId]
 * ------------------------------------------------------
 * Owner-only. Lets the owner set a custom title and message shown to finders
 * on /f/[tagId]. Save updates the tag; "Preview finder page" opens the owner-only preview (no message form).
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { IconPicker } from "@/components/IconPicker";
import type { TagRow, DbTagUpdate } from "@/lib/types";
import { tagRowToTag } from "@/lib/types";
import type { Tag } from "@repo/types";
import { toast } from "sonner";

const DEFAULT_TITLE = "You found something?";
const DEFAULT_MESSAGE =
  "This item has a Tagback tag. Send a short message to the owner anonymously — they'll get it without seeing your contact info.";

export default function CustomizeFinderPage() {
  const router = useRouter();
  const params = useParams();
  const tagId = typeof params?.tagId === "string" ? params.tagId : null;

  const [user, setUser] = useState<{ id: string } | null>(null);
  const [tag, setTag] = useState<Tag | null>(null);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagLabel, setTagLabel] = useState("");
  const [tagIcon, setTagIcon] = useState<string | null>(null);
  const [finderTitle, setFinderTitle] = useState(DEFAULT_TITLE);
  const [finderMessage, setFinderMessage] = useState(DEFAULT_MESSAGE);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
        .eq("owner_id", user.id)
    ).then(({ data, error }) => {
      if (!isMounted) return;
      if (error || !data) {
        router.replace("/dashboard");
        return;
      }
      const rows = (data ?? []) as TagRow[];
      const tagsList = rows.map((r) => tagRowToTag(r));
      setAllTags(tagsList);
      const t = tagsList.find((x) => x.id === tagId) ?? null;
      if (!t) {
        router.replace("/dashboard");
        return;
      }
      setTag(t);
      setTagLabel(t.label ?? "");
      setTagIcon(t.icon ?? null);
      setFinderTitle(t.finderTitle?.trim() || DEFAULT_TITLE);
      setFinderMessage(t.finderMessage?.trim() || DEFAULT_MESSAGE);
    }).finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [user, tagId, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !tagId) return;
    setSaveError(null);
    setSaveSuccess(false);

    const trimmedLabel = tagLabel.trim();
    const nameExists = allTags.some(
      (t) => t.id !== tagId && (t.label ?? "").trim().toLowerCase() === trimmedLabel.toLowerCase()
    );
    if (nameExists) {
      const msg =
        "A tag with this name already exists. Please choose a different name.";
      setSaveError(msg);
      toast.error(msg);
      return;
    }

    setSaving(true);
    const patch: DbTagUpdate = {
      label: trimmedLabel || null,
      icon: tagIcon ?? null,
      finder_title: finderTitle.trim() || null,
      finder_message: finderMessage.trim() || null,
    };
    const { error } = await supabase
      .from("tags")
      .update(patch)
      .eq("id", tagId)
      .eq("owner_id", user.id);
    setSaving(false);
    if (error) {
      setSaveError(error.message);
      toast.error(error.message);
      return;
    }
    setSaveSuccess(true);
    toast.success("Saved");
    setTag((prev) =>
      prev
        ? {
            ...prev,
            label: trimmedLabel || undefined,
            icon: tagIcon ?? undefined,
            finderTitle: finderTitle.trim() || undefined,
            finderMessage: finderMessage.trim() || undefined,
          }
        : null
    );
  };

  if (!user) return null;
  if (loading) {
    return (
      <main className="flex-1 flex flex-col min-h-0 px-4 py-6 sm:py-8">
        <div className="max-w-2xl w-full mx-auto">
          <p className="text-slate-400">Loading…</p>
        </div>
      </main>
    );
  }
  if (!tag) return null;

  return (
    <main className="flex-1 flex flex-col min-h-0 px-4 py-6 sm:py-8 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-2xl w-full mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-50">
            Customize finder page
          </h1>
          <Link
            href="/dashboard"
            className="text-sm text-slate-300 hover:text-slate-50 border border-slate-700 rounded-full px-4 py-2.5 min-h-[44px] inline-flex items-center touch-manipulation"
          >
            ← Dashboard
          </Link>
        </div>

        <p className="text-slate-400 text-sm mb-4">
          Edit your tag name and icon, and the title and message finders see when
          they scan your tag or open the finder link.
        </p>

        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5 mb-6 space-y-4"
        >
          <div>
            <label
              htmlFor="tag-label"
              className="block text-sm font-medium text-slate-200 mb-2"
            >
              Tag name
            </label>
            <input
              id="tag-label"
              type="text"
              value={tagLabel}
              onChange={(e) => setTagLabel(e.target.value)}
              placeholder="e.g. My Wallet, Laptop Bag"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 text-base text-slate-50 placeholder:text-slate-500 outline-none focus:border-sky-500 min-h-[48px]"
            />
          </div>
          <IconPicker value={tagIcon} onChange={setTagIcon} label="Icon" />
          <div className="border-t border-slate-800 pt-4">
            <span className="block text-sm font-medium text-slate-400 mb-2">
              Finder page (what finders see)
            </span>
          </div>
          <div>
            <label
              htmlFor="finder-title"
              className="block text-sm font-medium text-slate-200 mb-2"
            >
              Title
            </label>
            <input
              id="finder-title"
              type="text"
              value={finderTitle}
              onChange={(e) => setFinderTitle(e.target.value)}
              placeholder={DEFAULT_TITLE}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 text-base text-slate-50 placeholder:text-slate-500 outline-none focus:border-sky-500 min-h-[48px]"
            />
          </div>
          <div>
            <label
              htmlFor="finder-message"
              className="block text-sm font-medium text-slate-200 mb-2"
            >
              Message
            </label>
            <textarea
              id="finder-message"
              rows={4}
              value={finderMessage}
              onChange={(e) => setFinderMessage(e.target.value)}
              placeholder={DEFAULT_MESSAGE}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 text-base text-slate-50 placeholder:text-slate-500 outline-none focus:border-sky-500 resize-none min-h-[120px]"
            />
          </div>
          {saveError && (
            <p className="text-sm text-red-400">{saveError}</p>
          )}
          {saveSuccess && (
            <p className="text-sm text-emerald-400">Saved. Finders will see this when they open your link.</p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-sky-500 text-slate-950 text-base font-medium px-5 py-3 min-h-[48px] hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed transition touch-manipulation"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <Link
              href={`/dashboard/tag/${tagId}/preview`}
              className="rounded-lg text-slate-300 hover:text-slate-50 border border-slate-600 px-5 py-3 min-h-[48px] inline-flex items-center touch-manipulation"
            >
              Preview finder page
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
