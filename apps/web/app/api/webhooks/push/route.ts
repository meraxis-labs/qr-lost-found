/**
 * POST — Reserved for future push notifications (FCM/APNs, VAPID web push).
 * Wire a queue or provider here; not implemented yet.
 */

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "Push notifications are not implemented yet.",
    },
    { status: 501 }
  );
}
