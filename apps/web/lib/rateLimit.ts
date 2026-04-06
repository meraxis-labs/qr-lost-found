/**
 * Simple in-memory rate limiter for serverless-friendly deploys (single instance).
 * For multi-instance production, prefer Redis (e.g. Upstash) or Edge Config.
 */

type Bucket = number[];

const store = new Map<string, Bucket>();

function prune(bucket: Bucket, windowMs: number, now: number): Bucket {
  const cutoff = now - windowMs;
  return bucket.filter((t) => t > cutoff);
}

/**
 * Returns true if the request is allowed, false if the limit was exceeded.
 * Key should include something stable per actor (e.g. IP + resource id).
 */
export function allowRateLimit(
  key: string,
  max: number,
  windowMs: number
): boolean {
  const now = Date.now();
  let bucket = store.get(key) ?? [];
  bucket = prune(bucket, windowMs, now);
  if (bucket.length >= max) {
    store.set(key, bucket);
    return false;
  }
  bucket.push(now);
  store.set(key, bucket);
  return true;
}

export function getFinderRateLimitConfig(): { max: number; windowMs: number } {
  const max = Number.parseInt(process.env.FINDER_RATE_LIMIT_MAX ?? "8", 10);
  const windowHours = Number.parseFloat(
    process.env.FINDER_RATE_LIMIT_WINDOW_HOURS ?? "24"
  );
  const windowMs = Math.max(60_000, Math.round(windowHours * 3_600_000));
  return {
    max: Number.isFinite(max) && max > 0 ? max : 8,
    windowMs: Number.isFinite(windowMs) ? windowMs : 86_400_000,
  };
}
