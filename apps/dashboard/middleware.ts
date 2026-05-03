import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@workspace/database/client"

/**
 * Route-protection middleware.
 *
 * Public surfaces that bypass auth:
 *  - /sign-in, /sign-up  — auth flow
 *  - /track              — public shipment tracking
 *  - /print              — label/manifest print views (token-protected at the
 *                          page level, not session-protected)
 *
 * Everything else requires a valid Supabase session. Unauthenticated requests
 * are redirected to /sign-in?next=<encoded-path>&reason=unauthenticated.
 *
 * The createServerClient call here also rotates the session cookie when
 * Supabase issues a fresh access token (the setAll path), keeping the
 * browser cookie in sync with the server session.
 */

const PUBLIC_PREFIXES = ["/sign-in", "/sign-up", "/track", "/print"]

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublic(pathname)) {
    return NextResponse.next()
  }

  // Create a mutable response so Supabase can rotate the session cookie.
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const db = createServerClient({
    getAll() {
      return request.cookies.getAll()
    },
    set(name, value, options) {
      // Mirror the updated cookie onto both the request (for downstream server
      // components in this request) and the response (sent back to browser).
      request.cookies.set(name, value)
      response = NextResponse.next({
        request: { headers: request.headers },
      })
      response.cookies.set(name, value, options)
    },
  })

  const {
    data: { session },
  } = await db.auth.getSession()

  if (!session) {
    const next = encodeURIComponent(pathname + request.nextUrl.search)
    return NextResponse.redirect(
      new URL(`/sign-in?next=${next}&reason=unauthenticated`, request.url),
    )
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all paths except Next.js internals and static assets.
     * Negative lookahead keeps _next/static, _next/image, and favicon.ico
     * out of middleware so they're always served without an auth check.
     */
    "/((?!_next/static|_next/image|favicon\\.ico).*)",
  ],
}
