"use server";

import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FINDER_MESSAGE_MAX_LENGTH } from "@/lib/finderLimits";
import { allowRateLimit, getFinderRateLimitConfig } from "@/lib/rateLimit";
import { verifyTurnstileToken } from "@/lib/turnstile";

export type SubmitFinderMessageResult =
  | { ok: true }
  | { ok: false; error: string };

async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return h.get("x-real-ip") ?? "unknown";
}

export async function submitFinderMessage(input: {
  tagId: string;
  content: string;
  turnstileToken?: string | null;
}): Promise<SubmitFinderMessageResult> {
  const tagId = input.tagId?.trim() ?? "";
  const content = input.content?.trim() ?? "";

  if (!tagId) {
    return { ok: false, error: "Missing tag." };
  }
  if (!content) {
    return { ok: false, error: "Please enter a message." };
  }
  if (content.length > FINDER_MESSAGE_MAX_LENGTH) {
    return {
      ok: false,
      error: `Message is too long (max ${FINDER_MESSAGE_MAX_LENGTH} characters).`,
    };
  }

  const turnstile = await verifyTurnstileToken(input.turnstileToken ?? null);
  if (!turnstile.ok) {
    return { ok: false, error: turnstile.error ?? "Verification failed." };
  }

  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch {
    return {
      ok: false,
      error: "Service is not configured. Please try again later.",
    };
  }

  const { data: tagRow, error: tagError } = await supabase
    .from("tags")
    .select("id")
    .eq("id", tagId)
    .eq("is_active", true)
    .maybeSingle();

  if (tagError || !tagRow) {
    return { ok: false, error: "This tag is not available." };
  }

  const { max, windowMs } = getFinderRateLimitConfig();
  const ip = await clientIp();
  const rateKey = `finder:${ip}:${tagId}`;
  if (!allowRateLimit(rateKey, max, windowMs)) {
    return {
      ok: false,
      error: "Too many messages from this device. Please try again later.",
    };
  }

  const { error: insertError } = await supabase.from("messages").insert({
    tag_id: tagId,
    content,
  });

  if (insertError) {
    return {
      ok: false,
      error: insertError.message || "Could not send your message.",
    };
  }

  return { ok: true };
}
