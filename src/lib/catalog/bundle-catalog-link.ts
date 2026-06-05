import {
  scaledMaterialQty,
  calcProductionLines,
  DEFAULT_LOSS_ALLOWANCE_PCT,
  type CatalogProduct,
} from "@/lib/mock/product-catalog";
import type { MaterialLine } from "@/lib/mock/material-shipment-lines";

/** legacy 묶음 SKU → 카탈로그 제품 id (하위 호환) */
export const BUNDLE_SKU_CATALOG_PRODUCT: Record<string, string> = {
  "SERUM-50": "prod-aevora-serum",
  "LOTION-250": "prod-aevora-lotion",
  "TONER-200": "prod-lumiara-toner",
  "CREAM-30": "prod-solenne-atelier-cream",
};

export function resolveCatalogProduct(
  products: CatalogProduct[],
  skuOrCode?: string,
  catalogProductId?: string,
): CatalogProduct | undefined {
  if (catalogProductId) {
    const byId = products.find((p) => p.id === catalogProductId);
    if (byId) return byId;
  }
  if (!skuOrCode) return undefined;
  const byCode = products.find((p) => p.code === skuOrCode);
  if (byCode) return byCode;
  const legacyId = BUNDLE_SKU_CATALOG_PRODUCT[skuOrCode];
  if (legacyId) return products.find((p) => p.id === legacyId);
  return undefined;
}

export function buildShipmentLinesFromCatalog(
  product: CatalogProduct,
  lineName: string,
  targetUnits: number,
  lossPct = DEFAULT_LOSS_ALLOWANCE_PCT,
): MaterialLine[] {
  const rows = calcProductionLines(product, targetUnits, lossPct, lineName);
  const stamp = Date.now();
  return rows.map((r, i) => ({
    id: `ml-${stamp}-${i}`,
    itemCode: r.itemCode,
    itemName: r.itemName,
    qty: r.qty,
    unit: r.unit,
  }));
}

export function buildShipmentLinesPerUnit(
  product: CatalogProduct,
  targetUnits: number,
  lossPct = DEFAULT_LOSS_ALLOWANCE_PCT,
): MaterialLine[] {
  const stamp = Date.now();
  return product.bom.map((b, i) => ({
    id: `ml-${stamp}-${i}`,
    itemCode: b.itemCode,
    itemName: b.itemName,
    qty: scaledMaterialQty(b.qtyPerUnit, targetUnits, lossPct),
    unit: b.unit,
  }));
}
