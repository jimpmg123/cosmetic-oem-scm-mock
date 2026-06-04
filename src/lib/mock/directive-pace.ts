import type { PeriodDirective } from "@/lib/mock/material-bundles";
import { getDirectiveWindow } from "@/lib/mock/analytics";

export function inclusiveCalendarDays(start: string, end: string): number {
  const a = new Date(`${start}T12:00:00`);
  const b = new Date(`${end}T12:00:00`);
  const diff = Math.round((b.getTime() - a.getTime()) / 86_400_000);
  return Math.max(1, diff + 1);
}

export function getActiveDirective(
  directives: PeriodDirective[],
  bundleId: string,
): PeriodDirective | undefined {
  return directives
    .filter(
      (d) =>
        d.bundleId === bundleId &&
        (d.status === "issued" || d.status === "in_progress"),
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
}

export function calcDailyPace(directive: PeriodDirective): {
  start: string;
  end: string;
  windowDays: number;
  dailyPace: number;
} {
  const { start, end } = getDirectiveWindow(directive);
  const windowDays = inclusiveCalendarDays(start, end);
  const dailyPace =
    directive.targetQty > 0 ? directive.targetQty / windowDays : 0;
  return { start, end, windowDays, dailyPace };
}

export function isDateInDirectiveWindow(
  date: string,
  start: string,
  end: string,
): boolean {
  return date >= start && date <= end;
}

/** 일할 대비 생산 비율 → 히트맵 단계 0–4 (0 = 지시 기간 내 생산 없음 → 회색) */
export function heatLevelFromPaceRatio(
  producedQty: number,
  dailyPace: number,
): number {
  if (dailyPace <= 0 || producedQty <= 0) return 0;
  const ratio = producedQty / dailyPace;
  if (ratio < 0.5) return 1;
  if (ratio < 0.8) return 2;
  if (ratio < 1) return 3;
  return 4;
}

export type MonthWindowScope = "fully_inside" | "partial" | "fully_outside";

export type DirectiveCalendarCell = {
  date: string;
  qty: number;
  /** 지시 시작~마감 사이 */
  inWindow: boolean;
  /** inWindow일 때만 일할 대비 단계 (0 = 생산 없음) */
  level: number;
};

function isoDate(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** 해당 월이 지시 창과 겹치는지 (3월처럼 전부 밖이면 fully_outside) */
export function getMonthWindowScope(
  year: number,
  monthIndex: number,
  windowStart: string,
  windowEnd: string,
): MonthWindowScope {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const firstIso = isoDate(year, monthIndex, 1);
  const lastIso = isoDate(year, monthIndex, lastDay);

  if (lastIso < windowStart || firstIso > windowEnd) {
    return "fully_outside";
  }
  if (firstIso >= windowStart && lastIso <= windowEnd) {
    return "fully_inside";
  }
  return "partial";
}

/** 해당 월 1일~말일 전부 표시. 기간 밖 날(1~9일 등)은 inWindow=false */
export function buildDirectiveMonthCells(
  year: number,
  monthIndex: number,
  windowStart: string,
  windowEnd: string,
  dailyPace: number,
  getQtyForDate: (iso: string) => number,
): {
  cells: DirectiveCalendarCell[];
  padStart: number;
  monthScope: MonthWindowScope;
} {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const monthScope = getMonthWindowScope(
    year,
    monthIndex,
    windowStart,
    windowEnd,
  );
  const cells: DirectiveCalendarCell[] = [];

  for (let d = 1; d <= lastDay; d++) {
    const iso = isoDate(year, monthIndex, d);
    const inWindow = isDateInDirectiveWindow(iso, windowStart, windowEnd);
    const qty = getQtyForDate(iso);
    cells.push({
      date: iso,
      qty,
      inWindow,
      level: inWindow ? heatLevelFromPaceRatio(qty, dailyPace) : 0,
    });
  }

  const padStart = new Date(year, monthIndex, 1).getDay();

  return { cells, padStart, monthScope };
}

export function formatCalendarMonth(
  year: number,
  monthIndex: number,
  locale: string,
): string {
  return new Date(year, monthIndex, 1).toLocaleDateString(
    locale === "ko" ? "ko-KR" : locale === "zh" ? "zh-CN" : "en-US",
    { year: "numeric", month: "long" },
  );
}

export function shiftMonth(
  year: number,
  monthIndex: number,
  delta: number,
): { year: number; monthIndex: number } {
  const d = new Date(year, monthIndex + delta, 1);
  return { year: d.getFullYear(), monthIndex: d.getMonth() };
}
