import type { BrandLine, CatalogProduct } from "@/lib/mock/product-catalog";

export type MaterialScopeKind = "global" | "line" | "product";

export type MaterialScopeInfo = {
  kind: MaterialScopeKind;
  lineName?: string;
};

/** itemCode → 전체 공용 / 라인 공용 / 제품 전용 */
export function buildMaterialScopeIndex(
  products: CatalogProduct[],
  brandLines: BrandLine[],
): Map<string, MaterialScopeInfo> {
  const lineNameById = new Map(brandLines.map((l) => [l.id, l.name]));
  const byCode = new Map<
    string,
    { lineIds: Set<string>; productIds: Set<string> }
  >();

  for (const product of products) {
    for (const bom of product.bom) {
      let entry = byCode.get(bom.itemCode);
      if (!entry) {
        entry = { lineIds: new Set(), productIds: new Set() };
        byCode.set(bom.itemCode, entry);
      }
      entry.lineIds.add(product.lineId);
      entry.productIds.add(product.id);
    }
  }

  const index = new Map<string, MaterialScopeInfo>();
  for (const [itemCode, { lineIds, productIds }] of byCode) {
    if (lineIds.size >= 2) {
      index.set(itemCode, { kind: "global" });
      continue;
    }
    if (productIds.size >= 2) {
      const lineId = [...lineIds][0];
      index.set(itemCode, {
        kind: "line",
        lineName: lineNameById.get(lineId) ?? "—",
      });
      continue;
    }
    index.set(itemCode, { kind: "product" });
  }
  return index;
}

/** 제품/라인 열 표시: 전체 공용 → -, 라인 공용 → 라인명, 제품 전용 → 제품명 */
export function formatProductLineLabel(
  itemCode: string,
  productName: string | undefined,
  scopeIndex: Map<string, MaterialScopeInfo>,
): string {
  const scope = scopeIndex.get(itemCode);
  if (!scope || scope.kind === "global") return "—";
  if (scope.kind === "line") return scope.lineName ?? "—";
  return productName?.trim() || "—";
}
