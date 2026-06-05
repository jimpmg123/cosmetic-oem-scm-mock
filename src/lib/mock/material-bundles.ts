import { INITIAL_MANUFACTURERS } from "@/lib/mock/manufacturer-seed";
import {
  calcBundleE2eFinal,
  calcBundleE2eYieldFinal,
  calcBundleMaterialYieldFinal,
  calcBundleYieldFinal,
  calcBundleOverallAchievement,
  isBundleYieldFinalized,
} from "@/lib/mock/yield-metrics";

export { calcBundleGrantQty, isBundleYieldFinalized } from "@/lib/mock/yield-metrics";

export type BundleStatus = "planned" | "active" | "depleted" | "closed";

export type DirectiveStatus =
  | "draft"
  | "issued"
  | "in_progress"
  | "met"
  | "missed"
  | "cancelled";

export interface MaterialBundle {
  id: string;
  number: string;
  /** 카탈로그 제품 id */
  productId: string;
  /** 카탈로그 제품 코드 (예: AEVO-SER-01). legacy 필드명 sku 유지 */
  sku: string;
  productName: string;
  /** 브랜드 라인명 (표시용) */
  lineName?: string;
  theoreticalQty: number;
  targetQty: number;
  /** A 발송 기준량 (로스 여유 포함). 예: 목표 1000 + 로스 100 → 1100 */
  grantQty?: number;
  /** 발송 시 반영한 로스 여유 (%). 수율과 별개 */
  lossAllowancePct?: number;
  useFromDate?: string;
  useByDate: string;
  vendorId: string;
  vendorName: string;
  poWoRef?: string;
  internalNote?: string;
  /** @deprecated grantQty 우선. 하위 호환 */
  materialShipQty?: number;
  shippedAt?: string;
  status: BundleStatus;
  producedTotal: number;
  shippedToCTotal: number;
  receivedAtCTotal: number;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  depletedAt?: string;
  closedAt?: string;
  createdAt: string;
  createdBy: string;
}

export interface PeriodDirective {
  id: string;
  bundleId: string;
  dueDate: string;
  targetQty: number;
  comment?: string;
  status: DirectiveStatus;
  issuedAt?: string;
  issuedBy?: string;
}

export interface DailyProductionLog {
  id: string;
  bundleId: string;
  date: string;
  producedQty: number;
  defectQty: number;
  qcSampleQty?: number;
  note?: string;
  status?: "draft" | "submitted";
}

export type MaterialReceiptStatus = "pending" | "matched" | "disputed";

export interface MaterialReceipt {
  bundleId: string;
  aShippedQty: number;
  bConfirmedQty: number | null;
  status: MaterialReceiptStatus;
  updatedAt?: string;
}

export interface MaterialReceiptAudit {
  id: string;
  bundleId: string;
  action: "created" | "updated";
  previousQty: number | null;
  newQty: number;
  comment: string;
  changedBy: string;
  changedAt: string;
}

export interface BundleShipmentToC {
  id: string;
  bundleId: string;
  number: string;
  shippedQty: number;
  receivedQty: number | null;
  shippedAt: string;
}

/** @deprecated 카탈로그 제품 사용 — bundle-product.ts 참고 */
export type SkuOption = {
  sku: string;
  productName: string;
  theoreticalQty: number;
};

/** B 위탁 생산사 (test_data/cosmetic_manufacturers_json) */
export const VENDORS = INITIAL_MANUFACTURERS.map((m) => ({
  id: m.id,
  name: m.name,
  chineseName: m.chineseName,
}));

