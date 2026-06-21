/**
 * 운영 구조 2 공용 검색 (정형화)
 *
 * `filterByQuery`는 어떤 리스트든 "검색 대상 텍스트"만 정의하면 동작하는 제네릭.
 * 제품 검색은 이름·SKU·바코드·유형·LOT 포맷을 대상으로 한다.
 * 입고/재고/추적 페이지가 생기면 그쪽 항목용 `toText`만 추가해 같은 검색을 재사용한다
 * (예: 시리얼넘버·실제 LOT은 인스턴스 데이터라 그 단계에서 검색 대상에 포함).
 */

import { COSMETIC_TYPE_LABELS, type CatalogProduct } from "@/lib/mock/product-catalog";
import { getSupplySpec } from "@/lib/mock/china-supply/applicell-catalog";

/** 다중 단어 AND 부분일치 (대소문자 무시). 빈 쿼리는 전체 반환 */
export function filterByQuery<T>(
  items: T[],
  query: string,
  toText: (item: T) => string,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  const terms = q.split(/\s+/).filter(Boolean);
  return items.filter((item) => {
    const text = toText(item).toLowerCase();
    return terms.every((term) => text.includes(term));
  });
}

/** 제품 검색 대상 텍스트: 이름·SKU·유형·용량·바코드·LOT 포맷 */
export function productToText(p: CatalogProduct): string {
  const spec = getSupplySpec(p.id);
  return [
    p.name,
    p.code,
    COSMETIC_TYPE_LABELS[p.cosmeticType],
    p.productVolume ? `${p.productVolume.value}${p.productVolume.unit}` : "",
    spec?.barcode ?? "",
    spec?.lotFormat ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function searchProducts(
  products: CatalogProduct[],
  query: string,
): CatalogProduct[] {
  return filterByQuery(products, query, productToText);
}
