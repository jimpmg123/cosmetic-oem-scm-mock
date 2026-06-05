import { dictionaries as localeDictionaries } from "./dictionaries.generated";

export type Locale = "ko" | "zh" | "en";

export type TermKey =
  | "wo"
  | "sku"
  | "po"
  | "shipment"
  | "yield"
  | "reconciliation"
  | "expected"
  | "located"
  | "discrepancy"
  | "bom"
  | "vendor"
  | "theoreticalOutput";

export type TranslationParams = Record<string, string | number>;

const dictionaries: Record<Locale, Record<string, string>> = localeDictionaries;

export const LOCALE_LABELS: Record<Locale, string> = {
  ko: "한국어",
  zh: "中文",
  en: "English",
};

export const translations = dictionaries;

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  let out = template;
  for (const [name, value] of Object.entries(params)) {
    out = out.replaceAll(`{${name}}`, String(value));
  }
  return out;
}

const HANGUL = /[\uac00-\ud7a3]/;

function resolve(locale: Locale, key: string): string | undefined {
  let value = dictionaries[locale][key];
  if (locale !== "ko" && value != null && HANGUL.test(value)) {
    const enVal = dictionaries.en[key];
    if (enVal != null && !HANGUL.test(enVal)) value = enVal;
  }
  if (value == null && locale === "zh") {
    const enVal = dictionaries.en[key];
    if (enVal != null) value = enVal;
  }
  return value;
}

export function t(
  locale: Locale,
  key: string,
  params?: TranslationParams,
): string {
  const value = resolve(locale, key);
  if (value == null) return key;
  return interpolate(value, params);
}
