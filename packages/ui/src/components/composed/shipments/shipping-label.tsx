"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

/* ════════════════════════════════════════════════════════════════════════ */
/*  Public API                                                               */
/*                                                                           */
/*  `ShippingLabelData` is preserved from the prior contract so existing     */
/*  callers (`/print/label/[awb]`, `/print/invoice-label/[id]`) keep         */
/*  working. The 7-zone mission-control rendering happens internally.        */
/* ════════════════════════════════════════════════════════════════════════ */

export interface ShippingLabelData {
  awbNumber: string
  origin: string
  destination: string
  serviceLevel: string
  paymentMode: string

  senderName: string
  senderPhone?: string
  senderAddress: string

  receiverName: string
  receiverPhone?: string
  receiverAddress: string

  pieces?: number
  weightKg?: number
  description?: string
  orderRef?: string

  companyName?: string
  /** ISO date — used as the MSN timestamp anchor. Defaults to "now". */
  shipDate?: string
}

interface ShippingLabelProps {
  data: ShippingLabelData
  /**
   * Render variant.
   * - `"print"` — 4in physical width (default). Pairs with `PRINT_PAGE_SIZES.Thermal4x6`.
   * - `"preview"` — 420px screen preview (slightly larger than print for readability).
   */
  size?: "print" | "preview"
  /** Centered footer compliance line. */
  handlerInstruction?: string
  className?: string
}

/* ════════════════════════════════════════════════════════════════════════ */
/*  ShippingLabel                                                            */
/*                                                                           */
/*  FBA-anatomy 7-zone shipping label, retoned for TAC Orbital:              */
/*                                                                           */
/*    ┌─ Zone 1 ─────────────────────────────────────────────────────┐      */
/*    │  TAC EXPRESS                          Box 01 of 01 — 1.2 kg  │      */
/*    ├─ Zone 2 ─────────────────────────────────────────────────────┤      */
/*    │  ORIGIN                  │  DESTINATION                       │      */
/*    │  Sender Name             │  NODE: NEW DELHI                   │      */
/*    │  sender address …        │  Receiver Name + address …         │      */
/*    ├─ Zone 3 (inverted) ──────────────────────────────────────────┤      */
/*    │  MSN (05.05.26 02:41 UTC)                              — 01  │      */
/*    ├─ Zone 4 ─────────────────────────────────────────────────────┤      */
/*    │  ▌▐█▌▐█▌▐▌▌▐█▌▐▌▌▐█▌▌▐█▌▐▌▌▐▌  │  ┌─Data Matrix─┐         │      */
/*    │     (Code 128, stretched)        │  └─────────────┘         │      */
/*    ├─ Zone 5 + 6 ─────────────────────────────────────────────────┤      */
/*    │  TAC26050514110001              Mixed Payload                │      */
/*    │                                 KM-SSHL-KJ9N                 │      */
/*    │                                 Qty 1                        │      */
/*    ├─ Zone 7 ─────────────────────────────────────────────────────┤      */
/*    │            DO NOT COVER — KEEP LABEL VISIBLE                 │      */
/*    └──────────────────────────────────────────────────────────────┘      */
/*                                                                           */
/*  Typography:                                                              */
/*    - Single monospaced family (`font-mono` → IBM Plex Mono)               */
/*    - Two weights: regular (default) + medium 500                          */
/*    - ALL CAPS only for section labels and the handler instruction         */
/*    - Mixed-case for address bodies                                        */
/*    - No color, no decoration — paper-white background, ink-black text    */
/* ════════════════════════════════════════════════════════════════════════ */

