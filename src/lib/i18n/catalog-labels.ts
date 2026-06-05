import labels from "@/lib/i18n/catalog-labels.json";
import type { Locale } from "@/lib/i18n/translations";
import type { CosmeticType } from "@/lib/mock/product-catalog";

type LabelEntry = { ko: string; en: string; zh: string };

const cosmeticType = labels.cosmeticType as Record<CosmeticType, LabelEntry>;

export const COSMETIC_TYPES = Object.keys(cosmeticType) as CosmeticType[];

export function getCosmeticTypeLabel(locale: Locale, type: CosmeticType): string {
  const entry = cosmeticType[type];
  if (!entry) return type;
  return entry[locale] ?? entry.en ?? entry.ko;
}

/** BOM/재료명은 시드 JSON의 고유명·INCI를 유지. 번역이 필요하면 material-names.json 추가 */
export function getMaterialDisplayName(
  _locale: Locale,
  itemCode: string,
  itemName: string,
): string {
  return itemName || itemCode;
}
