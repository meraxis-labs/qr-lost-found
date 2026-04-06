/**
 * POST — Database webhook target for new finder messages (email notify owner).
 *
 * Configure in Supabase: Database → Webhooks → Create, table `messages`, events INSERT,
 * HTTP Request to `https://<your-domain>/api/webhooks/new-message` with header
 * `Authorization: Bearer <TAGBACK_WEBHOOK_SECRET>`.
 *
 * Requires `SUPABASE_SERVICE_ROLE_KEY` to resolve the owner email. Optional: `RESEND_API_KEY`
 * + `RESEND_FROM_EMAIL` to send mail via Resend.
 */

import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { getPublicSiteUrl } from "@/lib/siteUrl";
import type { TagRow } from "@/lib/types";

export async function POST(request: Request) {
  const secret = process.env.TAGBACK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "TAGBACK_WEBHOOK_SECRET is not set" },
      { status: 503 }
    );
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const table = (body as { table?: string }).table;
  const record = (
    body as {
      record?: { id?: string; tag_id?: string; content?: string | null };
    }
  ).record;

  if (table !== "messages" || !record?.tag_id) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY is not set" },
      { status: 503 }
    );
  }

  const { data: tagRow, error: tagErr } = await admin
    .from("tags")
    .select("label, owner_id")
    .eq("id", record.tag_id)
    .maybeSingle();

  const tag = tagRow as Pick<TagRow, "label" | "owner_id"> | null;

  if (tagErr || !tag) {
    return NextResponse.json({ ok: false, error: "Tag not found" }, { status: 404 });
  }

  const { data: userData, error: userErr } = await admin.auth.admin.getUserById(
    tag.owner_id
  );

  if (userErr || !userData.user?.email) {
    return NextResponse.json(
      { ok: false, error: "Owner email not available" },
      { status: 422 }
    );
  }

  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!resendKey || !from) {
    return NextResponse.json({ ok: true, skipped: "email_not_configured" });
  }

  const base = getPublicSiteUrl();
  const dashboardUrl = `${base}/dashboard`;
  const label = tag.label?.trim() || "Unnamed tag";
  const content = record.content ?? "";
  const preview = content.slice(0, 200);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: userData.user.email,
      subject: `Tagback: new message on ${label}`,
      text: `You received a new message on tag "${label}".\n\n${preview}${content.length > 200 ? "…" : ""}\n\nOpen your dashboard: ${dashboardUrl}`,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    return NextResponse.json({ ok: false, error: t }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
