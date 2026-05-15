// Edge-compatible rate limiter backed by Upstash Redis.
//
// IMPORTANT: To activate, set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
// in your environment. Without those, every request is allowed (no-op).
// This keeps local dev unblocked while production stays protected.

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN

const redis =
  url && token
    ? new Redis({ url, token })
    : null

/**
 * Public-API rate limit: sliding window, 60 req / minute / identifier.
 *
 * @bucket   `ratelimit:public`
 * @scope    Per-IP for unauthenticated callers; per-user-id when a session is present
 * @consumed by:
 *   - GET /api/public/invoice-pdf  (signed-URL HMAC, IP-scoped)
 *   - GET /track/[awb]             (public tracking, IP-scoped)
 *
 * If you add a new endpoint that uses this bucket, add it to this list
 * to prevent silent collisions (per audit #101 / tracking #102).
 */
export const publicApiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      analytics: true,
      prefix: "ratelimit:public",
    })
  : null

/**
 * Auth-flow rate limit: stricter to deter credential stuffing.
 *
 * @bucket   `ratelimit:auth`
 * @scope    Per-email or per-IP (whichever the auth handler chooses)
 * @consumed by:
 *   - POST /api/diagnostics/sentry  (gated to MANAGER+ but still limited)
 *   - GET  /api/whatsapp/test       (operator-config probe)
 *
 * 10 attempts / minute / identifier.
 */
export const authRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: true,
      prefix: "ratelimit:auth",
    })
  : null

/**
 * WhatsApp / Lemin AI send-template rate limit. Each delivered message is
 * billed by Meta + WPBox, so the cap protects against runaway loops, hostile
 * scripts, and accidental abuse from a compromised or curious user.
 *
 * @bucket   `ratelimit:whatsapp`
 * @scope    Per-authenticated-user-id (`user:${user.id}`)
 * @consumed by:
 *   - POST /api/whatsapp/send-invoice  (operator-triggered template send)
 *
 * 30 requests / minute / authenticated user identifier.
 */
export const whatsappRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      analytics: true,
      prefix: "ratelimit:whatsapp",
    })
  : null

/** Result type returned to middleware. */
export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/** No-op fallback when Redis is not configured. */
const noopResult: RateLimitResult = {
  success: true,
  limit: 0,
  remaining: 0,
  reset: 0,
}

export async function checkPublicApi(
  identifier: string
): Promise<RateLimitResult> {
  if (!publicApiRateLimit) return noopResult
  return publicApiRateLimit.limit(identifier)
}

export async function checkAuth(
  identifier: string
): Promise<RateLimitResult> {
  if (!authRateLimit) return noopResult
  return authRateLimit.limit(identifier)
}

export async function checkWhatsApp(
  identifier: string
): Promise<RateLimitResult> {
  if (!whatsappRateLimit) return noopResult
  return whatsappRateLimit.limit(identifier)
}
