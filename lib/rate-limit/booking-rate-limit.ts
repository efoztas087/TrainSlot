const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

const bucket = new Map<string, { count: number; resetAt: number }>();

export function enforceBookingRateLimit(key: string) {
  const now = Date.now();
  const value = bucket.get(key);

  if (!value || value.resetAt < now) {
    bucket.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }

  if (value.count >= MAX_ATTEMPTS) {
    throw new Error("Too many booking attempts. Please try again later.");
  }

  value.count += 1;
  bucket.set(key, value);
}
