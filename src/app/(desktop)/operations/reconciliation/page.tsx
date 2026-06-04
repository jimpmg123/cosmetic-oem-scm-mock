"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { TermLabel } from "@/components/ui/term-tooltip";
import { DataTable, PageHeader } from "@/components/layout/page-parts";
import { useLocale } from "@/components/providers/locale-provider";
import { useMockStore } from "@/components/providers/mock-store-provider";
import { calcInboundDiscrepancy } from "@/lib/mock/data";
import { calcQcRate } from "@/lib/mock/analytics";
import { YieldSummaryRow } from "@/components/material-bundles/yield-summary-row";
import {
  calcBundleE2eYield,
  calcBundleYield,
  formatPct,
} from "@/lib/mock/material-bundles";
import { getBundleSummaryDonutMetrics } from "@/lib/mock/bundle-metric-display";
import {
  calcBundleInboundAchievement,
  calcBundleOverallAchievement,
  isBundleYieldFinalized,
} from "@/lib/mock/yield-metrics";

type TabId = "bc" | "directive" | "bundle";

export default function ReconciliationPage() {
  const { t } = useLocale();
  const [tab, setTab] = useState<TabId>("bc");
  const {
    workOrders,
    directives,
    materialBundles,
    dailyLogs,
    getDirectiveAnalytics,
  } = useMockStore();

  const woRows = workOrders.filter(
    (wo) => wo.bShippedQty != null || wo.cReceivedQty != null,
  );

  const directiveRows = useMemo(
    () =>
      directives
        .filter((d) => d.status !== "draft" && d.status !== "cancelled")
        .map((d) => {
          const a = getDirectiveAnalytics(d.id);
          const bundle = materialBundles.find((b) => b.id === d.bundleId);
          return { directive: d, bundle, analytics: a };
        }),
    [directives, materialBundles, getDirectiveAnalytics],
  );

  const headlineBundle = materialBundles.find((b) => b.status === "active");

  const bundleRows = useMemo(
    () =>
      materialBundles
        .filter((b) => b.status === "active" || b.status === "depleted")
        .map((b) => {
          const logs = dailyLogs.filter((l) => l.bundleId === b.id);
          const produced = logs.reduce((s, l) => s + l.producedQty, 0);
          const qc = logs.reduce((s, l) => s + (l.qcSampleQty ?? 0), 0);
          const bcGap = b.shippedToCTotal - b.receivedAtCTotal;
          const finalized = isBundleYieldFinalized(b);
          return {
            bundle: b,
            inboundPct: calcBundleInboundAchievement(b),
            producedPct: calcBundleOverallAchievement(b),
            e2eFinalPct: finalized ? calcBundleE2eYield(b) : null,
            yieldPct: finalized ? calcBundleYield(b) : null,
            qcRate: calcQcRate(produced, qc),
            bcGap,
          };
        }),
    [materialBundles, dailyLogs],
  );

  const tabs: { id: TabId; label: string }[] = [
    { id: "bc", label: t("reconciliation.tab.bc") },
    { id: "directive", label: t("reconciliation.tab.directive") },
    { id: "bundle", label: t("reconciliation.tab.bundle") },
  ];

  return (
    <>
      <PageHeader
        title={t("reconciliation.title")}
        description={t("reconciliation.desc")}
      />

      {headlineBundle ? (
        <YieldSummaryRow
          items={getBundleSummaryDonutMetrics(headlineBundle).map((m) => ({
            pct: m.pct,
            numerator: m.numerator,
            denominator: m.denominator,
            caption: t(m.captionKey),
          }))}
        />
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2 border-b border-scm-outline-variant">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === item.id
                ? "border-scm-secondary text-scm-primary"
                : "border-transparent text-scm-on-surface-variant hover:text-scm-primary"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "bc" ? (
        <DataTable
          columns={[
            { key: "wo", label: <TermLabel term="wo" /> },
            { key: "sku", label: <TermLabel term="sku" /> },
            { key: "expected", label: <TermLabel term="expected" />, align: "right" },
            { key: "located", label: <TermLabel term="located" />, align: "right" },
            { key: "discrepancy", label: <TermLabel term="discrepancy" />, align: "right" },
            { key: "action", label: t("common.actions") },
          ]}
          rows={woRows.map((wo) => {
            const disc = calcInboundDiscrepancy(wo);
            return {
              wo: wo.number,
              sku: wo.sku,
              expected: wo.bShippedQty?.toLocaleString() ?? "—",
              located: wo.cReceivedQty?.toLocaleString() ?? "—",
              discrepancy: disc?.toLocaleString() ?? "—",
              action: (
                <Badge variant={disc != null && disc < 0 ? "warning" : "success"}>
                  {disc != null && disc < 0
                    ? t("reconciliation.actionRequired")
                    : t("reconciliation.noAction")}
                </Badge>
              ),
            };
          })}
          emptyMessage={t("common.empty")}
        />
      ) : null}

      {tab === "directive" ? (
        <DataTable
          columns={[
            { key: "bundle", label: t("dailyLog.selectBundle") },
            { key: "due", label: t("bundle.directive.dueDate") },
            { key: "target", label: t("analytics.target"), align: "right" },
            { key: "received", label: t("analytics.received"), align: "right" },
            { key: "pct", label: t("analytics.achievement"), align: "right" },
            { key: "status", label: t("wo.col.status") },
          ]}
          rows={directiveRows.map(({ directive, bundle, analytics }) => ({
            bundle: bundle?.number ?? directive.bundleId,
            due: directive.dueDate,
            target: directive.targetQty.toLocaleString(),
            received: analytics?.receivedInWindow.toLocaleString() ?? "—",
            pct: analytics ? formatPct(analytics.achievementPct) : "—",
            status: (
              <Badge variant={analytics?.met ? "success" : "warning"}>
                {analytics?.met
                  ? t("reconciliation.directive.met")
                  : t("reconciliation.directive.missed")}
              </Badge>
            ),
          }))}
          emptyMessage={t("common.empty")}
        />
      ) : null}

      {tab === "bundle" ? (
        <DataTable
          columns={[
            { key: "number", label: t("bundle.col.number") },
            { key: "sku", label: t("bundle.col.product") },
            { key: "inbound", label: t("bundle.col.inboundAchievement"), align: "right" },
            { key: "e2eFinal", label: t("bundle.col.yieldE2eFinal"), align: "right" },
            { key: "yield", label: t("bundle.recon.yield"), align: "right" },
            { key: "qc", label: t("dailyLog.qcRate"), align: "right" },
            { key: "bcGap", label: t("bundle.recon.bcDiff"), align: "right" },
          ]}
          rows={bundleRows.map((row) => ({
            number: row.bundle.number,
            sku: row.bundle.sku,
            inbound: formatPct(row.inboundPct),
            e2eFinal: formatPct(row.e2eFinalPct),
            yield: formatPct(row.yieldPct),
            qc: formatPct(row.qcRate),
            bcGap: row.bcGap.toLocaleString(),
          }))}
          emptyMessage={t("common.empty")}
        />
      ) : null}
    </>
  );
}
