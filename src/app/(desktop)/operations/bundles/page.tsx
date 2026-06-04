"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BundleStatusBadge } from "@/components/material-bundles/bundle-status-badge";
import { DDayBadge } from "@/components/material-bundles/d-day-badge";
import { Button } from "@/components/ui/button";
import { YieldSummaryRow } from "@/components/material-bundles/yield-summary-row";
import { useLocale } from "@/components/providers/locale-provider";
import { useMockStore } from "@/components/providers/mock-store-provider";
import { useRole } from "@/components/providers/role-provider";
import { formatDateRange, formatPct, sortBundlesForList } from "@/lib/mock/material-bundles";
import { getBundleSummaryDonutMetrics } from "@/lib/mock/bundle-metric-display";
import { calcBundleInboundAchievement } from "@/lib/mock/yield-metrics";

export default function BBundlesListPage() {
  const { t, locale } = useLocale();
  const { role } = useRole();
  const router = useRouter();
  const isBAdmin = role === "b_admin";
  const {
    materialBundles,
    getDirectivesForBundle,
    isBundleAtRiskReceipt,
  } = useMockStore();

  const visible = sortBundlesForList(
    materialBundles.filter(
      (b) => b.status === "active" || b.status === "depleted" || b.status === "closed",
    ),
  );

  const activeCards = visible.filter((b) => b.status === "active");
  const headline = activeCards[0];
  const headlineMetrics = headline ? getBundleSummaryDonutMetrics(headline) : [];

  return (
    <div className="space-y-8">
      {headline ? (
        <YieldSummaryRow
          items={headlineMetrics.map((m) => ({
            pct: m.pct,
            numerator: m.numerator,
            denominator: m.denominator,
            caption: t(m.captionKey),
          }))}
        />
      ) : null}

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-scm-primary">
          {t("bundle.bList.title")}
        </h1>
        <p className="mt-1 text-sm text-scm-on-surface-variant">
          {t("bundle.bList.desc")}
        </p>
      </div>

      {activeCards.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {activeCards.map((bundle) => {
            const atRisk = isBundleAtRiskReceipt(bundle.id);
            const nextDirective = getDirectivesForBundle(bundle.id)
              .filter((d) => d.status === "issued" || d.status === "in_progress")
              .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
            const inbound = calcBundleInboundAchievement(bundle);

            return (
              <article
                key={bundle.id}
                className="rounded-lg border border-scm-outline-variant bg-scm-surface-lowest p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/operations/bundles/${bundle.id}`}
                      className="text-lg font-semibold text-scm-link hover:underline"
                    >
                      {bundle.number}
                    </Link>
                    <p className="text-sm text-scm-on-surface-variant">
                      {bundle.sku} — {bundle.productName}
                    </p>
                  </div>
                  <BundleStatusBadge status={bundle.status} />
                </div>

                {atRisk ? (
                  <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    {t("bundle.atRiskReceipt")}
                  </p>
                ) : null}

                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-scm-on-surface-variant">{t("bundle.kpi.produced")}</dt>
                    <dd className="font-medium tabular-nums">
                      {bundle.producedTotal.toLocaleString()} / {bundle.targetQty.toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-scm-on-surface-variant">
                      {t("bundle.col.inboundAchievement")}
                    </dt>
                    <dd className="font-medium">{formatPct(inbound)}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-scm-on-surface-variant">{t("bundle.nextDirective")}</dt>
                    <dd>
                      {nextDirective
                        ? `${nextDirective.dueDate} · ${nextDirective.targetQty.toLocaleString()}`
                        : "—"}
                    </dd>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <dd>{formatDateRange(bundle.useFromDate, bundle.useByDate, locale)}</dd>
                    <DDayBadge useByDate={bundle.useByDate} />
                  </div>
                </dl>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/operations/production-calendar?bundleId=${bundle.id}`}>
                      {t("nav.productionCalendar")}
                    </Link>
                  </Button>
                  {isBAdmin ? (
                    <>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/operations/daily-log/history?bundleId=${bundle.id}`}>
                          {t("nav.dailyLogHistory")}
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/operations/material-receipt?bundleId=${bundle.id}`}>
                          {t("bundle.bCard.receipt")}
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/operations/shipments?bundleId=${bundle.id}`}>
                          {t("bundle.bCard.ship")}
                        </Link>
                      </Button>
                    </>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-scm-on-surface-variant">
          {t("bundle.bList.allTable")}
        </h2>
        {visible.length === 0 ? (
          <p className="text-scm-on-surface-variant">{t("common.empty")}</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-scm-outline-variant bg-scm-surface-lowest">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b bg-scm-surface-container-low text-left text-scm-on-surface-variant">
                  <th className="px-4 py-3 font-medium">{t("bundle.col.number")}</th>
                  <th className="px-4 py-3 font-medium">{t("bundle.col.product")}</th>
                  <th className="px-4 py-3 font-medium">{t("bundle.col.period")}</th>
                  <th className="px-4 py-3 font-medium text-right">
                    {t("bundle.col.inboundAchievement")}
                  </th>
                  <th className="px-4 py-3 font-medium">{t("wo.col.status")}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((bundle) => (
                  <tr
                    key={bundle.id}
                    onClick={() => router.push(`/operations/bundles/${bundle.id}`)}
                    className="cursor-pointer border-b last:border-0 hover:bg-scm-surface-container-low"
                  >
                    <td className="px-4 py-3 font-medium text-scm-link">
                      <Link href={`/operations/bundles/${bundle.id}`}>
                        {bundle.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {bundle.sku} — {bundle.productName}
                    </td>
                    <td className="px-4 py-3">
                      {formatDateRange(bundle.useFromDate, bundle.useByDate, locale)}
                      <DDayBadge useByDate={bundle.useByDate} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatPct(calcBundleInboundAchievement(bundle))}
                    </td>
                    <td className="px-4 py-3">
                      <BundleStatusBadge status={bundle.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
