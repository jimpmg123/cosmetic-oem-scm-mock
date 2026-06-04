"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { useMockStore } from "@/components/providers/mock-store-provider";
import { YieldSummaryRow } from "@/components/material-bundles/yield-summary-row";
import { formatPct } from "@/lib/mock/material-bundles";

export default function DirectiveAnalyticsPage() {
  const { t } = useLocale();
  const { directives, materialBundles, getDirectiveAnalytics } = useMockStore();

  const cases = useMemo(
    () =>
      directives
        .filter((d) => d.status !== "draft" && d.status !== "cancelled")
        .map((d) => {
          const bundle = materialBundles.find((b) => b.id === d.bundleId);
          return { directive: d, bundle };
        })
        .sort((a, b) => b.directive.dueDate.localeCompare(a.directive.dueDate)),
    [directives, materialBundles],
  );

  const [directiveId, setDirectiveId] = useState(cases[0]?.directive.id ?? "");
  const analytics = directiveId ? getDirectiveAnalytics(directiveId) : null;
  const selected = cases.find((c) => c.directive.id === directiveId);

  const chartMax = useMemo(() => {
    if (!analytics?.daily.length) return 1;
    return Math.max(
      1,
      analytics.targetQty,
      ...analytics.daily.map((d) =>
        Math.max(d.produced, d.shipped, d.received),
      ),
    );
  }, [analytics]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-scm-primary">{t("analytics.title")}</h1>
        <p className="mt-1 text-sm text-scm-on-surface-variant">{t("analytics.desc")}</p>
        <p className="mt-2 text-sm font-medium text-scm-secondary">{t("analytics.metricReceived")}</p>
      </div>

      <label className="block max-w-xl text-sm">
        <span className="font-medium">{t("analytics.selectDirective")}</span>
        <select
          className="mt-1 w-full rounded-md border border-scm-outline-variant px-3 py-2"
          value={directiveId}
          onChange={(e) => setDirectiveId(e.target.value)}
        >
          {cases.map(({ directive, bundle }) => (
            <option key={directive.id} value={directive.id}>
              {bundle?.number ?? directive.bundleId} · {directive.dueDate} · y=
              {directive.targetQty.toLocaleString()}
              {directive.comment ? ` — ${directive.comment}` : ""}
            </option>
          ))}
        </select>
      </label>

      {analytics && selected ? (
        <>
          <YieldSummaryRow
            items={[
              {
                pct: analytics.achievementPct,
                numerator: analytics.receivedInWindow,
                denominator: analytics.targetQty,
                caption: t("analytics.achievement"),
              },
              {
                pct:
                  analytics.targetQty > 0
                    ? (analytics.producedInWindow / analytics.targetQty) * 100
                    : null,
                numerator: analytics.producedInWindow,
                denominator: analytics.targetQty,
                caption: t("analytics.produced"),
              },
            ]}
          />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <MetricCard label={t("analytics.target")} value={analytics.targetQty.toLocaleString()} />
            <MetricCard label={t("analytics.produced")} value={analytics.producedInWindow.toLocaleString()} />
            <MetricCard label={t("analytics.shipped")} value={analytics.shippedInWindow.toLocaleString()} />
            <MetricCard
              label={t("analytics.received")}
              value={analytics.receivedInWindow.toLocaleString()}
              highlight
            />
            <MetricCard
              label={t("analytics.achievement")}
              value={formatPct(analytics.achievementPct)}
              badge={analytics.met ? "met" : "missed"}
            />
          </div>

          <p className="text-xs text-scm-on-surface-variant">
            {analytics.windowStart} — {analytics.windowEnd}
            {analytics.qcRate != null ? ` · QC ${formatPct(analytics.qcRate)}` : ""}
          </p>

          <section className="rounded-lg border border-scm-outline-variant bg-scm-surface-lowest p-5">
            <h2 className="font-medium text-scm-primary">{t("analytics.chart")}</h2>
            <div className="mt-4 space-y-2">
              {analytics.daily.length === 0 ? (
                <p className="text-sm text-scm-on-surface-variant">{t("common.empty")}</p>
              ) : (
                analytics.daily.map((row) => (
                  <div key={row.date} className="grid grid-cols-[72px_1fr] items-center gap-2 text-xs">
                    <span className="text-scm-on-surface-variant">{row.date.slice(5)}</span>
                    <div className="space-y-0.5">
                      <BarRow color="bg-scm-secondary" value={row.produced} max={chartMax} />
                      <BarRow color="bg-amber-400" value={row.shipped} max={chartMax} />
                      <BarRow color="bg-emerald-600" value={row.received} max={chartMax} />
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-scm-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded bg-scm-secondary" /> {t("analytics.produced")}
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded bg-amber-400" /> {t("analytics.shipped")}
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded bg-emerald-600" /> {t("analytics.received")}
              </span>
            </div>
          </section>

          <section className="overflow-x-auto rounded-lg border border-scm-outline-variant">
            <h2 className="border-b px-4 py-3 font-medium">{t("analytics.dailyTable")}</h2>
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b bg-scm-surface-container-low text-left text-scm-on-surface-variant">
                  <th className="px-4 py-2.5 font-medium">{t("bundle.daily.date")}</th>
                  <th className="px-4 py-2.5 font-medium text-right">{t("analytics.produced")}</th>
                  <th className="px-4 py-2.5 font-medium text-right">{t("analytics.shipped")}</th>
                  <th className="px-4 py-2.5 font-medium text-right">{t("analytics.received")}</th>
                  <th className="px-4 py-2.5 font-medium text-right">{t("bundle.daily.qc")}</th>
                </tr>
              </thead>
              <tbody>
                {analytics.daily.map((row) => (
                  <tr key={row.date} className="border-b last:border-0">
                    <td className="px-4 py-2.5">{row.date}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{row.produced.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{row.shipped.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-medium text-emerald-800">
                      {row.received.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{row.qcSample.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      ) : (
        <p className="text-scm-on-surface-variant">{t("common.empty")}</p>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  highlight,
  badge,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  badge?: "met" | "missed";
}) {
  const { t } = useLocale();
  return (
    <div
      className={`rounded-lg border px-4 py-3 ${
        highlight
          ? "border-emerald-300 bg-emerald-50"
          : "border-scm-outline-variant bg-scm-surface-container-low"
      }`}
    >
      <p className="text-xs text-scm-on-surface-variant">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-scm-primary">{value}</p>
      {badge ? (
        <p
          className={`mt-1 text-xs font-medium ${
            badge === "met" ? "text-emerald-700" : "text-amber-800"
          }`}
        >
          {badge === "met"
            ? t("reconciliation.directive.met")
            : t("reconciliation.directive.missed")}
        </p>
      ) : null}
    </div>
  );
}

function BarRow({
  color,
  value,
  max,
}: {
  color: string;
  value: number;
  max: number;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex h-2 items-center gap-1">
      <div className="h-full flex-1 overflow-hidden rounded bg-scm-surface-container-high">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right tabular-nums text-scm-on-surface-variant">{value || ""}</span>
    </div>
  );
}
