import type { Metadata } from "next"
import { WastelandLanding } from "@workspace/ui/components/composed/wasteland-landing"

// PL-1 (docs/launch/product-launch-readiness.md § C.1) — the landing is the
// most-shared and most-search-indexed URL. Without these tags every social
// share and SERP result rendered as "Home" with no preview, which actively
// undermines credibility. Per § C.1's testable-done criterion: title /
// description / openGraph / twitter are all non-empty here.
//
// Depth is the OD-P7-shaped decision; this ships the FLOOR (Title + OG +
// Twitter Card). JSON-LD + sitemap are deferred until OD-P7 is answered.
//
// `metadataBase` resolves relative `/images/...` URLs into absolute URLs in
// the OG/Twitter payload. Override via NEXT_PUBLIC_SITE_URL at deploy time;
// the fallback is the production domain.
//
// `??` only guards against undefined — a CI config that explicitly sets
// NEXT_PUBLIC_SITE_URL="" or a malformed value would crash `new URL(...)`
// at module-eval time. Validate at this env-var boundary with
// URL.canParse (Node ≥19.9; Next.js 16 requires Node 20+).
const FALLBACK_SITE_URL = "https://tacexpress.in"
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
const siteUrl =
  rawSiteUrl && URL.canParse(rawSiteUrl) ? rawSiteUrl : FALLBACK_SITE_URL

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "TAC Express — North-East India logistics, built for the routes nobody else maps",
  description:
    "TAC Express moves cargo through the corridor most logistics companies treat as a footnote. The network behind tea growers, handicraft cooperatives, defense contractors, and e-commerce sellers across the North-East.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "TAC Express",
    url: "/",
    title: "TAC Express — North-East India logistics",
    description:
      "Cargo through the corridor most logistics companies treat as a footnote. Built for tea growers, handicraft cooperatives, defense contractors, and e-commerce sellers across the North-East.",
    images: [
      {
        url: "/images/tac-truck-hero.webp",
        width: 1200,
        height: 630,
        alt: "TAC Express logistics truck on a North-East India route",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TAC Express — North-East India logistics",
    description:
      "Cargo through the corridor most logistics companies treat as a footnote. Built for the routes nobody else maps.",
    images: ["/images/tac-truck-hero.webp"],
  },
}

export default function Home() {
  return <WastelandLanding />
}
