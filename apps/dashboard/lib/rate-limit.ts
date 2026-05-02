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
 * Used to gate /api/public/** and /track/[awb] from abuse.
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
