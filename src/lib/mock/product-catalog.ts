/** A 브랜드 라인 · 제품 · BOM · 재료 요청 (mock) */

import type { UserRole } from "@/lib/mock/data";

export type CosmeticType =
  | "lotion"
  | "toner"
  | "serum"
  | "ampoule"
  | "cream"
  | "lipstick"
  | "mascara"
  | "cleanser"
  | "other";

export const COSMETIC_TYPE_LABELS: Record<CosmeticType, string> = {
  lotion: "로션",
  toner: "토너",
  serum: "세럼",
  ampoule: "앰플",
  cream: "크림",
  lipstick: "립스틱",
  mascara: "마스카라",
  cleanser: "클렌저",
  other: "기타",
};

export const COSMETIC_TYPE_SHORT: Record<CosmeticType, string> = {
  lotion: "LOT",
  toner: "TON",
  serum: "SER",
  ampoule: "AMP",
  cream: "CRM",
  lipstick: "LIP",
  mascara: "MSC",
  cleanser: "CLN",
  other: "ETC",
};

export type BrandLine = {
  id: string;
  code: string;
  name: string;
  description?: string;
  imageUrl?: string;
  /** 라인 배치 시기 */
  placedAt: string;
  /** 담당 B(위탁 생산) 회사 */
  manufacturerId: string;
};

export type VolumeAmount = {
  value: number;
  unit: string;
};

export type ProductBomLine = {
  id: string;
  itemCode: string;
  itemName: string;
  /** 제품 1단위당 실제 함량 (예: ml) */
  qtyPerUnit: number;
  unit: string;
  /** 배합 비율 (%) */
  percent?: number;
};

export type CatalogProduct = {
  id: string;
  lineId: string;
  name: string;
  code: string;
  cosmeticType: CosmeticType;
  devDate: string;
  imageUrl?: string;
  /** 완제품 용량 (예: 30 ml) */
  productVolume?: VolumeAmount;
  /** 생산 위탁 B 회사 (라인 기본과 동일) */
  manufacturerId?: string;
  bom: ProductBomLine[];
  createdAt: string;
  updatedAt: string;
};

export type MaterialRequestType = "a_push" | "b_production" | "b_spot";

export type MaterialRequestStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "shipped"
  | "cancelled";

export type MaterialRequestLine = {
  id: string;
  itemCode: string;
  itemName: string;
  unit: string;
  qty: number;
  productId?: string;
  productName?: string;
  lineName?: string;
};

export type ProductionRequestItem = {
  productId: string;
  productName: string;
  qty: number;
  yieldPct: number;
};

export type MaterialRequest = {
  id: string;
  number: string;
  type: MaterialRequestType;
  status: MaterialRequestStatus;
  createdAt: string;
  createdBy: string;
  /** 요청·출하 대상 B 회사 */
  manufacturerId: string;
  manufacturerName: string;
  lines: MaterialRequestLine[];
  comment?: string;
  /** A 통지 출하 */
  notifyMessage?: string;
  /** 완제품 목표 개수 (통지 출하·승인 한도) */
  targetFinishedQty?: number;
  /** 작성자 A 역할 */
  authorRole?: UserRole;
  /** B 생산 배치 */
  productionItems?: ProductionRequestItem[];
  defaultYieldPct?: number;
};

/** B 생산 배치 요청 시 기본 로스 여유 (%) — 수율 아님 */
export const DEFAULT_LOSS_ALLOWANCE_PCT = 5;
/** @deprecated DEFAULT_LOSS_ALLOWANCE_PCT */
export const DEFAULT_YIELD_PCT = DEFAULT_LOSS_ALLOWANCE_PCT;
/** A 통지 출하 시 고정 로스 여유 (%) */
export const A_PUSH_LOSS_ALLOWANCE_PCT = DEFAULT_LOSS_ALLOWANCE_PCT;
/** @deprecated A_PUSH_LOSS_ALLOWANCE_PCT */
export const A_PUSH_YIELD_PCT = A_PUSH_LOSS_ALLOWANCE_PCT;
export const MAX_YIELD_PCT = 20;

import { INITIAL_CATALOG_FROM_SEED } from "@/lib/mock/catalog-seed";
import { getManufacturerById, INITIAL_MANUFACTURERS } from "@/lib/mock/manufacturer-seed";

export { INITIAL_MANUFACTURERS };
export type { ManufacturingCompany } from "@/lib/mock/manufacturer-seed";

export const INITIAL_BRAND_LINES: BrandLine[] = INITIAL_CATALOG_FROM_SEED.brandLines;

export const INITIAL_CATALOG_PRODUCTS: CatalogProduct[] = INITIAL_CATALOG_FROM_SEED.products;

const _mfrLianxi = getManufacturerById(INITIAL_MANUFACTURERS, "mfr-lianxi")!;