export const INITIAL_MATERIAL_BUNDLES: MaterialBundle[] = [
  {
    id: "mb-2026-001",
    number: "MB-2026-001",
    productId: "prod-aevora-serum",
    sku: "AEVO-SER-01",
    productName: "Hydra Marine Serum",
    lineName: "Aevora",
    theoreticalQty: 1200,
    targetQty: 1000,
    grantQty: 1100,
    lossAllowancePct: 10,
    useFromDate: "2026-06-01",
    useByDate: "2026-09-30",
    vendorId: "mfr-yunhua",
    vendorName: "Yunhua BioLab",
    poWoRef: "WO-2026-001",
    materialShipQty: 1100,
    shippedAt: "2026-06-02",
    status: "active",
    producedTotal: 593,
    shippedToCTotal: 830,
    receivedAtCTotal: 820,
    acknowledgedAt: "2026-06-03",
    acknowledgedBy: "B Admin",
    createdAt: "2026-06-01T09:00:00Z",
    createdBy: "Super Admin",
  },
  {
    id: "mb-2026-002",
    number: "MB-2026-002",
    productId: "prod-lumiara-toner",
    sku: "LUMI-TON-01",
    productName: "Balance Refresh Toner",
    lineName: "Lumiara",
    theoreticalQty: 900,
    targetQty: 800,
    useFromDate: "2026-05-15",
    useByDate: "2026-08-15",
    vendorId: "mfr-lianxi",
    vendorName: "Lianxi DermaWorks",
    poWoRef: "PO-8842",
    materialShipQty: 900,
    shippedAt: "2026-05-16",
    status: "active",
    producedTotal: 97,
    shippedToCTotal: 290,
    receivedAtCTotal: 280,
    acknowledgedAt: "2026-05-17",
    acknowledgedBy: "B Admin",
    createdAt: "2026-05-14T10:00:00Z",
    createdBy: "Super Admin",
  },
  {
    id: "mb-2026-004",
    number: "MB-2026-004",
    productId: "prod-aevora-lotion",
    sku: "AEVO-LOT-01",
    productName: "Hydra Marine Lotion",
    lineName: "Aevora",
    theoreticalQty: 5450,
    targetQty: 8000,
    useFromDate: "2026-04-01",
    useByDate: "2026-10-31",
    vendorId: "mfr-yunhua",
    vendorName: "Yunhua BioLab",
    poWoRef: "PO-Q2-LOTION",
    materialShipQty: 5450,
    shippedAt: "2026-04-05",
    status: "active",
    producedTotal: 1240,
    shippedToCTotal: 1200,
    receivedAtCTotal: 1180,
    acknowledgedAt: "2026-04-08",
    acknowledgedBy: "B Admin",
    createdAt: "2026-04-01T09:00:00Z",
    createdBy: "Super Admin",
  },
  {
    id: "mb-2026-003",
    number: "MB-2026-003",
    productId: "prod-solenne-atelier-cream",
    sku: "SOLN-CRM-01",
    productName: "Rose Quartz Cream",
    lineName: "Solenne Atelier",
    theoreticalQty: 600,
    targetQty: 500,
    useByDate: "2026-12-01",
    vendorId: "mfr-lianxi",
    vendorName: "Lianxi DermaWorks",
    internalNote: "Q4 신규 라인 테스트",
    status: "planned",
    producedTotal: 0,
    shippedToCTotal: 0,
    receivedAtCTotal: 0,
    createdAt: "2026-06-10T08:00:00Z",
    createdBy: "Super Admin",
  },
];

export const INITIAL_DIRECTIVES: PeriodDirective[] = [
  {
    id: "dir-001",
    bundleId: "mb-2026-001",
    dueDate: "2026-06-10",
    targetQty: 300,
    comment: "블프 대비 선출하",
    status: "in_progress",
    issuedAt: "2026-06-01",
    issuedBy: "Super Admin",
  },
  {
    id: "dir-002",
    bundleId: "mb-2026-001",
    dueDate: "2026-07-01",
    targetQty: 200,
    comment: "명절 전후 라인 조정",
    status: "issued",
    issuedAt: "2026-06-05",
    issuedBy: "Super Admin",
  },
  {
    id: "dir-003",
    bundleId: "mb-2026-002",
    dueDate: "2026-07-15",
    targetQty: 400,
    comment: "여름 시즌 대비",
    status: "issued",
    issuedAt: "2026-05-20",
    issuedBy: "Super Admin",
  },
  {
    id: "dir-004",
    bundleId: "mb-2026-004",
    dueDate: "2026-07-10",
    targetQty: 8000,
    comment: "Q2 메인 물량 — 캘린더 지시기간 검증 (4/10~7/10)",
    status: "in_progress",
    issuedAt: "2026-04-10",
    issuedBy: "Super Admin",
  },
];

