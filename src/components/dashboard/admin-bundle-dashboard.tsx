"use client";

import Link from "next/link";
import { YieldSummaryRow } from "@/components/material-bundles/yield-summary-row";
import { useLocale } from "@/components/providers/locale-provider";
import { useMockStore } from "@/components/providers/mock-store-provider";
import { useRole } from "@/components/providers/role-provider";
import { sortBundlesForList } from "@/lib/mock/material-bundles";
import { getBundleSummaryDonutMetrics } from "@/lib/mock/bundle-metric-display";

export function AdminBundleDashboard() {
  const { t } = useLocale();
  const { role } = useRole();
  const { materialBundles, getDirectivesForBundle } = useMockStore();

  const active = sortBundlesForList(
    materialBundles.filter((b) => b.status === "active"),
  );
  const primary = active[0];
  if (!primary) {
    return <p className="text-scm-on-surface-variant">{t("common.empty")}</p>;
  }

  const donutMetrics = getBundleSummaryDonutMetrics(primary);
  const nextDirective = getDirectivesForBundle(primary.id)
    .filter((d) => d.status === "issued" || d.status === "in_progress")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  const listHref =
    role === "b_admin" ? "/operations/bundles" : "/operations/material-bundles";
  const detailHref = `${listHref}/${primary.id}`;

  return (
    <div className="space-y-6">
      <YieldSummaryRow
        items={donutMetrics.map((m) => ({
          pct: m.pct,
          numerator: m.numerator,
          denominator: m.denominator,
          caption: t(m.captionKey),
        }))}
      />

      <div className="rounded-lg border border-scm-outline-variant bg-scm-surface-lowest p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-scm-on-surface-variant">{t("dashboard.primaryBundle")}</p>
            <Link href={detailHref} className="text-lg font-semibold text-scm-link hover:underline">
              {primary.number}
            </Link>
            <p className="text-sm text-scm-on-surface-variant">
              {primary.sku} — {primary.productName}
            </p>
          </div>
          <Link
            href={listHref}
            className="text-sm font-medium text-scm-link hover:underline"
          >
            {t("dashboard.allBundles")} →
          </Link>
        </div>
        {nextDirective ? (
          <p className="mt-3 text-sm">
            <span className="font-medium text-scm-primary">{t("bundle.nextDirective")}: </span>
            {nextDirective.dueDate} · {nextDirective.targetQty.toLocaleString()}
            {nextDirective.comment ? ` — ${nextDirective.comment}` : ""}
          </p>
        ) : null}
      </div>
    </div>
  );
}
