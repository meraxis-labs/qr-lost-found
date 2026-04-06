/**
 * Unread message count for the current owner (all tags). Used by the header badge
 * and refreshed after the owner marks messages read on the dashboard.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export const UNREAD_CHANGED_EVENT = "tagback:unread-changed";

export function dispatchUnreadChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(UNREAD_CHANGED_EVENT));
}

export async function fetchUnreadMessageCount(
  supabase: SupabaseClient,
  ownerId: string
): Promise<number> {
  const { data: tagRows, error: tagErr } = await supabase
    .from("tags")
    .select("id")
    .eq("owner_id", ownerId);
  if (tagErr || !tagRows?.length) return 0;
  const ids = tagRows.map((r) => r.id);
  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .in("tag_id", ids)
    .eq("read", false);
  if (error) return 0;
  return count ?? 0;
}
