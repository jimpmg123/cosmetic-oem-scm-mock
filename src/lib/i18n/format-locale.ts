import type { Locale } from "@/lib/i18n/translations";
import type { DirectiveStatus } from "@/lib/mock/material-bundles";

export function formatWeekdayShort(locale: Locale, dayIndex: number): string {
  const ko = ["일", "월", "화", "수", "목", "금", "토"];
  const en = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const zh = ["日", "一", "二", "三", "四", "五", "六"];
  const row = locale === "zh" ? zh : locale === "en" ? en : ko;
  return row[dayIndex] ?? "";
}

export function formatDdayLabel(
  locale: Locale,
  dday: number,
  t: (key: string) => string,
): string {
  if (dday < 0) {
    const n = Math.abs(dday);
    return t("format.dday.overdue").replace("{n}", String(n));
  }
  if (dday === 0) return t("format.dday.today");
  return t("format.dday.until").replace("{n}", String(dday));
}

export function formatDirectiveStatus(
  locale: Locale,
  status: DirectiveStatus,
  t: (key: string) => string,
): string {
  const key = `directive.status.${status}`;
  const v = t(key);
  return v !== key ? v : status;
}

export function formatCountUnits(
  locale: Locale,
  count: number,
  t: (key: string) => string,
): string {
  if (locale === "en") return `${count.toLocaleString("en-US")} ${t("common.units")}`;
  if (locale === "zh") return `${count.toLocaleString("zh-CN")} ${t("common.units")}`;
  return `${count.toLocaleString("ko-KR")}${t("common.units")}`;
}
