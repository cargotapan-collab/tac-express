import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { createMiddlewareClient } from "@workspace/database/middleware"

import { checkPublicApi, checkAuth } from "@/lib/rate-limit"

const PUBLIC_PATHS = ["/sign-in", "/sign-up", "/track", "/"]

const RATE_LIMITED_PUBLIC = ["/track"]
const RATE_LIMITED_AUTH = ["/sign-in"]

function getIdentifier(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous"
  )
}

function tooManyRequests(reset: number): NextResponse {
  return new NextResponse(
    JSON.stringify({
      error: "TOO_MANY_REQUESTS",
      message: "Rate limit exceeded. Please slow down.",
      retryAfterMs: Math.max(0, reset - Date.now()),
    }),
    {
      status: 429,
      headers: {
        "content-type": "application/json",
        "retry-after": String(Math.max(1, Math.ceil((reset - Date.now()) / 1000))),
      },
    },
  )
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const identifier = getIdentifier(req)

  // 1. Rate limit public + auth surfaces (no-op when Upstash env missing)
  if (RATE_LIMITED_PUBLIC.some((p) => pathname.startsWith(p))) {
    const r = await checkPublicApi(identifier)
    if (!r.success) return tooManyRequests(r.reset)
  }
  if (RATE_LIMITED_AUTH.some((p) => pathname.startsWith(p))) {
    const r = await checkAuth(identifier)
    if (!r.success) return tooManyRequests(r.reset)
  }

  // 2. Refresh Supabase session cookies + read user.
  const { supabase, response } = createMiddlewareClient(req)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPublic =
    pathname === "/" || PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  // 3. Redirect unauthenticated users from protected routes to /sign-in
  if (!user && !isPublic) {
    const url = req.nextUrl.clone()
    url.pathname = "/sign-in"
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