export const INITIAL_DAILY_LOGS: DailyProductionLog[] = [
  { id: "log-001", bundleId: "mb-2026-001", date: "2026-06-09", producedQty: 88, defectQty: 1, qcSampleQty: 4, status: "submitted" },
  { id: "log-002", bundleId: "mb-2026-001", date: "2026-06-08", producedQty: 120, defectQty: 2, qcSampleQty: 6, status: "submitted" },
  { id: "log-003", bundleId: "mb-2026-001", date: "2026-06-07", producedQty: 95, defectQty: 1, qcSampleQty: 3, status: "submitted" },
  { id: "log-004", bundleId: "mb-2026-001", date: "2026-06-06", producedQty: 110, defectQty: 0, qcSampleQty: 5, status: "submitted" },
  { id: "log-005", bundleId: "mb-2026-001", date: "2026-06-05", producedQty: 102, defectQty: 2, qcSampleQty: 4, status: "submitted" },
  { id: "log-006", bundleId: "mb-2026-001", date: "2026-06-04", producedQty: 78, defectQty: 0, qcSampleQty: 2, status: "submitted" },
  { id: "log-007", bundleId: "mb-2026-002", date: "2026-06-08", producedQty: 45, defectQty: 1, qcSampleQty: 2, status: "submitted" },
  { id: "log-008", bundleId: "mb-2026-002", date: "2026-06-07", producedQty: 52, defectQty: 0, qcSampleQty: 1, status: "submitted" },
  { id: "log-101", bundleId: "mb-2026-004", date: "2026-04-12", producedQty: 75, defectQty: 1, qcSampleQty: 3, status: "submitted" },
  { id: "log-102", bundleId: "mb-2026-004", date: "2026-04-18", producedQty: 82, defectQty: 0, qcSampleQty: 2, status: "submitted" },
  { id: "log-103", bundleId: "mb-2026-004", date: "2026-04-25", producedQty: 90, defectQty: 1, qcSampleQty: 4, status: "submitted" },
  { id: "log-104", bundleId: "mb-2026-004", date: "2026-05-05", producedQty: 88, defectQty: 0, qcSampleQty: 3, status: "submitted" },
  { id: "log-105", bundleId: "mb-2026-004", date: "2026-05-12", producedQty: 95, defectQty: 2, qcSampleQty: 5, status: "submitted" },
  { id: "log-106", bundleId: "mb-2026-004", date: "2026-05-20", producedQty: 110, defectQty: 1, qcSampleQty: 4, status: "submitted" },
  { id: "log-107", bundleId: "mb-2026-004", date: "2026-05-28", producedQty: 105, defectQty: 0, qcSampleQty: 3, status: "submitted" },
  { id: "log-108", bundleId: "mb-2026-004", date: "2026-06-03", producedQty: 92, defectQty: 1, qcSampleQty: 4, status: "submitted" },
  { id: "log-109", bundleId: "mb-2026-004", date: "2026-06-10", producedQty: 100, defectQty: 0, qcSampleQty: 5, status: "submitted" },
  { id: "log-110", bundleId: "mb-2026-004", date: "2026-06-18", producedQty: 115, defectQty: 2, qcSampleQty: 6, status: "submitted" },
  { id: "log-111", bundleId: "mb-2026-004", date: "2026-06-25", producedQty: 108, defectQty: 1, qcSampleQty: 4, status: "submitted" },
  { id: "log-112", bundleId: "mb-2026-004", date: "2026-07-02", producedQty: 98, defectQty: 0, qcSampleQty: 3, status: "submitted" },
  { id: "log-113", bundleId: "mb-2026-004", date: "2026-07-08", producedQty: 82, defectQty: 1, qcSampleQty: 2, status: "submitted" },
];

export const INITIAL_MATERIAL_RECEIPTS: MaterialReceipt[] = [
  {
    bundleId: "mb-2026-001",
    aShippedQty: 1200,
    bConfirmedQty: 1180,
    status: "matched",
    updatedAt: "2026-06-04",
  },
  {
    bundleId: "mb-2026-002",
    aShippedQty: 900,
    bConfirmedQty: null,
    status: "pending",
  },
  {
    bundleId: "mb-2026-004",
    aShippedQty: 5450,
    bConfirmedQty: 5400,
    status: "matched",
    updatedAt: "2026-04-09",
  },
];

export const INITIAL_RECEIPT_AUDITS: MaterialReceiptAudit[] = [
  {
    id: "ra-001",
    bundleId: "mb-2026-001",
    action: "created",
    previousQty: null,
    newQty: 1180,
    comment: "전량 재계량 후 확정",
    changedBy: "B Admin",
    changedAt: "2026-06-04T14:00:00Z",
  },
];

