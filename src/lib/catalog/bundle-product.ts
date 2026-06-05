import type { MaterialBundle } from "@/lib/mock/material-bundles";
import {
  COSMETIC_TYPE_LABELS,
  type BrandLine,
  type CatalogProduct,
} from "@/lib/mock/product-catalog";
import { formatVolumeAmount } from "@/lib/catalog/format-volume";

/** 신규 묶음 등록 시 제품 선택 후 생산 가능 수량 기본값 (mock) */
export const DEFAULT_BUNDLE_THEORETICAL_QTY = 1000;

export function formatCatalogProductOptionLabel(
  product: CatalogProduct,
  lineName: string,
): string {
  const type = COSMETIC_TYPE_LABELS[product.cosmeticType];
  const vol = product.productVolume
    ? formatVolumeAmount(product.productVolume)
    : "";
  return [product.code, lineName, type, vol, product.name].filter(Boolean).join(" · ");
}

export function formatBundleProductLabel(
  bundle: Pick<MaterialBundle, "sku" | "productName" | "lineName">,
): string {
  const code = bundle.sku;
  if (bundle.lineName) {
    return `${code} · ${bundle.lineName} · ${bundle.productName}`;
  }
  return `${code} — ${bundle.productName}`;
}

export function resolveLineForProduct(
  brandLines: BrandLine[],
  product: CatalogProduct,
): BrandLine | undefined {
  return brandLines.find((l) => l.id === product.lineId);
}

export function catalogProductById(
  products: CatalogProduct[],
  productId: string,
): CatalogProduct | undefined {
  return products.find((p) => p.id === productId);
}