export const INITIAL_MATERIAL_REQUESTS: MaterialRequest[] = [
  {
    id: "req-push-super",
    number: "MR-2026-P01",
    type: "a_push",
    status: "submitted",
    createdAt: "2026-06-01T09:00:00Z",
    createdBy: "A Super Admin",
    authorRole: "super_admin",
    manufacturerId: _mfrLianxi.id,
    manufacturerName: _mfrLianxi.name,
    targetFinishedQty: 1000,
    notifyMessage: "6월 세럼 1,000개분 원료 발송 예정",
    lines: [
      {
        id: "pl-1",
        itemCode: "RM-WATER",
        itemName: "정제수",
        unit: "L",
        qty: 200,
      },
    ],
  },
  {
    id: "req-push-admin-draft",
    number: "MR-2026-P02",
    type: "a_push",
    status: "draft",
    createdAt: "2026-06-03T11:00:00Z",
    createdBy: "A Admin",
    authorRole: "a_admin",
    manufacturerId: _mfrLianxi.id,
    manufacturerName: _mfrLianxi.name,
    targetFinishedQty: 800,
    notifyMessage: "토너 보충분 — draft (Super 발행 대기)",
    lines: [
      {
        id: "pl-2",
        itemCode: "RM-TONER-ACT",
        itemName: "토너 액상",
        unit: "kg",
        qty: 350,
      },
    ],
  },
  {
    id: "req-001",
    number: "MR-2026-001",
    type: "b_spot",
    status: "submitted",
    createdAt: "2026-06-02T10:00:00Z",
    createdBy: "B Admin",
    manufacturerId: _mfrLianxi.id,
    manufacturerName: _mfrLianxi.name,
    comment: "1번 라인 펌프 작동 오류 — 펌프만 긴급 보충",
    lines: [
      {
        id: "rl-1",
        itemCode: "RM-PUMP",
        itemName: "펌프·캡 세트",
        unit: "EA",
        qty: 500,
        productId: "prod-lumiara-lotion",
        productName: "Soft Glow Lotion",
        lineName: "Lumiara",
      },
    ],
  },
];

export function suggestProductCode(
  lineCode: string,
  cosmeticType: CosmeticType,
  existingCodes: string[],
): string {
  const short = COSMETIC_TYPE_SHORT[cosmeticType];
  const prefix = `${lineCode}-${short}-`;
  let n = 1;
  let code = `${prefix}${String(n).padStart(2, "0")}`;
  while (existingCodes.includes(code)) {
    n += 1;
    code = `${prefix}${String(n).padStart(2, "0")}`;
  }
  return code;
}

export function calcProductionLines(
  product: CatalogProduct,
  qty: number,
  yieldPct: number,
  lineName?: string,
): MaterialRequestLine[] {
  const factor = qty * (1 + yieldPct / 100);
  const stamp = Date.now();
  return product.bom.map((b, i) => ({
    id: `calc-${b.id}-${stamp}-${i}`,
    itemCode: b.itemCode,
    itemName: b.itemName,
    unit: b.unit,
    qty: Math.ceil(b.qtyPerUnit * factor * 1000) / 1000,
    productId: product.id,
    productName: product.name,
    lineName,
  }));
}

export function scaledMaterialQty(
  qtyPerUnit: number,
  targetUnits: number,
  yieldPct: number,
): number {
  const factor = targetUnits * (1 + yieldPct / 100);
  return Math.ceil(qtyPerUnit * factor * 1000) / 1000;
}

export type CatalogSearchHit =
  | { kind: "line"; line: BrandLine }
  | { kind: "product"; product: CatalogProduct; line: BrandLine }
  | { kind: "material"; product: CatalogProduct; line: BrandLine; bom: ProductBomLine };

export function searchCatalog(
  query: string,
  lines: BrandLine[],
  products: CatalogProduct[],
): CatalogSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits: CatalogSearchHit[] = [];
  const lineMap = new Map(lines.map((l) => [l.id, l]));

  for (const line of lines) {
    if (
      line.name.toLowerCase().includes(q) ||
      line.code.toLowerCase().includes(q)
    ) {
      hits.push({ kind: "line", line });
    }
  }

  for (const product of products) {
    const line = lineMap.get(product.lineId);
    if (!line) continue;
    const typeLabel = COSMETIC_TYPE_LABELS[product.cosmeticType];
    const matchProduct =
      product.name.toLowerCase().includes(q) ||
      product.code.toLowerCase().includes(q) ||
      typeLabel.includes(q) ||
      line.name.toLowerCase().includes(q) ||
      line.code.toLowerCase().includes(q);

    if (matchProduct) {
      hits.push({ kind: "product", product, line });
    }

    for (const bom of product.bom) {
      if (
        bom.itemCode.toLowerCase().includes(q) ||
        bom.itemName.toLowerCase().includes(q)
      ) {
        hits.push({ kind: "material", product, line, bom });
      }
    }
  }

  return hits;
}

export function nextRequestNumber(requests: MaterialRequest[]): string {
  const year = new Date().getFullYear();
  const prefix = `MR-${year}-`;
  const nums = requests
    .map((r) => r.number)
    .filter((n) => n.startsWith(prefix))
    .map((n) => parseInt(n.slice(prefix.length), 10))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}