export const INITIAL_BUNDLE_SHIPMENTS: BundleShipmentToC[] = [
  {
    id: "bshp-001",
    bundleId: "mb-2026-001",
    number: "SHP-MB-001-A",
    shippedQty: 420,
    receivedQty: 415,
    shippedAt: "2026-06-05",
  },
  {
    id: "bshp-002",
    bundleId: "mb-2026-001",
    number: "SHP-MB-001-B",
    shippedQty: 410,
    receivedQty: 405,
    shippedAt: "2026-06-08",
  },
  {
    id: "bshp-003",
    bundleId: "mb-2026-002",
    number: "SHP-MB-002-A",
    shippedQty: 290,
    receivedQty: 280,
    shippedAt: "2026-06-01",
  },
  {
    id: "bshp-004",
    bundleId: "mb-2026-004",
    number: "SHP-MB-004-A",
    shippedQty: 1200,
    receivedQty: 1180,
    shippedAt: "2026-06-15",
  },
];

/** @deprecated 진행 중에는 calcBundleOverallAchievement 사용 */
export function calcBundleProductionYield(bundle: MaterialBundle): number | null {
  if (isBundleYieldFinalized(bundle)) {
    return calcBundleYieldFinal(bundle);
  }
  return calcBundleOverallAchievement(bundle);
}

/** 마감 후 E2E; 진행 중 null */
export function calcBundleE2eYield(bundle: MaterialBundle): number | null {
  return calcBundleE2eFinal(bundle);
}

/** 마감 후 수율 (C입고/grant) */
export function calcBundleYield(bundle: MaterialBundle): number | null {
  return calcBundleYieldFinal(bundle);
}

/** @deprecated calcBundleYield */
export function calcBundleMaterialYield(bundle: MaterialBundle): number | null {
  return calcBundleYieldFinal(bundle);
}

export function calcMaterialYield(bundle: MaterialBundle): number | null {
  if (bundle.theoreticalQty <= 0) return null;
  return (bundle.receivedAtCTotal / bundle.theoreticalQty) * 100;
}

export function calcBcDiscrepancy(bundle: MaterialBundle): number {
  return bundle.shippedToCTotal - bundle.receivedAtCTotal;
}

export function getDday(useByDate: string, today = new Date()): number {
  const end = new Date(useByDate + "T23:59:59");
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function isBundleAtRisk(bundle: MaterialBundle, today = new Date()): boolean {
  if (bundle.status !== "active") return false;
  const dday = getDday(bundle.useByDate, today);
  const progress =
    bundle.targetQty > 0 ? bundle.producedTotal / bundle.targetQty : 0;
  return progress < 0.5 && dday <= 7 && dday >= 0;
}

export function isBundleOverdue(bundle: MaterialBundle, today = new Date()): boolean {
  return bundle.status === "active" && getDday(bundle.useByDate, today) < 0;
}

export function sortBundlesForList(bundles: MaterialBundle[]): MaterialBundle[] {
  const order: Record<BundleStatus, number> = {
    active: 0,
    depleted: 1,
    planned: 2,
    closed: 3,
  };
  return [...bundles].sort((a, b) => {
    const sa = order[a.status] - order[b.status];
    if (sa !== 0) return sa;
    return a.useByDate.localeCompare(b.useByDate);
  });
}

export function nextBundleNumber(existing: MaterialBundle[]): string {
  const year = new Date().getFullYear();
  const max = Math.max(
    0,
    ...existing.map((b) => {
      const m = b.number.match(/MB-\d+-(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    }),
  );
  return `MB-${year}-${String(max + 1).padStart(3, "0")}`;
}

export function formatPct(value: number | null, digits = 1): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

export function formatDateRange(
  from: string | undefined,
  to: string,
  locale: string,
): string {
  const fmt = (d: string) =>
    new Date(d + "T12:00:00").toLocaleDateString(
      locale === "ko" ? "ko-KR" : locale === "zh" ? "zh-CN" : "en-US",
      { month: "numeric", day: "numeric" },
    );
  if (from) return `${fmt(from)} ~ ${fmt(to)}`;
  return `~ ${fmt(to)}`;
}
