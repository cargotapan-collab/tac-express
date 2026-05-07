/**
 * Service layer contract for the analytics + dashboard pages.
 *
 * Implement these in `packages/services/analytics.ts` and
 * `packages/services/dashboard.ts`. The UI layer never reaches into
 * the database — it only consumes the shapes below.
 *
 * Re-export the chart types from `@repo/ui/components/charts` so the
 * service layer and UI agree on a single contract.
 */

import type {
  DualSeriesPoint,
  LaneHeatmapData,
  RankItem,
  Segment,
  SlaBucket,
  SparkPoint,
  Trend,
} from "@repo/ui/components/charts";

/* ── Analytics page ──────────────────────────────────────────────── */

export interface KpiSeries {
  value: number;
  spark: SparkPoint[];
  delta?: { label: string; trend: Trend };
}

export interface DeliveredKpi extends KpiSeries {
  /** 0–1 fraction of delivered / total. */
  rate: number;
}

export interface AvgDaysKpi {
  value: number | null;
  spark: SparkPoint[];
}

export interface AnalyticsKpis {
  totalShipments: KpiSeries;
  totalRevenue: KpiSeries;
  delivered: DeliveredKpi;
  inTransit: KpiSeries;
  openExceptions: KpiSeries;
  avgDeliveryDays: AvgDaysKpi;
}

export type ShipmentTrendPoint = DualSeriesPoint;
export type RevenueTrendPoint = DualSeriesPoint;

export declare function getAnalyticsKpis(): Promise<AnalyticsKpis>;
export declare function getShipmentTrend(args: {
  days: number;
}): Promise<ShipmentTrendPoint[]>;
export declare function getRevenueTrend(args: {
  months: number;
}): Promise<RevenueTrendPoint[]>;
export declare function getStatusDistribution(): Promise<Segment[]>;
export declare function getServiceMix(): Promise<Segment[]>;
export declare function getHubPerformance(): Promise<RankItem[]>;
export declare function getTopCustomers(args: {
  limit: number;
}): Promise<RankItem[]>;
export declare function getSlaBreachDistribution(args: {
  days: number;
}): Promise<SlaBucket[]>;
export declare function getLaneHeatmap(): Promise<LaneHeatmapData>;

/* ── Overview / Command Center page ──────────────────────────────── */

export interface CommandCenterKpis {
  active: KpiSeries;
  inTransit: KpiSeries;
  openExceptions: KpiSeries;
}

export interface ProgressKpi {
  /** Current value, 0–max. */
  value: number;
  /** Maximum (e.g. 100). */
  max: number;
  /** Target tick, 0–max. */
  target: number;
  /** Optional caption rendered as sublabel. */
  label?: string;
}

export interface UpcomingOp {
  id: string;
  title: string;
  kind: string;
  /** Pre-formatted ETA string. */
  eta: string;
}

export declare function getCommandCenterKpis(): Promise<CommandCenterKpis>;
export declare function getDeliverySuccessGrowth(): Promise<ProgressKpi>;
export declare function getShipmentVolume(args: {
  days: number;
}): Promise<DualSeriesPoint[]>;
export declare function getTopHubs(): Promise<RankItem[]>;
export declare function getSuccessRate(): Promise<ProgressKpi>;
export declare function getUpcomingOperations(args: {
  limit: number;
}): Promise<UpcomingOp[]>;
