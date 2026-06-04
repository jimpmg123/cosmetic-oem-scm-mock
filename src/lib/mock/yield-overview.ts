import type { MaterialBundle } from "@/lib/mock/material-bundles";
import {
  buildManufacturersFromTestData,
  type ManufacturingCompany,
} from "@/lib/mock/manufacturer-seed";
import {
  calcBundleE2eFinal,
  calcBundleInboundAchievement,
  isBundleYieldFinalized,
} from "@/lib/mock/yield-metrics";

export const INITIAL_MANUFACTURERS = buildManufacturersFromTestData();

/** Mock: 직전 기간 vs 현재 기간 입고 달성도 (%) — 수율 아님 */
export type PeriodAchievementCompare = {
  previousLabel: string;
  currentLabel: string;
  previousPct: number | null;
  currentPct: number | null;
};

const PERIOD_MOCK: Record<string, PeriodAchievementCompare> = {
  "mb-2026-003": {
    previousLabel: "2026-05",
    currentLabel: "2026-06",
    previousPct: null,
    currentPct: 0,
  },
  "mb-2026-001": {
    previousLabel: "2026-05",
    currentLabel: "2026-06",
    previousPct: 68.0,
    currentPct: null,
  },
  "mb-2026-002": {
    previousLabel: "2026-05",
    currentLabel: "2026-06",
    previousPct: 22.0,
    currentPct: 35.0,
  },
  "mb-2026-004": {
    previousLabel: "2026-05",
    currentLabel: "2026-06",
    previousPct: 12.0,
    currentPct: 14.8,
  },
};

/** @deprecated PeriodAchievementCompare 사용 */
export type PeriodYieldCompare = PeriodAchievementCompare;

export function getLatestBundle(bundles: MaterialBundle[]): MaterialBundle | undefined {
  return [...bundles].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];
}

export function getPeriodAchievementCompare(
  bundleId: string,
  bundle?: MaterialBundle,
): PeriodAchievementCompare {
  if (bundle) {
    const current = calcBundleInboundAchievement(bundle);
    const mock = PERIOD_MOCK[bundleId];
    if (mock) {
      return { ...mock, currentPct: current ?? mock.currentPct };
    }
    return {
      previousLabel: "직전 기간",
      currentLabel: "현재",
      previousPct: null,
      currentPct: current,
    };
  }
  if (PERIOD_MOCK[bundleId]) return PERIOD_MOCK[bundleId];
  return {
    previousLabel: "직전 기간",
    currentLabel: "현재",
    previousPct: null,
    currentPct: null,
  };
}

/** @deprecated getPeriodAchievementCompare */
export function getPeriodYieldCompare(
  bundleId: string,
  bundle?: MaterialBundle,
): PeriodYieldCompare {
  return getPeriodAchievementCompare(bundleId, bundle);
}

export function formatYieldDelta(
  prev: number | null,
  curr: number | null,
): { text: string; tone: "up" | "down" | "flat" | "none" } {
  if (prev == null || curr == null) return { text: "—", tone: "none" };
  const d = curr - prev;
  if (Math.abs(d) < 0.05) return { text: "0.0%p", tone: "flat" };
  const sign = d > 0 ? "+" : "";
  return {
    text: `${sign}${d.toFixed(1)}%p`,
    tone: d > 0 ? "up" : "down",
  };
}

export type CompanyYieldRow = {
  manufacturer: ManufacturingCompany;
  hasLines: boolean;
  lineLabel: string;
  activeBundles: number;
  /** 전체 달성도 (C입고÷목표 합산) — 진행 중 */
  inboundAchievementPct: number | null;
  /** 마감 묶음만 평균 E2E */
  e2eFinalPct: number | null;
  finalizedCount: number;
  bShippedTotal: number;
  cReceivedTotal: number;
};

export function buildCompanyYieldRows(
  bundles: MaterialBundle[],
  manufacturers: ManufacturingCompany[] = INITIAL_MANUFACTURERS,
): CompanyYieldRow[] {
  return manufacturers.map((m) => {
    const mBundles = bundles.filter(
      (b) =>
        b.vendorId === m.id &&
        (b.status === "active" || b.status === "depleted" || b.status === "closed"),
    );
    const hasLines = m.lineNames.length > 0;
    const targetSum = mBundles.reduce((s, b) => s + b.targetQty, 0);
    const receivedSum = mBundles.reduce((s, b) => s + b.receivedAtCTotal, 0);
    const shippedSum = mBundles.reduce((s, b) => s + b.shippedToCTotal, 0);

    const inboundAchievementPct =
      targetSum > 0 ? (receivedSum / targetSum) * 100 : mBundles.length ? 0 : null;

    const finalized = mBundles.filter(isBundleYieldFinalized);
    const e2eVals = finalized
      .map((b) => calcBundleE2eFinal(b))
      .filter((v): v is number => v != null);
    const e2eFinalPct =
      e2eVals.length > 0
        ? e2eVals.reduce((a, b) => a + b, 0) / e2eVals.length
        : null;

    return {
      manufacturer: m,
      hasLines,
      lineLabel: hasLines ? m.lineNames.join(", ") : "—",
      activeBundles: mBundles.filter((b) => b.status === "active").length,
      inboundAchievementPct: hasLines ? inboundAchievementPct : null,
      e2eFinalPct: hasLines && finalized.length > 0 ? e2eFinalPct : null,
      finalizedCount: finalized.length,
      bShippedTotal: shippedSum,
      cReceivedTotal: receivedSum,
    };
  });
}
