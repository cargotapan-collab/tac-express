// Canonical resolution of the public origin used by `metadataBase`, the
// sitemap, and the robots.txt sitemap reference. Extracted from the inlined
// resolution that originally lived in apps/web/app/(public)/page.tsx (PR
// #164) so the same validation runs in every place that builds an absolute
// public URL — no chance of divergence across SEO surfaces.
//
// `??` only guards against undefined — a CI config that explicitly sets
// NEXT_PUBLIC_SITE_URL="" or a malformed value would crash `new URL(...)`
// at module-eval time. Validate at this env-var boundary with URL.canParse
// (Node ≥19.9; Next.js 16 requires Node 20+, so always available).
//
// On failure (unset, empty string, whitespace-only, malformed) we fall back
// to the production domain so the build never throws.

const FALLBACK_SITE_URL = "https://tacexpress.in"

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()

export const siteUrl =
  rawSiteUrl && URL.canParse(rawSiteUrl) ? rawSiteUrl : FALLBACK_SITE_URL
