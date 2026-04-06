/**
 * Optional Cloudflare Turnstile verification (server-side).
 * Set TURNSTILE_SECRET_KEY and NEXT_PUBLIC_TURNSTILE_SITE_KEY to require a token on the finder form.
 */

export async function verifyTurnstileToken(token: string | null): Promise<{
  ok: boolean;
  error?: string;
}> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { ok: true };
  }
  if (!token?.trim()) {
    return { ok: false, error: "Please complete the verification challenge." };
  }

  const body = new URLSearchParams({
    secret,
    response: token.trim(),
  });

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }
  );

  const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
  if (data.success === true) {
    return { ok: true };
  }
  return {
    ok: false,
    error: "Verification failed. Please try again.",
  };
}