const ShippingLabel = React.forwardRef<HTMLDivElement, ShippingLabelProps>(
  function ShippingLabel(
    {
      data,
      size = "print",
      handlerInstruction = "DO NOT COVER — KEEP LABEL VISIBLE",
      className,
    },
    ref
  ) {
    /* ── Map the loose `ShippingLabelData` into the strict 7-zone model ── */

    const origin = React.useMemo<DerivedAddress>(
      () => ({
        heading: data.senderName?.trim() || "—",
        lines: compactLines([
          data.senderAddress,
          data.senderPhone ? `Tel: ${data.senderPhone}` : null,
          data.origin ? `Origin: ${data.origin}` : null,
        ]),
      }),
      [data.senderName, data.senderAddress, data.senderPhone, data.origin]
    )

    const destination = React.useMemo<DerivedAddress>(
      () => ({
        heading: `NODE: ${(data.destination || "—").toUpperCase()}`,
        lines: compactLines([
          data.receiverName?.trim() || null,
          data.receiverAddress,
          data.receiverPhone ? `Tel: ${data.receiverPhone}` : null,
        ]),
      }),
      [data.destination, data.receiverName, data.receiverAddress, data.receiverPhone]
    )

    const mission = React.useMemo(
      () => ({
        timestampUtc: formatMissionTime(data.shipDate),
        sequence: 1,
      }),
      [data.shipDate]
    )

    const totalBoxes = Math.max(1, data.pieces ?? 1)
    const box = {
      current: 1,
      total: totalBoxes,
      weight: data.weightKg ? `${data.weightKg} kg` : "—",
    }

    const manifest = {
      type: data.description?.trim() || "Mixed Payload",
      sku: data.orderRef?.trim() || data.awbNumber,
      quantity: data.pieces ?? 1,
    }

    return (
      <div
        ref={ref}
        role="article"
        data-slot="shipping-label"
        data-label-size={size}
        aria-label={`Shipping label · AWB ${data.awbNumber}`}
        className={cn(
          // Print-invariant: paper-white, ink-black, monospaced tactical type.
          // Direct hex values intentionally — labels are theme-independent
          // print artifacts and must never inherit dark-mode tokens.
          "bg-white text-black font-mono",
          "border-2 border-black",
          "[color-scheme:light]",
          "px-4 pt-3.5 pb-3 w-full mx-auto",
          size === "print" ? "max-w-[4in]" : "max-w-[26.25rem]",
          "print:max-w-[4in] print:border-0",
          className
        )}
      >
        {/* ━━━━━━━━━━━━ Zone 1: brand mark + box meta ━━━━━━━━━━━━ */}
        <header className="flex items-baseline justify-between border-b-2 border-black pb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-medium tracking-[0.04em] leading-none">
              {data.companyName ? data.companyName.split(" ")[0] : "TAC"}
            </span>
            <span className="text-[11px] font-medium tracking-[0.18em]">
              EXPRESS
            </span>
          </div>
          <div className="text-xs font-medium tabular-nums whitespace-nowrap">
            Box {pad2(box.current)} of {pad2(box.total)} — {box.weight}
          </div>
        </header>

        {/* ━━━━━━━━━━━━ Zone 2: ORIGIN / DESTINATION ━━━━━━━━━━━━ */}
        <div className="grid grid-cols-2 gap-4 py-2.5">
          <AddressColumn label="ORIGIN" address={origin} />
          <AddressColumn label="DESTINATION" address={destination} />
        </div>

        {/* ━━━━━━━━━━━━ Zone 3: inverted MSN bar ━━━━━━━━━━━━ */}
        <div className="bg-black text-white px-2 py-1 flex justify-between items-center text-[10px] tracking-[0.08em] font-medium">
          <span className="uppercase">MSN ({mission.timestampUtc})</span>
          <span>— {pad2(mission.sequence)}</span>
        </div>

        {/* ━━━━━━━━━━━━ Zone 4: Code 128 + Data Matrix ━━━━━━━━━━━━ */}
        <div className="flex items-stretch gap-2.5 pt-3.5 pb-1.5">
          <Code128 value={data.awbNumber} />
          <DataMatrix value={data.awbNumber} size={86} />
        </div>

        {/* ━━━━━━━━━━━━ Zones 5 + 6: tracking number + manifest stack ━━━━━━━━━━━━ */}
        <div className="flex justify-between items-start gap-3 border-b border-black pb-2">
          <span className="text-sm font-medium tracking-[0.14em] tabular-nums pt-0.5 whitespace-nowrap">
            {data.awbNumber}
          </span>
          <div className="text-right text-[10px] leading-snug whitespace-nowrap">
            <div className="font-medium">{manifest.type}</div>
            <div className="break-all">{manifest.sku}</div>
            <div>Qty {manifest.quantity}</div>
          </div>
        </div>

        {/* ━━━━━━━━━━━━ Zone 7: handler instruction ━━━━━━━━━━━━ */}
        <p className="text-center pt-2 text-[9.5px] tracking-[0.22em] font-medium uppercase">
          {handlerInstruction}
        </p>
      </div>
    )
  }
)

/* ════════════════════════════════════════════════════════════════════════ */
/*  Sub-components                                                           */
/* ════════════════════════════════════════════════════════════════════════ */

interface DerivedAddress {
  heading: string
  lines: string[]
}

