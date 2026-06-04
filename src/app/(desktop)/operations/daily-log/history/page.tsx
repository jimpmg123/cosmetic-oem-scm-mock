"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { useMockStore } from "@/components/providers/mock-store-provider";
import { calcQcRate } from "@/lib/mock/analytics";
import { formatPct } from "@/lib/mock/material-bundles";

export default function DailyLogHistoryPage() {
  const { t } = useLocale();
  const { materialBundles, dailyLogs } = useMockStore();
  const active = materialBundles.filter((b) => b.status === "active" || b.status === "depleted");
  const [bundleId, setBundleId] = useState(active[0]?.id ?? "");

  const rows = useMemo(
    () =>
      dailyLogs
        .filter((l) => (bundleId ? l.bundleId === bundleId : true))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [dailyLogs, bundleId],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-scm-primary">{t("nav.dailyLogHistory")}</h1>
        <p className="mt-1 text-sm text-scm-on-surface-variant">{t("dailyLogHistory.desc")}</p>
      </div>

      <label className="block max-w-md text-sm">
        <span className="font-medium">{t("dailyLog.selectBundle")}</span>
        <select
          className="mt-1 w-full rounded-md border border-scm-outline-variant px-3 py-2"
          value={bundleId}
          onChange={(e) => setBundleId(e.target.value)}
        >
          {active.map((b) => (
            <option key={b.id} value={b.id}>
              {b.number} — {b.sku}
            </option>
          ))}
        </select>
      </label>

      <div className="overflow-x-auto rounded-lg border border-scm-outline-variant bg-scm-surface-lowest">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b bg-scm-surface-container-low text-left text-scm-on-surface-variant">
              <th className="px-4 py-3 font-medium">{t("bundle.daily.date")}</th>
              <th className="px-4 py-3 font-medium text-right">{t("bundle.daily.produced")}</th>
              <th className="px-4 py-3 font-medium text-right">{t("bundle.daily.defect")}</th>
              <th className="px-4 py-3 font-medium text-right">{t("bundle.daily.qc")}</th>
              <th className="px-4 py-3 font-medium text-right">{t("dailyLog.qcRate")}</th>
              <th className="px-4 py-3 font-medium">{t("dailyLog.note")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-scm-on-surface-variant">
                  {t("common.empty")}
                </td>
              </tr>
            ) : (
              rows.map((log) => (
                <tr key={log.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{log.date}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{log.producedQty.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{log.defectQty.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{(log.qcSampleQty ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatPct(calcQcRate(log.producedQty, log.qcSampleQty ?? 0))}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate">{log.note ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Link
        href="/operations/production-calendar"
        className="text-sm font-medium text-scm-link hover:underline"
      >
        {t("nav.productionCalendar")} →
      </Link>
    </div>
  );
}
