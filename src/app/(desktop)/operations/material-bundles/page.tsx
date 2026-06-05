"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BundleStatusBadge } from "@/components/material-bundles/bundle-status-badge";
import { DDayBadge } from "@/components/material-bundles/d-day-badge";
import { DirectiveModal } from "@/components/material-bundles/directive-modal";
import { DashboardCard, StatCard } from "@/components/ui/dashboard-card";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useLocale } from "@/components/providers/locale-provider";
import { useMockStore } from "@/components/providers/mock-store-provider";
import { useRole } from "@/components/providers/role-provider";
import { canCreateVolume } from "@/lib/a-admin-permissions";
import { formatBundleProductLabel } from "@/lib/catalog/bundle-product";
import {
  calcBundleE2eYield,
  formatDateRange,
  formatPct,
  getDday,
  isBundleAtRisk,
  isBundleOverdue,
  sortBundlesForList,
  type BundleStatus,
  type MaterialBundle,
} from "@/lib/mock/material-bundles";
import {
  calcBundleInboundAchievement,
  calcBundleOverallAchievement,
} from "@/lib/mock/yield-metrics";
import { cn } from "@/lib/utils";

const ALL_STATUSES: BundleStatus[] = ["planned", "active", "depleted", "closed"];

export default function MaterialBundlesPage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const { role } = useRole();
  const showNewVolume = canCreateVolume(role);
  const { materialBundles, addDirective } = useMockStore();

  const [statusFilter, setStatusFilter] = useState<Set<BundleStatus>>(
    new Set(ALL_STATUSES),
  );
  const [search, setSearch] = useState("");
  const [directiveBundle, setDirectiveBundle] = useState<MaterialBundle | null>(
    null,
  );

  const filtered = useMemo(() => {
    let list = sortBundlesForList(materialBundles);
    if (statusFilter.size < ALL_STATUSES.length) {
      list = list.filter((b) => statusFilter.has(b.status));
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (b) =>
          b.number.toLowerCase().includes(q) ||
          b.sku.toLowerCase().includes(q) ||
          b.productName.toLowerCase().includes(q) ||
          (b.poWoRef?.toLowerCase().includes(q) ?? false),
      );
    }
    return list;
  }, [materialBundles, statusFilter, search]);

  const kpis = useMemo(() => {
    const active = materialBundles.filter((b) => b.status === "active");
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const shippedThisMonth = materialBundles.filter(
      (b) => b.shippedAt?.startsWith(month),
    ).length;
    const pendingInbound = materialBundles.filter(
      (b) => b.shippedToCTotal - b.receivedAtCTotal > 0,
    ).length;
    const activeBundles = materialBundles.filter((b) => b.status === "active");
    const achievements = activeBundles
      .map(calcBundleInboundAchievement)
      .filter((v): v is number => v != null);
    const avgInbound =
      achievements.length > 0
        ? achievements.reduce((a, b) => a + b, 0) / achievements.length
        : null;
    const activeCount = active.length;
    const atRisk = active.filter((b) => {
      const d = getDday(b.useByDate);
      return d <= 7 && d >= 0;
    }).length;
    return { activeCount, shippedThisMonth, pendingInbound, avgInbound, atRisk };
  }, [materialBundles]);

  function toggleStatus(status: BundleStatus) {
    setStatusFilter((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-scm-primary">
            {t("bundle.list.title")}
          </h1>
          <p className="mt-1 text-sm text-scm-on-surface-variant">
            {t("bundle.list.desc")}
          </p>
        </div>
        {showNewVolume ? (
          <Link href="/operations/material-bundles/new">
            <Button>
              <MaterialIcon name="add" className="text-[18px]" />
              {t("bundle.list.new")}
            </Button>
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("bundle.kpi.activeCount")} value={String(kpis.activeCount)} accent="green" />
        <StatCard label={t("bundle.kpi.shippedMonth")} value={String(kpis.shippedThisMonth)} accent="blue" />
        <StatCard label={t("bundle.kpi.pendingInbound")} value={String(kpis.pendingInbound)} accent="amber" />
        <StatCard
          label={t("bundle.kpi.avgInboundAchievement")}
          value={formatPct(kpis.avgInbound)}
          accent="teal"
        />
      </div>

      <DashboardCard title={t("bundle.card.filters")}>
        <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => toggleStatus(status)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                statusFilter.has(status)
                  ? "border-scm-secondary bg-blue-50 text-scm-secondary"
                  : "border-scm-outline-variant text-scm-on-surface-variant",
              )}
            >
              {t(`bundle.status.${status}`)}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder={t("bundle.filter.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full max-w-md rounded-md border border-scm-outline-variant bg-scm-surface-lowest px-3 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-scm-success-bg px-3 py-1 text-xs font-medium text-scm-success-text">
            {t("bundle.chip.active")} {kpis.activeCount}
          </span>
          <span className="inline-flex items-center rounded-full bg-scm-warning-bg px-3 py-1 text-xs font-medium text-scm-warning-text">
            {t("bundle.chip.atRisk")} {kpis.atRisk}
          </span>
        </div>
        </div>
      </DashboardCard>

      {filtered.length === 0 ? (
        <DashboardCard title={t("bundle.card.list")}>
          <div className="py-8 text-center">
            <p className="text-scm-on-surface-variant">{t("bundle.list.empty")}</p>
            {showNewVolume ? (
              <Link href="/operations/material-bundles/new" className="mt-4 inline-block">
                <Button>{t("bundle.list.new")}</Button>
              </Link>
            ) : null}
          </div>
        </DashboardCard>
      ) : (
        <DashboardCard
          title={t("bundle.card.list")}
          subtitle={`${filtered.length} ${t("bundle.card.listCount")}`}
        >
        <div className="overflow-x-auto -mx-1">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-scm-outline-variant/60 bg-[#F8F9FA] text-left text-[11px] font-semibold uppercase tracking-wide text-scm-on-surface-variant">
                <th className="px-3 py-3 font-semibold">{t("bundle.col.number")}</th>
                <th className="px-3 py-3 font-semibold">{t("bundle.col.product")}</th>
                <th className="px-3 py-3 font-semibold text-right">{t("bundle.col.theoretical")}</th>
                <th className="px-3 py-3 font-semibold text-right">{t("bundle.col.target")}</th>
                <th className="px-3 py-3 font-semibold">{t("bundle.col.period")}</th>
                <th className="px-3 py-3 font-semibold text-right">{t("bundle.col.produced")}</th>
                <th className="px-3 py-3 font-semibold text-right">{t("bundle.col.received")}</th>
                <th className="px-3 py-3 font-semibold text-right">
                  {t("bundle.col.inboundAchievement")}
                </th>
                <th className="px-3 py-3 font-semibold text-right">
                  {t("bundle.col.yieldE2eFinal")}
                </th>
                <th className="px-3 py-3 font-semibold">{t("wo.col.status")}</th>
                <th className="px-3 py-3 font-semibold">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((bundle) => {
                const inbound = calcBundleInboundAchievement(bundle);
                const e2eFinal = calcBundleE2eYield(bundle);
                const producedAch = calcBundleOverallAchievement(bundle);
                const overdue = isBundleOverdue(bundle);
                const atRisk = isBundleAtRisk(bundle);
                return (
                  <tr
                    key={bundle.id}
                    onClick={() =>
                      router.push(`/operations/material-bundles/${bundle.id}`)
                    }
                    className={cn(
                      "cursor-pointer border-b border-scm-outline-variant last:border-0 transition-colors hover:bg-scm-surface-container-low",
                      overdue && "bg-scm-warning-bg/40",
                      atRisk && !overdue && "bg-orange-50/60",
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-scm-link">
                      {bundle.number}
                      {overdue ? (
                        <MaterialIcon
                          name="warning"
                          className="ml-1 inline text-[16px] text-scm-warning-text"
                        />
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {formatBundleProductLabel(bundle)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {bundle.theoreticalQty.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {bundle.targetQty.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDateRange(bundle.useFromDate, bundle.useByDate, locale)}
                      <DDayBadge useByDate={bundle.useByDate} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {bundle.producedTotal.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {bundle.receivedAtCTotal.toLocaleString()}
                    </td>
                    <td
                      className="px-4 py-3 text-right tabular-nums"
                      title={`${t("bundle.donut.production")}: ${formatPct(producedAch)}`}
                    >
                      {formatPct(inbound)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-scm-on-surface-variant">
                      {formatPct(e2eFinal)}
                    </td>
                    <td className="px-4 py-3">
                      <BundleStatusBadge status={bundle.status} />
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDirectiveBundle(bundle)}
                        >
                          {t("bundle.action.issueDirective")}
                        </Button>
                        <Link href={`/operations/material-bundles/${bundle.id}`}>
                          <Button variant="outline" size="sm">
                            {t("bundle.action.detail")}
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </DashboardCard>
      )}

      <DirectiveModal
        bundle={directiveBundle}
        open={directiveBundle != null}
        onClose={() => setDirectiveBundle(null)}
        onSave={(input) => {
          if (directiveBundle) {
            addDirective({ bundleId: directiveBundle.id, ...input });
          }
        }}
      />
    </div>
  );
}
