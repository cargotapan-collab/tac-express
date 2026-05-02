import type { Metadata } from "next"
import Link from "next/link"
import { RiArrowRightLine, RiCheckLine } from "@workspace/ui/icons"

export const metadata: Metadata = {
  title: "Pricing — TAC Express",
  description:
    "Transparent volume-tier pricing. Per-shipment rates. No setup fee. No surprise minimums.",
}

const PLANS = [
  {
    name: "Starter",
    slug: "starter",
    price: "₹0",
    cadence: "/mo · pay per shipment",
    blurb: "Self-serve, single user. Public API in read-only mode.",
    features: [
      "Up to 100 shipments / month",
      "Public tracking page",
      "Email notifications",
      "Standard SLA on metro pairs",
      "Read-only API access",
    ],
    cta: { href: "/sign-in", label: "Start free" },
  },
  {
    name: "Growth",
    slug: "growth",
    price: "₹4,999",
    cadence: "/mo + per-shipment rate",
    blurb: "For brands shipping 100-2000 packages monthly.",
    features: [
      "Up to 2,000 shipments / month",
      "5 dashboard seats",
      "Webhooks + read/write API",
      "Bulk import (CSV / Excel)",
      "Same-day support response",
    ],
    cta: { href: "/contact?plan=growth", label: "Start trial" },
    featured: true,
  },
  {
    name: "Scale",
    slug: "scale",
    price: "Custom",
    cadence: "volume-tier rate card",
    blurb: "For 3PLs, marketplaces, and enterprise shippers.",
    features: [
      "Unlimited shipments",
      "Unlimited seats",
      "Dedicated rate card per route",
      "Custom SLAs + breach credits",
      "Priority support 24/7",
      "On-prem WMS integration",
    ],
    cta: { href: "/contact?plan=scale", label: "Talk to sales" },
  },
]

export default function PricingPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-card px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <p className="tac-mono-label">04 / Pricing</p>
          <h1 className="mt-3 text-balance text-4xl font-bold md:text-6xl">
            One rate card. No setup tax.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Pricing scales with throughput, not seats. Every plan ships on the same network with the same
            on-time SLA.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.slug}
              className={
                "tac-fui-panel relative flex flex-col p-6 " +
                (plan.featured ? "border-2 border-primary" : "")
              }
            >
              {plan.featured && (
                <span className="absolute -top-3 left-4 inline-flex items-center bg-primary px-2 py-0.5 font-mono text-2xs uppercase tracking-wider text-primary-foreground">
                  Most popular
                </span>
              )}
              <p className="tac-mono-label">{plan.name}</p>
              <p className="mt-3 font-mono text-4xl text-foreground">{plan.price}</p>
              <p className="text-sm text-muted-foreground">{plan.cadence}</p>
              <p className="mt-3 text-sm text-foreground">{plan.blurb}</p>

              <ul className="mt-6 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <RiCheckLine className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.cta.href}
                className={
                  "mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 font-medium tac-fui-hover " +
                  (plan.featured
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background text-foreground")
                }
              >
                {plan.cta.label}
                <RiArrowRightLine className="size-4" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="tac-mono-label">Want a per-route quote?</p>
          <h2 className="mt-2 text-3xl font-bold">Try the rate calculator.</h2>
          <p className="mt-3 text-muted-foreground">
            Live rate-card lookup against the actual production network. No login required.
          </p>
          <Link
            href="/quote"
            className="mt-6 inline-flex items-center gap-2 border-2 border-primary bg-primary px-5 py-3 font-medium text-primary-foreground tac-fui-hover"
          >
            Open the rate calculator
            <RiArrowRightLine className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  )
}
