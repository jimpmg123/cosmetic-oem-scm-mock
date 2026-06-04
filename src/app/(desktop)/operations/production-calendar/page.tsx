"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { ProgressSummaryRow } from "@/components/material-bundles/progress-summary-row";
import { YieldSummaryRow } from "@/components/material-bundles/yield-summary-row";
import { useLocale } from "@/components/providers/locale-provider";
import { useMockStore } from "@/components/providers/mock-store-provider";
import { useRole } from "@/components/providers/role-provider";
import { canSeeStaffInputUi } from "@/lib/role-access";
import {
  buildDirectiveMonthCells,
  calcDailyPace,
  formatCalendarMonth,
  getActiveDirective,
  shiftMonth,
} from "@/lib/mock/directive-pace";
import {
  calcBundleE2eYield,
  calcBundleGrantQty,
  calcBundleYield,
  isBundleYieldFinalized,
} from "@/lib/mock/material-bundles";
import {
  calcBundleOverallAchievement,
  calcPeriodProductionAchievement,
} from "@/lib/mock/yield-metrics";
import {
  formatManufacturerLabel,
  INITIAL_MANUFACTURERS,
} from "@/lib/mock/manufacturer-seed";
import { inputClassName } from "@/components/layout/page-parts";

const HEAT_BG = [
  "bg-scm-surface-container-low text-scm-on-surface-variant",
  "bg-emerald-100 text-emerald-900",
  "bg-emerald-200 text-emerald-950",
  "bg-emerald-400 text-white",
  "bg-emerald-600 text-white",
];

/** 지시 기간 밖 (해당 월의 1~9일 등, 또는 지시 전·후 월 전체) */
const OUT_OF_WINDOW_CELL =
  "border border-dashed border-slate-300 bg-slate-50 text-slate-400";

const DEMO_BUNDLE_ID = "mb-2026-004";

