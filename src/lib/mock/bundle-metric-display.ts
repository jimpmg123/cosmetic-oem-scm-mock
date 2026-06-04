import {
  calcBundleE2eYield,
  calcBundleGrantQty,
  calcBundleYield,
  isBundleYieldFinalized,
} from "@/lib/mock/material-bundles";
import type { MaterialBundle } from "@/lib/mock/material-bundles";
import {
  calcBundleInboundAchievement,
  calcBundleOverallAchievement,
} from "@/lib/mock/yield-metrics";

export type BundleDonutMetric = {
  pct: number | null;
  numerator: number;
  denominator: number;
  captionKey:
    | "bundle.donut.inboundAchievement"
    | "bundle.donut.production"
    | "bundle.donut.yield"
    | "bundle.donut.e2e";
};

/** 진행 중 = 달성도 2종, 마감 후 = 수율(C/grant) + E2E */
export function getBundleSummaryDonutMetrics(bundle: MaterialBundle): BundleDonutMetric[] {
  if (isBundleYieldFinalized(bundle)) {
    const grant = calcBundleGrantQty(bundle);
    return [
      {
        pct: calcBundleYield(bundle),
        numerator: bundle.receivedAtCTotal,
        denominator: grant,
        captionKey: "bundle.donut.yield",
      },
      {
        pct: calcBundleE2eYield(bundle),
        numerator: bundle.receivedAtCTotal,
        denominator: bundle.targetQty,
        captionKey: "bundle.donut.e2e",
      },
    ];
  }
  return [
    {
      pct: calcBundleInboundAchievement(bundle),
      numerator: bundle.receivedAtCTotal,
      denominator: bundle.targetQty,
      captionKey: "bundle.donut.inboundAchievement",
    },
    {
      pct: calcBundleOverallAchievement(bundle),
      numerator: bundle.producedTotal,
      denominator: bundle.targetQty,
      captionKey: "bundle.donut.production",
    },
  ];
}
