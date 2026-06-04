/**
 * 용어·식 (mock)
 *
 * **수율** (마감 후만): A→B 발송 기준(grant) 대비 **C 입고(검증)** — B 주장이 아님
 *   → receivedAtCTotal / grantQty
 *
 * **E2E** (마감 후): C 입고 / A **목표** — 브랜드 목표 달성 (수율 아님)
 *
 * **달성도** (진행 중): C입고÷목표, 생산÷목표, 기간 지시 대비 등
 *
 * **로스 여유**: 발송 전 BOM 산출용 % — 수율 아님
 */

import type { DailyProductionLog, MaterialBundle, PeriodDirective } from "@/lib/mock/material-bundles";
import { getDirectiveWindow } from "@/lib/mock/analytics";

export const DEFAULT_LOSS_ALLOWANCE_PCT = 5;

export function isBundleYieldFinalized(bundle: MaterialBundle): boolean {
  return bundle.status === "closed" || bundle.status === "depleted";
}

export function calcBundleGrantQty(bundle: MaterialBundle): number {
  if (bundle.grantQty != null && bundle.grantQty > 0) {
    return bundle.grantQty;
  }
  if (bundle.materialShipQty != null && bundle.materialShipQty > 0) {
    return bundle.materialShipQty;
  }
  const pct = bundle.lossAllowancePct ?? 0;
  return Math.ceil(bundle.targetQty * (1 + pct / 100));
}

export function calcBundleLossAllowanceQty(bundle: MaterialBundle): number {
  const grant = calcBundleGrantQty(bundle);
  return Math.max(0, grant - bundle.targetQty);
}

/** 전체 달성도 (B 주장 생산 / 목표) — 수율 아님 */
export function calcBundleOverallAchievement(bundle: MaterialBundle): number | null {
  if (bundle.targetQty <= 0) return null;
  return (bundle.producedTotal / bundle.targetQty) * 100;
}

export function calcPeriodProductionAchievement(
  directive: PeriodDirective,
  logs: DailyProductionLog[],
): number | null {
  if (directive.targetQty <= 0) return null;
  const { start, end } = getDirectiveWindow(directive);
  const produced = logs
    .filter(
      (l) =>
        l.bundleId === directive.bundleId &&
        l.date >= start &&
        l.date <= end,
    )
    .reduce((s, l) => s + l.producedQty, 0);
  return (produced / directive.targetQty) * 100;
}

/** 수율: C 입고(검증) / A 발송 기준 — 마감 후만 */
export function calcBundleYieldFinal(bundle: MaterialBundle): number | null {
  if (!isBundleYieldFinalized(bundle)) return null;
  const grant = calcBundleGrantQty(bundle);
  if (grant <= 0) return null;
  return (bundle.receivedAtCTotal / grant) * 100;
}

/** @deprecated calcBundleYieldFinal */
export function calcBundleMaterialYieldFinal(bundle: MaterialBundle): number | null {
  return calcBundleYieldFinal(bundle);
}

/** 로스율 = (grant − C입고) / grant — 마감 후 */
export function calcBundleLossRateFinal(bundle: MaterialBundle): number | null {
  if (!isBundleYieldFinalized(bundle)) return null;
  const grant = calcBundleGrantQty(bundle);
  if (grant <= 0) return null;
  return ((grant - bundle.receivedAtCTotal) / grant) * 100;
}

/** E2E: C 입고 / A 목표 — 마감 후 (수율 아님) */
export function calcBundleE2eFinal(bundle: MaterialBundle): number | null {
  if (!isBundleYieldFinalized(bundle)) return null;
  if (bundle.targetQty <= 0) return null;
  return (bundle.receivedAtCTotal / bundle.targetQty) * 100;
}

/** @deprecated calcBundleE2eFinal */
export function calcBundleE2eYieldFinal(bundle: MaterialBundle): number | null {
  return calcBundleE2eFinal(bundle);
}

/** 전체 달성도 (C 입고 / 목표) — 진행 중, 수율·E2E 아님 */
export function calcBundleInboundAchievement(bundle: MaterialBundle): number | null {
  if (bundle.targetQty <= 0) return null;
  return (bundle.receivedAtCTotal / bundle.targetQty) * 100;
}