export default function ProductionCalendarPage() {
  const { t, locale } = useLocale();
  const { role } = useRole();
  const staffInput = canSeeStaffInputUi(role);
  const { materialBundles, dailyLogs, directives } = useMockStore();
  const active = materialBundles.filter((b) => b.status === "active");

  const [manufacturerId, setManufacturerId] = useState(
    INITIAL_MANUFACTURERS[0]?.id ?? "",
  );

  const companyBundles = useMemo(
    () => active.filter((b) => b.vendorId === manufacturerId),
    [active, manufacturerId],
  );

  const defaultBundle =
    companyBundles.find((b) => b.id === DEMO_BUNDLE_ID)?.id ??
    companyBundles[0]?.id ??
    "";
  const [bundleId, setBundleId] = useState(defaultBundle);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const bundle = materialBundles.find((b) => b.id === bundleId);
  const bundleLogs = dailyLogs.filter((l) => l.bundleId === bundleId);
  const activeDirective = bundleId
    ? getActiveDirective(directives, bundleId)
    : undefined;
  const pace = activeDirective ? calcDailyPace(activeDirective) : null;

  const selectedMfr = INITIAL_MANUFACTURERS.find((m) => m.id === manufacturerId);

  useEffect(() => {
    if (!companyBundles.length) {
      setBundleId("");
      return;
    }
    if (!companyBundles.some((b) => b.id === bundleId)) {
      setBundleId(
        companyBundles.find((b) => b.id === DEMO_BUNDLE_ID)?.id ?? companyBundles[0].id,
      );
    }
  }, [manufacturerId, companyBundles, bundleId]);

  useEffect(() => {
    const d = new Date();
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [bundleId]);

  const monthLabel = formatCalendarMonth(viewYear, viewMonth, locale);
  const monthInputValue = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;

  const { cells, padStart, monthScope } = useMemo(() => {
    if (!pace) {
      return { cells: [], padStart: 0, monthScope: "fully_outside" as const };
    }
    const logMap = new Map(bundleLogs.map((l) => [l.date, l.producedQty]));
    return buildDirectiveMonthCells(
      viewYear,
      viewMonth,
      pace.start,
      pace.end,
      pace.dailyPace,
      (iso) => logMap.get(iso) ?? 0,
    );
  }, [pace, bundleLogs, viewYear, viewMonth]);

  const todayIso = new Date().toISOString().slice(0, 10);

  function goPrevMonth() {
    const next = shiftMonth(viewYear, viewMonth, -1);
    setViewYear(next.year);
    setViewMonth(next.monthIndex);
  }

  function goNextMonth() {
    const next = shiftMonth(viewYear, viewMonth, 1);
    setViewYear(next.year);
    setViewMonth(next.monthIndex);
  }

  function onMonthPick(value: string) {
    if (!value) return;
    const [y, m] = value.split("-").map(Number);
    setViewYear(y);
    setViewMonth(m - 1);
  }

  function renderCell(cell: (typeof cells)[0]) {
    const colorCls = cell.inWindow ? HEAT_BG[cell.level] : OUT_OF_WINDOW_CELL;
    const cls = `flex h-14 w-full flex-col items-center justify-center rounded-md text-xs tabular-nums leading-tight sm:h-16 ${colorCls}`;
    const title = cell.inWindow
      ? `${cell.date}: ${cell.qty}`
      : `${cell.date}: ${t("calendar.dayOutsideWindow")}`;
    const content = (
      <>
        <span className="text-[10px] font-medium opacity-70 sm:text-xs">
          {parseInt(cell.date.slice(-2), 10)}
        </span>
        <span
          className={`text-sm font-semibold sm:text-base ${!cell.inWindow ? "font-normal opacity-80" : ""}`}
        >
          {cell.inWindow ? (cell.qty > 0 ? cell.qty : "—") : "·"}
        </span>
      </>
    );

    if (staffInput && cell.inWindow) {
      return (
        <Link
          key={cell.date}
          href={`/operations/daily-log?bundleId=${bundleId}&date=${cell.date}`}
          className={`${cls} hover:ring-2 hover:ring-scm-secondary`}
          title={title}
        >
          {content}
        </Link>
      );
    }

    return (
      <div key={cell.date} className={cls} title={title}>
        {content}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-scm-primary">{t("calendar.title")}</h1>
          <p className="mt-1 text-sm text-scm-on-surface-variant">{t("calendar.desc")}</p>
          {selectedMfr ? (
            <p className="mt-1 text-xs text-scm-secondary">
              {formatManufacturerLabel(selectedMfr)}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:items-end">
          <label className="block w-full min-w-[240px] text-sm sm:max-w-xs">
            <span className="font-medium text-scm-primary">
              {t("calendar.selectManufacturer")}
            </span>
            <select
              className={`${inputClassName} mt-1`}
              value={manufacturerId}
              onChange={(e) => setManufacturerId(e.target.value)}
            >
              {INITIAL_MANUFACTURERS.map((m) => (
                <option key={m.id} value={m.id}>
                  {formatManufacturerLabel(m)}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-scm-on-surface-variant">
              {t("calendar.mfrHint")}
            </span>
          </label>

          {staffInput ? (
            <Button asChild className="w-full sm:w-auto">
              <Link href={`/operations/daily-log?bundleId=${bundleId}&date=${todayIso}`}>
                {t("calendar.writeLog")}
              </Link>
            </Button>
          ) : role === "b_admin" ? (
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/operations/daily-log/history">{t("nav.dailyLogHistory")}</Link>
            </Button>
          ) : null}
        </div>
      </div>

      {bundle ? (
        <div className="space-y-4">
          <ProgressSummaryRow
            items={[
              {
                pct: activeDirective
                  ? calcPeriodProductionAchievement(activeDirective, dailyLogs)
                  : null,
                numerator: activeDirective
                  ? dailyLogs
                      .filter((l) => {
                        if (l.bundleId !== bundle.id || !pace) return false;
                        return l.date >= pace.start && l.date <= pace.end;
                      })
                      .reduce((s, l) => s + l.producedQty, 0)
                  : 0,
                denominator: activeDirective?.targetQty ?? 0,
                caption: t("calendar.progressPeriod"),
                subcaption: activeDirective
                  ? `${activeDirective.number} · ${t("calendar.progressPeriodSub")}`
                  : t("calendar.noActiveDirective"),
              },
              {
                pct: calcBundleOverallAchievement(bundle),
                numerator: bundle.producedTotal,
                denominator: bundle.targetQty,
                caption: t("calendar.progressOverall"),
                subcaption: t("calendar.progressOverallSub"),
              },
            ]}
          />
          {isBundleYieldFinalized(bundle) ? (
            <YieldSummaryRow
              items={[
                {
                  pct: calcBundleYield(bundle),
                  numerator: bundle.receivedAtCTotal,
                  denominator: calcBundleGrantQty(bundle),
                  caption: t("bundle.donut.yield"),
                },
                {
                  pct: calcBundleE2eYield(bundle),
                  numerator: bundle.receivedAtCTotal,
                  denominator: bundle.targetQty,
                  caption: t("bundle.donut.e2e"),
                },
              ]}
            />
          ) : (
            <p className="text-sm text-scm-on-surface-variant">{t("calendar.yieldPending")}</p>
          )}
        </div>
      ) : null}

      <div className="rounded-lg border border-scm-outline-variant bg-scm-surface-lowest p-5">
        {companyBundles.length === 0 ? (
          <p className="text-sm text-scm-on-surface-variant">
            {t("calendar.noBundlesForMfr")}
          </p>
        ) : (
          <>
            <label className="block max-w-md text-sm">
              <span className="font-medium">{t("dailyLog.selectBundle")}</span>
              <select
                className="mt-1 w-full rounded-md border border-scm-outline-variant px-3 py-2"
                value={bundleId}
                onChange={(e) => setBundleId(e.target.value)}
              >
                {companyBundles.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.number} — {b.sku}
                  </option>
                ))}
              </select>
            </label>

            {pace && activeDirective ? (
              <p className="mt-3 text-sm text-scm-on-surface-variant">
                {t("calendar.paceLegend")} · y={activeDirective.targetQty.toLocaleString()} ·{" "}
                {pace.start} ~ {pace.end} ({pace.windowDays}
                {t("calendar.windowDays")}) · {t("bundle.directive.dailyPaceHint")}{" "}
                <strong className="tabular-nums text-scm-primary">
                  {Math.round(pace.dailyPace)}
                </strong>
              </p>
            ) : null}
          </>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-scm-primary">{monthLabel}</h2>
          {monthScope === "fully_outside" && pace ? (
            <p className="mt-1 text-sm text-amber-800/90">
              {t("calendar.monthOutsideDirective")}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-scm-on-surface-variant">{t("calendar.monthLabel")}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={goPrevMonth}
            aria-label={t("calendar.prevMonth")}
          >
            <MaterialIcon name="chevron_left" className="text-[22px]" />
          </Button>
          <input
            type="month"
            className="rounded-md border border-scm-outline-variant px-3 py-2 text-sm"
            value={monthInputValue}
            onChange={(e) => onMonthPick(e.target.value)}
            aria-label={t("calendar.monthLabel")}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={goNextMonth}
            aria-label={t("calendar.nextMonth")}
          >
            <MaterialIcon name="chevron_right" className="text-[22px]" />
          </Button>
        </div>
      </div>

      <section className="w-full rounded-lg border border-scm-outline-variant bg-scm-surface-lowest p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-medium text-scm-primary">{t("calendar.monthHeatmap")}</h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-scm-on-surface-variant">
            <span>{t("calendar.legendOutside")}</span>
            <span className="size-4 rounded border border-dashed border-slate-300 bg-slate-50" />
            <span className="mx-1 text-scm-outline-variant">·</span>
            <span>{t("calendar.inWindowGray")}</span>
            <span className={`size-4 rounded ${HEAT_BG[0].split(" ")[0]}`} />
            <span className="mx-1 text-scm-outline-variant">·</span>
            <span>{t("calendar.low")}</span>
            {HEAT_BG.slice(1).map((c, i) => (
              <span key={i} className={`size-4 rounded ${c.split(" ")[0]}`} />
            ))}
            <span>{t("calendar.high")}</span>
          </div>
        </div>

        {!pace ? (
          <p className="mt-6 text-sm text-scm-on-surface-variant">{t("common.empty")}</p>
        ) : (
          <div className="mt-5 w-full">
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-scm-on-surface-variant sm:gap-2">
              {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {Array.from({ length: padStart }).map((_, i) => (
                <div key={`pad-${i}`} className="h-14 sm:h-16" aria-hidden />
              ))}
              {cells.map((cell) => renderCell(cell))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
