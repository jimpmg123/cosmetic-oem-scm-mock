"use client";

import Link from "next/link";
import { useState } from "react";
import {
  buildYieldDonutSegments,
  DONUT_COLORS,
  DonutChartCard,
} from "@/components/material-bundles/yield-donut";
import { DashboardCard, StatCard } from "@/components/ui/dashboard-card";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useLocale } from "@/components/providers/locale-provider";
import { formatBundleProductLabel } from "@/lib/catalog/bundle-product";
import { getBundleSummaryDonutMetrics } from "@/lib/mock/bundle-metric-display";
import { formatPct, type MaterialBundle } from "@/lib/mock/material-bundles";
import {
  calcBundleInboundAchievement,
  calcBundleOverallAchievement,
  isBundleYieldFinalized,
} from "@/lib/mock/yield-metrics";
import {
  formatYieldDelta,
  type PeriodAchievementCompare,
} from "@/lib/mock/yield-overview";
import { cn } from "@/lib/utils";

export function FeaturedProductYieldCard({
  bundle,
  period,
}: {
  bundle: MaterialBundle;
  period: PeriodAchievementCompare;
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(true);
  const finalized = isBundleYieldFinalized(bundle);
  const inbound = calcBundleInboundAchievement(bundle);
  const producedAch = calcBundleOverallAchievement(bundle);
  const delta = formatYieldDelta(period.previousPct, period.currentPct);
  const donutMetrics = getBundleSummaryDonutMetrics(bundle);
  const primaryDonut = donutMetrics[0];

  return (
    <DashboardCard bodyClassName="p-0">
      <div className="border-b border-scm-outline-variant/60 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex min-w-0 flex-1 items-start gap-2 text-left"
          >
            <MaterialIcon
              name={open ? "expand_more" : "chevron_right"}
              className="mt-0.5 shrink-0 text-[22px] text-scm-on-surface-variant"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-scm-secondary">
                {t("yieldOverview.featured.badge")}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-scm-primary">
                {bundle.productName}
              </h2>
              <p className="mt-0.5 text-sm text-scm-on-surface-variant">
                {formatBundleProductLabel(bundle)} · {bundle.number} · {bundle.vendorName}
              </p>
            </div>
          </button>
          <Link
            href={`/operations/material-bundles/${bundle.id}`}
            className="shrink-0 text-sm font-medium text-scm-link hover:underline"
          >
            {t("yieldOverview.featured.detail")} →
          </Link>
        </div>
      </div>

      {open ? (
        <div className="space-y-5 p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="rounded-xl border border-scm-outline-variant/70 bg-[#F8F9FA] p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-scm-on-surface-variant">
                {t("yieldOverview.featured.periodCompare")}
              </p>
              <div className="mt-4 flex flex-wrap items-end gap-6">
                <PeriodBlock
                  label={period.previousLabel}
                  value={formatPct(period.previousPct)}
                  sub={t("yieldOverview.featured.e2e")}
                />
                <MaterialIcon
                  name="arrow_forward"
                  className="hidden text-[20px] text-scm-on-surface-variant sm:block"
                />
                <PeriodBlock
                  label={period.currentLabel}
                  value={formatPct(period.currentPct ?? inbound)}
                  sub={t("yieldOverview.featured.e2e")}
                  highlight
                />
                <div className="min-w-[5rem]">
                  <p className="text-xs text-scm-on-surface-variant">
                    {t("yieldOverview.featured.change")}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-xl font-bold tabular-nums",
                      delta.tone === "up" && "text-emerald-600",
                      delta.tone === "down" && "text-red-600",
                      delta.tone === "flat" && "text-scm-on-surface-variant",
                      delta.tone === "none" && "text-scm-on-surface-variant",
                    )}
                  >
                    {delta.text}
                  </p>
                </div>
              </div>
            </div>

            <DonutChartCard
              title={t(primaryDonut.captionKey)}
              subtitle={
                finalized
                  ? t("bundle.donut.e2e")
                  : t("bundle.donut.inboundAchievement")
              }
              centerValue={
                primaryDonut.pct != null ? `${primaryDonut.pct.toFixed(1)}%` : "—"
              }
              centerLabel={t("bundle.donut.total")}
              segments={buildYieldDonutSegments(
                primaryDonut.numerator,
                primaryDonut.denominator,
                finalized ? t("bundle.donut.received") : t("bundle.donut.received"),
                t("bundle.donut.remaining"),
                DONUT_COLORS.e2e,
              )}
              className="shadow-none lg:max-w-md"
            />
          </div>

          {!finalized ? (
            <p className="text-xs text-scm-on-surface-variant">
              {t("yieldOverview.featured.yieldPending")}
            </p>
          ) : null}

          <div>
            <p className="mb-3 text-sm font-semibold text-scm-primary">
              {t("yieldOverview.featured.bcFlow")}
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard
                label={t("yieldOverview.featured.bProduced")}
                value={bundle.producedTotal.toLocaleString()}
                hint={t("yieldOverview.featured.bProducedHint")}
                accent="blue"
              />
              <StatCard
                label={t("yieldOverview.featured.bShipped")}
                value={bundle.shippedToCTotal.toLocaleString()}
                hint={t("yieldOverview.featured.bShippedHint")}
                accent="teal"
              />
              <StatCard
                label={t("yieldOverview.featured.cReceived")}
                value={bundle.receivedAtCTotal.toLocaleString()}
                hint={`${t("yieldOverview.featured.productionAchievement")}: ${formatPct(producedAch)} · ${t("bundle.donut.inboundAchievement")}: ${formatPct(inbound)}`}
                accent="green"
              />
            </div>
          </div>
        </div>
      ) : null}
    </DashboardCard>
  );
}

function PeriodBlock({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-scm-on-surface-variant">{label}</p>
      <p
        className={cn(
          "mt-1 text-3xl font-bold tabular-nums tracking-tight",
          highlight ? "text-scm-secondary" : "text-scm-primary",
        )}
      >
        {value}
      </p>
      <p className="text-xs text-scm-on-surface-variant">{sub}</p>
    </div>
  );
}
