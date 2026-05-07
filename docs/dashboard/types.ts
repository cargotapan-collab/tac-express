/**
 * TAC Orbital chart contracts.
 *
 * These types are the only allowed shapes that flow into chart components.
 * Data fetching + transformation lives in `packages/services`. UI components
 * receive already-shaped props and render. No exceptions.
 */

export type Trend = "up" | "down" | "flat";

export interface SeriesPoint {
  /** ISO date (`YYYY-MM-DD`) or numeric x. */
  x: string | number;
  /** Numeric y value. */
  y: number;
}

export interface DualSeriesPoint extends SeriesPoint {
  /** Optional secondary series — rendered in muted variant. */
  y2?: number;
}

export type ChartTone =
  | "primary"
  | "muted"
  | "ramp-1"
  | "ramp-2"
  | "ramp-3"
  | "ramp-4"
  | "ramp-5";

export interface Segment {
  /** Machine key, lowercased. */
  key: string;
  /** Display label. */
  label: string;
  /** Numeric value. Sum of segments = denominator. */
  value: number;
  /** Optional override; defaults to a ramp position by index. */
  tone?: ChartTone;
}

export interface RankItem {
  key: string;
  label: string;
  value: number;
  /** Optional sub-label rendered under the primary label. */
  caption?: string;
}

export interface SlaBucket {
  /** ISO date string. Ordered ascending in input array. */
  date: string;
  ontime: number;
  late: number;
  breached: number;
}

export interface LaneCell {
  origin: string;
  destination: string;
  value: number;
}

export interface LaneHeatmapData {
  origins: string[];
  destinations: string[];
  cells: LaneCell[];
  /** Cap for ramp normalization. Computed from cells when omitted. */
  max?: number;
}

export interface SparkPoint {
  /** Bin label (date or index). */
  x: string | number;
  /** Value. */
  y: number;
}
