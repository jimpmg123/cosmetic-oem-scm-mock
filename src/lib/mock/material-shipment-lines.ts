/** 원자재 출하 라인 · 제품 라인 · SKU별 BOM (카탈로그 시드 연동) */

import { INITIAL_CATALOG_FROM_SEED } from "@/lib/mock/catalog-seed";
import {
  buildShipmentLinesFromCatalog,
  resolveCatalogProduct,
} from "@/lib/catalog/bundle-catalog-link";

export type ProductLine = {
  sku: string;
  productName: string;
  /** SKU당 BOM 기준 이론 완제품 수 (신규 묶음 기본값) */
  defaultTheoreticalQty: number;
};

export const PRODUCT_LINES: ProductLine[] = [
  { sku: "LOTION-250", productName: "Moisture Lotion 250ml", defaultTheoreticalQty: 5450 },
  { sku: "TONER-200", productName: "Calming Toner 200ml", defaultTheoreticalQty: 900 },
  { sku: "SERUM-50", productName: "Hydrating Serum 50ml", defaultTheoreticalQty: 1200 },
  { sku: "CREAM-30", productName: "Moisture Cream 30ml", defaultTheoreticalQty: 600 },
];

export type MaterialLine = {
  id: string;
  itemCode: string;
  itemName: string;
  qty: number;
  unit: string;
  lotNo?: string;
};

export type MaterialShipmentRecord = {
  id: string;
  bundleId: string;
  number: string;
  shippedAt: string;
  status: "planned" | "shipped" | "partial";
  manufacturerId: string;
  manufacturerName: string;
  lines: MaterialLine[];
  note?: string;
};

/** SKU별 기본 BOM (신규 묶음 출하 폼 프리필) */
export const BOM_TEMPLATES: Record<string, MaterialLine[]> = {
  "LOTION-250": [
    { id: "ml-1", itemCode: "RM-WATER", itemName: "정제수", qty: 1200, unit: "L" },
    { id: "ml-2", itemCode: "RM-LOTION-BASE", itemName: "로션 베이스", qty: 800, unit: "kg" },
    { id: "ml-3", itemCode: "RM-PUMP", itemName: "펌프·캡 세트", qty: 5500, unit: "EA" },
    { id: "ml-4", itemCode: "RM-BOX", itemName: "단상자", qty: 5500, unit: "EA" },
  ],
  "TONER-200": [
    { id: "mt-1", itemCode: "RM-WATER", itemName: "정제수", qty: 400, unit: "L" },
    { id: "mt-2", itemCode: "RM-TONER-ACT", itemName: "토너 액상", qty: 350, unit: "kg" },
    { id: "mt-3", itemCode: "RM-BOTTLE-200", itemName: "200ml 용기", qty: 950, unit: "EA" },
  ],
  "SERUM-50": [
    { id: "ms-1", itemCode: "RM-WATER", itemName: "정제수", qty: 200, unit: "L" },
    { id: "ms-2", itemCode: "RM-SERUM-ACT", itemName: "세럼 원료", qty: 180, unit: "kg" },
    { id: "ms-3", itemCode: "RM-DROPPER", itemName: "드로퍼 병", qty: 1250, unit: "EA" },
  ],
  "CREAM-30": [
    { id: "mc-1", itemCode: "RM-WATER", itemName: "정제수", qty: 80, unit: "L" },
    { id: "mc-2", itemCode: "RM-CREAM-BASE", itemName: "크림 베이스", qty: 120, unit: "kg" },
    { id: "mc-3", itemCode: "RM-JAR-30", itemName: "30ml 용기", qty: 620, unit: "EA" },
  ],
};

function catalogShipmentLines(
  sku: string,
  targetUnits: number,
  idPrefix: string,
): MaterialLine[] {
  const { products, brandLines } = INITIAL_CATALOG_FROM_SEED;
  const product = resolveCatalogProduct(products, sku);
  if (!product) return (BOM_TEMPLATES[sku] ?? []).map((l) => ({ ...l, id: `${idPrefix}-${l.id}` }));
  const line = brandLines.find((l) => l.id === product.lineId);
  return buildShipmentLinesFromCatalog(
    product,
    line?.name ?? "",
    targetUnits,
  ).map((l) => ({ ...l, id: `${idPrefix}-${l.id}` }));
}

export const INITIAL_MATERIAL_SHIPMENTS: MaterialShipmentRecord[] = [
  {
    id: "mshp-001",
    bundleId: "mb-2026-001",
    number: "MSHP-001",
    shippedAt: "2026-06-02",
    status: "shipped",
    manufacturerId: "mfr-yunhua",
    manufacturerName: "Yunhua BioLab",
    lines: catalogShipmentLines("AEVO-SER-01", 1100, "s"),
  },
  {
    id: "mshp-002",
    bundleId: "mb-2026-002",
    number: "MSHP-002",
    shippedAt: "2026-05-16",
    status: "shipped",
    manufacturerId: "mfr-lianxi",
    manufacturerName: "Lianxi DermaWorks",
    lines: catalogShipmentLines("LUMI-TON-01", 800, "t"),
  },
  {
    id: "mshp-004",
    bundleId: "mb-2026-004",
    number: "MSHP-004-A",
    shippedAt: "2026-04-05",
    status: "shipped",
    manufacturerId: "mfr-yunhua",
    manufacturerName: "Yunhua BioLab",
    note: "1차 전량",
    lines: catalogShipmentLines("AEVO-LOT-01", 8000, "l"),
  },
  {
    id: "mshp-004b",
    bundleId: "mb-2026-004",
    number: "MSHP-004-B",
    shippedAt: "2026-05-20",
    status: "partial",
    manufacturerId: "mfr-yunhua",
    manufacturerName: "Yunhua BioLab",
    note: "펌프만 추가 출하 (부분)",
    lines: [
      { id: "l-p1", itemCode: "RM-PUMP", itemName: "펌프·캡 세트", qty: 1200, unit: "EA" },
    ],
  },
];

export function getBomTemplate(sku: string, targetUnits = 1000): MaterialLine[] {
  const fromCatalog = catalogShipmentLines(sku, targetUnits, "new");
  if (fromCatalog.length) return fromCatalog;
  return (BOM_TEMPLATES[sku] ?? []).map((l) => ({
    ...l,
    id: `new-${l.itemCode}-${Date.now()}`,
  }));
}

export function sumLinesToTheoreticalHint(lines: MaterialLine[], sku: string): number | null {
  const template = BOM_TEMPLATES[sku];
  const line = PRODUCT_LINES.find((p) => p.sku === sku);
  if (!template?.length || !line) return null;
  return line.defaultTheoreticalQty;
}
