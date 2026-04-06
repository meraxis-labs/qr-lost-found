/**
 * Browser-only events so the dashboard can merge Supabase Realtime message payloads
 * without duplicating WebSocket subscriptions (subscription lives in AuthStatus).
 */

import type { MessageRow } from "@/lib/types";

export const MESSAGE_REALTIME_EVENT = "tagback:message-realtime";

export type MessageRealtimeDetail = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  newRecord: MessageRow | null;
  oldRecord: MessageRow | null;
};

export function dispatchMessageRealtime(detail: MessageRealtimeDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<MessageRealtimeDetail>(MESSAGE_REALTIME_EVENT, { detail })
  );
}
