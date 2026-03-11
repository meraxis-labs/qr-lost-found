"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { AuthStatus } from "@/components/AuthStatus";
import type { Tag, TagRow } from "@/lib/types";
import { tagRowToTag } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [createLabel, setCreateLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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
    <main className="min-h-screen flex flex-col px-4 py-6">
      <AuthStatus />
      <div className="max-w-2xl w-full mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-slate-50">My tags</h1>
          <a
            href="/"
            className="text-xs text-slate-300 hover:text-slate-50 border border-slate-700 rounded-full px-3 py-1"
          >
            ← Home
          </a>
        </div>

        {/* Create tag form */}
        <form
          onSubmit={handleCreateTag}
          className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 mb-6"
        >
          <label htmlFor="tag-label" className="block text-sm font-medium text-slate-200 mb-2">
            Create a new tag
          </label>
          <div className="flex gap-2">
            <input
              id="tag-label"
              type="text"
              placeholder="e.g. My Wallet, Laptop Bag"
              value={createLabel}
              onChange={(e) => setCreateLabel(e.target.value)}
              className="flex-1 rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              disabled={creating}
              className="rounded-md bg-sky-500 text-slate-950 text-sm font-medium px-4 py-2 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {creating ? "Adding…" : "Add tag"}
            </button>
          </div>
          {createError && (
            <p className="mt-2 text-xs text-red-400">{createError}</p>
          )}
        </form>

        {/* List or empty state */}
        {loading ? (
          <p className="text-sm text-slate-400">Loading your tags…</p>
        ) : tags.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center">
            <p className="text-slate-300 mb-1">No tags yet</p>
            <p className="text-sm text-slate-400">
              Create your first tag above. Each tag gets a unique link you can put on a QR sticker so finders can contact you anonymously.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {tags.map((tag) => (
              <li
                key={tag.id}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex items-center justify-between"
              >
                <div>
                  <span className="font-medium text-slate-200">
                    {tag.label || "Unnamed tag"}
                  </span>
                  <span className="ml-2 text-xs text-slate-500 font-mono">
                    {tag.id.slice(0, 8)}…
                  </span>
                </div>
                <a
                  href={`/f/${tag.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-400 hover:text-sky-300"
                >
                  Finder link →
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
