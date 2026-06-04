import type {
  BundleShipmentToC,
  DailyProductionLog,
  PeriodDirective,
} from "@/lib/mock/material-bundles";

export type DirectiveDailyBucket = {
  date: string;
  produced: number;
  shipped: number;
  received: number;
  qcSample: number;
};

export type DirectiveAnalytics = {
  directiveId: string;
  windowStart: string;
  windowEnd: string;
  targetQty: number;
  producedInWindow: number;
  shippedInWindow: number;
  receivedInWindow: number;
  qcInWindow: number;
  /** 입고 기준 달성 % */
  achievementPct: number;
  met: boolean;
  qcRate: number | null;
  daily: DirectiveDailyBucket[];
};

function inWindow(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

export function getDirectiveWindow(d: PeriodDirective): {
  start: string;
  end: string;
} {
  return {
    start: d.issuedAt ?? d.dueDate,
    end: d.dueDate,
  };
}

export function buildDirectiveAnalytics(
  directive: PeriodDirective,
  logs: DailyProductionLog[],
  shipments: BundleShipmentToC[],
): DirectiveAnalytics {
  const { start, end } = getDirectiveWindow(directive);
  const bundleId = directive.bundleId;

  const bundleLogs = logs.filter(
    (l) => l.bundleId === bundleId && inWindow(l.date, start, end),
  );
  const bundleShipments = shipments.filter(
    (s) => s.bundleId === bundleId && inWindow(s.shippedAt, start, end),
  );

  const producedInWindow = bundleLogs.reduce((s, l) => s + l.producedQty, 0);
  const qcInWindow = bundleLogs.reduce((s, l) => s + (l.qcSampleQty ?? 0), 0);
  const shippedInWindow = bundleShipments.reduce((s, sh) => s + sh.shippedQty, 0);
  const receivedInWindow = bundleShipments.reduce(
    (s, sh) => s + (sh.receivedQty ?? 0),
    0,
  );

  const achievementPct =
    directive.targetQty > 0
      ? (receivedInWindow / directive.targetQty) * 100
      : 0;
  const met = receivedInWindow >= directive.targetQty;

  const qcDenom = producedInWindow + qcInWindow;
  const qcRate = qcDenom > 0 ? (qcInWindow / qcDenom) * 100 : null;

  const dates = new Set<string>();
  bundleLogs.forEach((l) => dates.add(l.date));
  bundleShipments.forEach((s) => dates.add(s.shippedAt));
  const sortedDates = [...dates].sort();

  const daily: DirectiveDailyBucket[] = sortedDates.map((date) => ({
    date,
    produced: bundleLogs
      .filter((l) => l.date === date)
      .reduce((s, l) => s + l.producedQty, 0),
    shipped: bundleShipments
      .filter((s) => s.shippedAt === date)
      .reduce((s, sh) => s + sh.shippedQty, 0),
    received: bundleShipments
      .filter((s) => s.shippedAt === date)
      .reduce((s, sh) => s + (sh.receivedQty ?? 0), 0),
    qcSample: bundleLogs
      .filter((l) => l.date === date)
      .reduce((s, l) => s + (l.qcSampleQty ?? 0), 0),
  }));

  return {
    directiveId: directive.id,
    windowStart: start,
    windowEnd: end,
    targetQty: directive.targetQty,
    producedInWindow,
    shippedInWindow,
    receivedInWindow,
    qcInWindow,
    achievementPct,
    met,
    qcRate,
    daily,
  };
}

export function calcQcRate(
  produced: number,
  qcSample: number,
): number | null {
  const denom = produced + qcSample;
  if (denom <= 0) return null;
  return (qcSample / denom) * 100;
}

export function recomputeBundleTotals(
  bundleId: string,
  logs: DailyProductionLog[],
  shipments: BundleShipmentToC[],
): { producedTotal: number; shippedToCTotal: number; receivedAtCTotal: number } {
  const producedTotal = logs
    .filter((l) => l.bundleId === bundleId)
    .reduce((s, l) => s + l.producedQty, 0);
  const bundleShipments = shipments.filter((s) => s.bundleId === bundleId);
  const shippedToCTotal = bundleShipments.reduce((s, sh) => s + sh.shippedQty, 0);
  const receivedAtCTotal = bundleShipments.reduce(
    (s, sh) => s + (sh.receivedQty ?? 0),
    0,
  );
  return { producedTotal, shippedToCTotal, receivedAtCTotal };
}
