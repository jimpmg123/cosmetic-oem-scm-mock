"use client";

import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";
import { TermLabel } from "@/components/ui/term-tooltip";
import { AdminBundleDashboard } from "@/components/dashboard/admin-bundle-dashboard";
import { useLocale } from "@/components/providers/locale-provider";
import { useMockStore } from "@/components/providers/mock-store-provider";
import { useRole } from "@/components/providers/role-provider";
import { isAdminOversight } from "@/lib/role-access";
import {
  calcEndToEndYield,
  calcInboundDiscrepancy,
  calcProductionYield,
  type WoStatus,
} from "@/lib/mock/data";
import { cn } from "@/lib/utils";

function StatusPill({ status }: { status: WoStatus }) {
  const { t } = useLocale();

  const styles: Record<string, string> = {
    receiving:
      "bg-[#FFF4E5] text-[#663C00] border-[#FFDDBB]",
    planned:
      "bg-[#E7E8E9] text-[#4C4546] border-scm-outline-variant",
    closed:
      "bg-[#E6F4EA] text-[#0D3C26] border-[#B7E1CD]",
    in_production:
      "bg-[#E7E8E9] text-[#4C4546] border-scm-outline-variant",
    produced:
      "bg-[#E7E8E9] text-[#4C4546] border-scm-outline-variant",
    shipped:
      "bg-[#FFF4E5] text-[#663C00] border-[#FFDDBB]",
  };

  const labelKey =
    status === "closed" ? "status.completed" : `status.${status}`;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[status] ?? styles.planned,
      )}
    >
      {t(labelKey) || status}
    </span>
  );
}

function KpiCard({
  label,
  value,
  sub,
  valueClassName,
}: {
  label: React.ReactNode;
  value: string;
  sub?: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-lg border border-scm-outline-variant bg-scm-surface-lowest p-4 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
      <p className="text-xs font-medium text-scm-on-surface-variant">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <p
          className={cn(
            "text-2xl font-semibold tabular-nums tracking-tight text-scm-primary",
            valueClassName,
          )}
        >
          {value}
        </p>
        {sub ? (
          <p className="text-sm font-medium text-scm-on-surface-variant">{sub}</p>
        ) : null}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { t, locale } = useLocale();
  const { role } = useRole();
  const { workOrders, inboundShipments } = useMockStore();
  const adminView = isAdminOversight(role);
  const primary = workOrders.find((w) => w.number === "WO-2026-001") ?? workOrders[0];
  const openReceiving = inboundShipments.filter(
    (s) => s.status === "receiving",
  ).length;

  const e2e = primary ? calcEndToEndYield(primary) : null;
  const prod = primary ? calcProductionYield(primary) : null;
  const disc = primary ? calcInboundDiscrepancy(primary) : null;
  const showAlert = disc != null && disc < 0;

  const title =
    locale === "ko"
      ? "대시보드 (Dashboard)"
      : locale === "zh"
        ? "仪表盘 (Dashboard)"
        : "Dashboard";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-scm-primary">
            {title}
          </h2>
          <p className="text-sm text-scm-on-surface-variant">
            {t("dashboard.desc")}
          </p>
        </div>
        <Link
          href="/operations/reconciliation"
          className="rounded-lg border border-scm-outline-variant px-4 py-1.5 text-sm font-medium text-scm-primary transition-colors hover:bg-scm-surface-container"
        >
          <TermLabel term="reconciliation" />
        </Link>
      </div>

      {/* Alert */}
      {showAlert && primary ? (
        <div className="flex items-center justify-between rounded-lg border border-[#FFDDBB] bg-[#FFF4E5] px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <MaterialIcon name="warning" filled className="text-[#663C00]" />
            <span className="text-sm font-medium text-[#663C00]">
              Action Required — {primary.number} inbound{" "}
              <TermLabel term="discrepancy" />{" "}
              <span className="font-bold">{disc} units</span>
            </span>
          </div>
          <Link
            href="/operations/reconciliation"
            className="text-sm font-semibold text-scm-link hover:underline"
          >
            View Reconciliation
          </Link>
        </div>
      ) : null}

      {adminView ? <AdminBundleDashboard /> : null}

      {role === "b_staff" ? (
        <p className="rounded-lg border border-scm-outline-variant bg-scm-surface-lowest px-4 py-3 text-sm text-scm-on-surface-variant">
          {t("dashboard.staffHint")}{" "}
          <Link href="/operations/daily-log" className="font-medium text-scm-link hover:underline">
            {t("nav.dailyLog")} →
          </Link>
        </p>
      ) : null}

      {/* KPI */}
      {role === "super_admin" && primary ? (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t("dashboard.target")} value={primary.targetQty.toLocaleString()} />
        <KpiCard
          label={t("dashboard.bClaimed")}
          value={primary.bClaimedQty?.toLocaleString() ?? "—"}
          sub={prod != null ? `${prod.toFixed(1)}%` : undefined}
        />
        <KpiCard
          label={t("dashboard.cReceived")}
          value={primary.cReceivedQty?.toLocaleString() ?? "—"}
          sub={e2e != null ? `${e2e.toFixed(1)}% end-to-end` : undefined}
        />
        <KpiCard
          label={t("dashboard.inboundDiff")}
          value={disc != null ? disc.toLocaleString() : "—"}
          sub={`${t("dashboard.pendingReceiving")} ${openReceiving}`}
          valueClassName={disc != null && disc < 0 ? "text-scm-error" : undefined}
        />
      </div>
      ) : null}

      {/* Table — overflow-x only so term tooltips aren't clipped */}
      {role === "super_admin" ? (
      <div className="rounded-lg border border-scm-outline-variant bg-scm-surface-lowest shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-scm-outline-variant bg-scm-surface-container-low">
                <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-scm-on-surface-variant">
                  <TermLabel term="wo" /> #
                </th>
                <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-scm-on-surface-variant">
                  <TermLabel term="sku" />
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-scm-on-surface-variant">
                  {t("dashboard.col.target")}
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-scm-on-surface-variant">
                  {t("dashboard.col.claimed")}
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-scm-on-surface-variant">
                  {t("dashboard.col.received")}
                </th>
                <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-scm-on-surface-variant">
                  {t("dashboard.col.status")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-scm-outline-variant">
              {workOrders.map((wo) => (
                <tr
                  key={wo.id}
                  className="group cursor-pointer transition-colors hover:bg-scm-surface-container-low"
                >
                  <td className="px-3 py-4 text-sm">
                    <Link
                      href="/operations/orders"
                      className="font-semibold text-scm-link underline decoration-transparent group-hover:decoration-scm-link"
                    >
                      {wo.number}
                    </Link>
                  </td>
                  <td className="px-3 py-4 text-sm">{wo.sku}</td>
                  <td className="px-3 py-4 text-right text-sm tabular-nums">
                    {wo.targetQty.toLocaleString()}
                  </td>
                  <td className="px-3 py-4 text-right text-sm tabular-nums">
                    {wo.bClaimedQty?.toLocaleString() ?? "—"}
                  </td>
                  <td className="px-3 py-4 text-right text-sm tabular-nums">
                    {wo.cReceivedQty?.toLocaleString() ?? "—"}
                  </td>
                  <td className="px-3 py-4 text-sm">
                    <StatusPill status={wo.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      ) : null}

      <footer className="border-t border-scm-outline-variant pt-8">
        <p className="text-[11px] text-scm-on-surface-variant">
          © 2026 Private Admin ERP System. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