function AddressColumn({
  label,
  address,
}: {
  label: string
  address: DerivedAddress
}) {
  return (
    <div className="text-[11px] leading-snug min-w-0">
      <div className="text-[9px] font-medium tracking-[0.2em] mb-1.5 uppercase">
        {label}
      </div>
      <div className="font-medium break-words">{address.heading}</div>
      {address.lines.map((line, i) => (
        <div key={i} className="break-words">
          {line}
        </div>
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════ */
/*  Barcodes — deterministic seeded patterns.                                */
/*                                                                           */
/*  These are visually-correct stand-ins, NOT real Code 128 / Data Matrix    */
/*  encodings (no check digits, no FNC chars). When real encoding is        */
/*  greenlit, move it to `packages/services/barcode` and pass pre-encoded    */
/*  `code128: number[]` + `dataMatrix: boolean[][]` props through.           */
/* ════════════════════════════════════════════════════════════════════════ */

function Code128({ value }: { value: string }) {
  const segments = React.useMemo(() => generateCode128Pattern(value), [value])
  return (
    <svg
      viewBox="0 0 280 86"
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      className="block flex-1 h-[86px]"
      role="img"
      aria-label={`Code 128 barcode for ${value}`}
    >
      {segments.map((s, i) =>
        s.isBar ? (
          <rect
            key={i}
            x={s.x}
            y={0}
            width={s.w}
            height={86}
            fill="currentColor"
          />
        ) : null
      )}
    </svg>
  )
}

function DataMatrix({ value, size = 86 }: { value: string; size?: number }) {
  const grid = React.useMemo(() => generateDataMatrixPattern(value), [value])
  const n = grid.length
  return (
    <svg
      viewBox={`0 0 ${n} ${n}`}
      shapeRendering="crispEdges"
      style={{ width: size, height: size }}
      className="block shrink-0"
      role="img"
      aria-label={`Data Matrix code for ${value}`}
    >
      {grid.flatMap((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c}
              y={r}
              width={1}
              height={1}
              fill="currentColor"
            />
          ) : null
        )
      )}
    </svg>
  )
}

/* ════════════════════════════════════════════════════════════════════════ */
/*  Encoding helpers (seeded, deterministic per input)                       */
/* ════════════════════════════════════════════════════════════════════════ */

interface BarSegment {
  x: number
  w: number
  isBar: boolean
}

/**
 * Generate a Code-128-style bar/space sequence keyed off `seed`.
 *
 * Returns alternating bar/space segments with widths in module units; the
 * caller renders only segments where `isBar === true`. Width 4 is the
 * widest bar permitted, matching standard Code 128 spec proportions even
 * though this isn't a real encoding.
 */
function generateCode128Pattern(seed: string): BarSegment[] {
  const r = createSeededRand(seed)
  const widths = [1, 2, 3, 1, 2, 3, 1, 1, 2, 1, 3, 2]
  const out: BarSegment[] = []
  let x = 4
  let isBar = true
  let i = 0
  while (x < 274) {
    let w = widths[i % widths.length]!
    if (r() < 0.35) w += 1
    if (w > 4) w = 4
    out.push({ x, w, isBar })
    x += w
    isBar = !isBar
    i++
  }
  return out
}

/**
 * Generate a 14×14 Data-Matrix-style boolean grid keyed off `seed`.
 *
 * The standard Data Matrix finder pattern (solid left + bottom edges,
 * alternating top + right edges) is reproduced exactly so the result reads
 * as a Data Matrix at a glance. Inner cells are seeded random.
 */
function generateDataMatrixPattern(seed: string): boolean[][] {
  const n = 14
  const r = createSeededRand(`DM-${seed}`)
  const grid: boolean[][] = []
  for (let row = 0; row < n; row++) {
    const r0: boolean[] = []
    for (let col = 0; col < n; col++) {
      let fill: boolean
      if (col === 0 || row === n - 1) {
        fill = true // solid left edge + bottom edge (finder pattern)
      } else if (row === 0) {
        fill = col % 2 === 0 // alternating top edge
      } else if (col === n - 1) {
        fill = row % 2 === 1 // alternating right edge
      } else {
        fill = r() < 0.48 // data region
      }
      r0.push(fill)
    }
    grid.push(r0)
  }
  return grid
}

/** FNV-1a + xorshift32 PRNG seeded by string. Deterministic per input. */
function createSeededRand(seed: string): () => number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return () => {
    h ^= h << 13
    h >>>= 0
    h ^= h >>> 17
    h >>>= 0
    h ^= h << 5
    h >>>= 0
    return h / 4294967296
  }
}

/* ════════════════════════════════════════════════════════════════════════ */
/*  Misc helpers                                                             */
/* ════════════════════════════════════════════════════════════════════════ */

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

/**
 * Format an ISO timestamp as `DD.MM.YY HH:mm UTC` for the MSN bar.
 * Falls back to "now" when no date is supplied.
 */
function formatMissionTime(iso?: string): string {
  const d = iso ? new Date(iso) : new Date()
  if (isNaN(d.getTime())) return "—"
  const dd = pad2(d.getUTCDate())
  const mm = pad2(d.getUTCMonth() + 1)
  const yy = String(d.getUTCFullYear()).slice(-2)
  const hh = pad2(d.getUTCHours())
  const min = pad2(d.getUTCMinutes())
  return `${dd}.${mm}.${yy} ${hh}:${min} UTC`
}

function compactLines(lines: Array<string | null | undefined>): string[] {
  return lines.filter((l): l is string => Boolean(l && l.trim().length))
}

export { ShippingLabel }
