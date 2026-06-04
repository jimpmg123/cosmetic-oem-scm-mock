"use client";

import { useMemo } from "react";
import { FeaturedProductYieldCard } from "@/components/yield-overview/featured-product-card";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { useLocale } from "@/components/providers/locale-provider";
import { useMockStore } from "@/components/providers/mock-store-provider";
import { formatPct } from "@/lib/mock/material-bundles";
import {
  buildCompanyYieldRows,
  getLatestBundle,
  getPeriodAchievementCompare,
} from "@/lib/mock/yield-overview";
import { cn } from "@/lib/utils";

export default function YieldOverviewPage() {
  const { t } = useLocale();
  const { materialBundles } = useMockStore();

  const latest = useMemo(
    () => getLatestBundle(materialBundles),
    [materialBundles],
  );
  const period = latest ? getPeriodAchievementCompare(latest.id, latest) : null;
  const companyRows = useMemo(
    () => buildCompanyYieldRows(materialBundles),
    [materialBundles],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-scm-primary">
          {t("yieldOverview.title")}
        </h1>
        <p className="mt-1 text-sm text-scm-on-surface-variant">
          {t("yieldOverview.desc")}
        </p>
      </div>

      {latest && period ? (
        <FeaturedProductYieldCard bundle={latest} period={period} />
      ) : (
        <DashboardCard>
          <p className="text-sm text-scm-on-surface-variant">{t("common.empty")}</p>
        </DashboardCard>
      )}

      <DashboardCard
        title={t("yieldOverview.company.title")}
        subtitle={t("yieldOverview.company.desc")}
      >
        <div className="overflow-x-auto -mx-1">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-scm-outline-variant/60 bg-[#F8F9FA] text-left text-[11px] font-semibold uppercase tracking-wide text-scm-on-surface-variant">
                <th className="px-3 py-3">{t("yieldOverview.company.name")}</th>
                <th className="px-3 py-3">{t("yieldOverview.company.lines")}</th>
                <th className="px-3 py-3 text-right">{t("yieldOverview.company.bundles")}</th>
                <th className="px-3 py-3 text-right">
                  {t("yieldOverview.company.inboundAchievement")}
                </th>
                <th className="px-3 py-3 text-right">
                  {t("yieldOverview.company.e2eFinal")}
                </th>
                <th className="px-3 py-3 text-right">{t("yieldOverview.company.bShipped")}</th>
                <th className="px-3 py-3 text-right">{t("yieldOverview.company.cReceived")}</th>
              </tr>
            </thead>
            <tbody>
              {companyRows.map((row) => (
                <tr
                  key={row.manufacturer.id}
                  className={cn(
                    "border-b border-scm-outline-variant/40 last:border-0",
                    !row.hasLines && "bg-scm-surface-container-low/40",
                  )}
                >
                  <td className="px-3 py-3">
                    <p className="font-medium text-scm-primary">
                      {row.manufacturer.name}
                    </p>
                    <p className="text-xs text-scm-on-surface-variant">
                      {row.manufacturer.chineseName}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-scm-on-surface-variant">
                    {row.hasLines ? (
                      row.lineLabel
                    ) : (
                      <span className="rounded-full bg-scm-planned-bg px-2 py-0.5 text-xs font-medium text-scm-planned-text">
                        {t("yieldOverview.company.noLines")}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {row.hasLines ? row.activeBundles : "—"}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums font-medium">
                    {row.hasLines ? formatPct(row.inboundAchievementPct) : "—"}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-scm-on-surface-variant">
                    {row.hasLines ? formatPct(row.e2eFinalPct) : "—"}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {row.hasLines ? row.bShippedTotal.toLocaleString() : "—"}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {row.hasLines ? row.cReceivedTotal.toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  );
}
