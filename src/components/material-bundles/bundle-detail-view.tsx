"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BundleStatusBadge } from "@/components/material-bundles/bundle-status-badge";
import {
  CollapsibleSection,
  DetailField,
  DetailGrid,
  EmptyTabState,
  TabBar,
} from "@/components/material-bundles/bundle-sections";
import { DirectiveModal } from "@/components/material-bundles/directive-modal";
import {
  buildYieldDonutSegments,
  DONUT_COLORS,
  DonutChartCard,
} from "@/components/material-bundles/yield-donut";
import { DashboardCard, StatCard } from "@/components/ui/dashboard-card";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { FormField, inputClassName } from "@/components/layout/page-parts";
import { SectionRailNav } from "@/components/ui/section-rail-nav";
import { useLocale } from "@/components/providers/locale-provider";
import { formatCountUnits } from "@/lib/i18n/format-locale";
import type { Locale, TranslationParams } from "@/lib/i18n/translations";
import { useMockStore } from "@/components/providers/mock-store-provider";
import { useRole } from "@/components/providers/role-provider";
import { canSeeStaffInputUi } from "@/lib/role-access";
import {
  canCloseBundle,
  canEditBundle,
  canIssueDirective,
} from "@/lib/a-admin-permissions";
import { formatBundleProductLabel } from "@/lib/catalog/bundle-product";
import {
  calcBundleInboundAchievement,
  calcBundleOverallAchievement,
} from "@/lib/mock/yield-metrics";
import {
  calcBcDiscrepancy,
  calcBundleE2eYield,
  calcBundleGrantQty,
  calcBundleYield,
  isBundleYieldFinalized,
  calcMaterialYield,
  formatDateRange,
  type MaterialBundle,
  type PeriodDirective,
} from "@/lib/mock/material-bundles";

type DetailVariant = "a" | "b";

const OUTLINE_ITEMS = [
  { id: "summary", labelKey: "bundle.section.summary" },
  { id: "basic", labelKey: "bundle.section.basic" },
  { id: "shipment", labelKey: "bundle.section.shipment" },
  { id: "timeline", labelKey: "bundle.section.timeline" },
  { id: "tabs", labelKey: "bundle.section.detail" },
] as const;

export function BundleDetailView({
  bundleId,
  variant,
  backHref,
}: {
  bundleId: string;
  variant: DetailVariant;
  backHref: string;
}) {
  const { t, locale } = useLocale();
  const { role } = useRole();
  const staffInput = canSeeStaffInputUi(role);
  const {
    getMaterialBundle,
    getDirectivesForBundle,
    getDailyLogsForBundle,
    getShipmentsForBundle,
    updateMaterialBundle,
    addDirective,
    markBundleShipped,
    markBundleDepleted,
    closeMaterialBundle,
  } = useMockStore();

  const bundle = getMaterialBundle(bundleId);
  const [activeTab, setActiveTab] = useState("reconciliation");
  const [directiveOpen, setDirectiveOpen] = useState(false);
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const [editingBasic, setEditingBasic] = useState(false);
  const [editingShipment, setEditingShipment] = useState(false);
  const [basicDraft, setBasicDraft] = useState<Partial<MaterialBundle>>({});
  const [shipmentDraft, setShipmentDraft] = useState<Partial<MaterialBundle>>({});

  const directives = useMemo(
    () => (bundle ? getDirectivesForBundle(bundle.id) : []),
    [bundle, getDirectivesForBundle],
  );
  const dailyLogs = useMemo(
    () => (bundle ? getDailyLogsForBundle(bundle.id) : []),
    [bundle, getDailyLogsForBundle],
  );
  const shipments = useMemo(
    () => (bundle ? getShipmentsForBundle(bundle.id) : []),
    [bundle, getShipmentsForBundle],
  );

  if (!bundle) {
    return (
      <div className="rounded-lg border border-scm-outline-variant bg-scm-surface-lowest p-10 text-center">
        <p className="text-scm-on-surface-variant">{t("bundle.notFound")}</p>
        <Link href={backHref} className="mt-4 inline-block text-sm text-scm-link hover:underline">
          {t("bundle.backToList")}
        </Link>
      </div>
    );
  }

  const isA = variant === "a";
  const canEdit = isA && canEditBundle(role, bundle);
  const canManageLifecycle = isA && canCloseBundle(role);
  const isClosed = bundle.status === "closed";
  const finalized = isBundleYieldFinalized(bundle);
  const inbound = calcBundleInboundAchievement(bundle);
  const producedAch = calcBundleOverallAchievement(bundle);
  const e2eFinal = calcBundleE2eYield(bundle);
  const yieldFinal = calcBundleYield(bundle);
  const grant = calcBundleGrantQty(bundle);
  const materialYield = calcMaterialYield(bundle);
  const bcDiff = calcBcDiscrepancy(bundle);

  const nextDirective = directives
    .filter((d) => d.status === "issued" || d.status === "in_progress")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  const timelineEvents = buildTimeline(bundle, directives, t, locale);
  const visibleTimeline = timelineExpanded
    ? timelineEvents
    : timelineEvents.slice(-5);

  const outlineItems = OUTLINE_ITEMS.map((item) => ({
    id: item.id,
    label: t(item.labelKey),
  }));

  function startEditBasic() {
    setBasicDraft({
      targetQty: bundle!.targetQty,
      useFromDate: bundle!.useFromDate,
      useByDate: bundle!.useByDate,
      poWoRef: bundle!.poWoRef,
      internalNote: bundle!.internalNote,
    });
    setEditingBasic(true);
  }

  function startEditShipment() {
    setShipmentDraft({
      materialShipQty: bundle!.materialShipQty,
      shippedAt: bundle!.shippedAt,
    });
    setEditingShipment(true);
  }

  function saveBasic() {
    updateMaterialBundle(bundle!.id, basicDraft);
    setEditingBasic(false);
  }

  function saveShipment() {
    updateMaterialBundle(bundle!.id, shipmentDraft);
    setEditingShipment(false);
  }

  return (
    <>
      <div className="min-w-0 space-y-0 pb-32 pr-10">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link
                href={backHref}
                className="mb-2 inline-flex items-center gap-1 text-sm text-scm-on-surface-variant hover:text-scm-primary"
              >
                <MaterialIcon name="arrow_back" className="text-[18px]" />
                {t("bundle.backToList")}
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-scm-primary">
                  {bundle.number}
                </h1>
                <span className="text-scm-on-surface-variant">·</span>
                <span className="text-lg text-scm-on-surface">{bundle.productName}</span>
                <BundleStatusBadge status={bundle.status} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {canManageLifecycle && !isClosed ? (
                <>
                  {canIssueDirective(role) ? (
                    <Button variant="outline" onClick={() => setDirectiveOpen(true)}>
                      {t("bundle.action.issueDirective")}
                    </Button>
                  ) : null}
                  {bundle.status === "planned" ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (window.confirm(t("bundle.confirm.ship"))) {
                          markBundleShipped(bundle.id);
                        }
                      }}
                    >
                      {t("bundle.action.markShipped")}
                    </Button>
                  ) : null}
                  {bundle.status === "active" ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (window.confirm(t("bundle.confirm.deplete"))) {
                            markBundleDepleted(bundle.id);
                          }
                        }}
                      >
                        {t("bundle.action.deplete")}
                      </Button>
                      <Button
                        onClick={() => {
                          if (window.confirm(t("bundle.confirm.close"))) {
                            closeMaterialBundle(bundle.id);
                          }
                        }}
                      >
                        {t("bundle.action.close")}
                      </Button>
                    </>
                  ) : null}
                  {bundle.status === "depleted" ? (
                    <Button
                      onClick={() => {
                        if (window.confirm(t("bundle.confirm.close"))) {
                          closeMaterialBundle(bundle.id);
                        }
                      }}
                    >
                      {t("bundle.action.close")}
                    </Button>
                  ) : null}
                </>
              ) : null}
              {!isA && bundle.status !== "planned" ? (
                <>
                  {staffInput ? (
                    <Link href={`/operations/daily-log?bundleId=${bundle.id}`}>
                      <Button variant="outline">{t("bundle.bCta.log")}</Button>
                    </Link>
                  ) : (
                    <>
                      <Link href={`/operations/production-calendar`}>
                        <Button variant="outline">{t("nav.productionCalendar")}</Button>
                      </Link>
                      {role === "b_admin" ? (
                        <>
                          <Link href={`/operations/daily-log/history`}>
                            <Button variant="outline">{t("nav.dailyLogHistory")}</Button>
                          </Link>
                          <Link href={`/operations/shipments?bundleId=${bundle.id}`}>
                            <Button variant="outline">{t("bundle.bCta.ship")}</Button>
                          </Link>
                        </>
                      ) : null}
                    </>
                  )}
                </>
              ) : null}
            </div>
          </div>

          {/* Summary */}
          <CollapsibleSection
            id="summary"
            title={t("bundle.section.summary")}
            summary={
              finalized
                ? `${t("bundle.donut.yield")} ${yieldFinal?.toFixed(1) ?? "—"}% · ${bundle.productName}`
                : `${t("bundle.donut.inboundAchievement")} ${inbound?.toFixed(1) ?? "—"}% · ${bundle.productName}`
            }
            insetCard={false}
          >
            <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <DonutChartCard
                  title={
                    finalized
                      ? t("bundle.donut.e2eTitle")
                      : t("bundle.donut.inboundAchievementTitle")
                  }
                  subtitle={
                    finalized ? t("bundle.donut.e2e") : t("bundle.donut.inboundAchievement")
                  }
                  centerValue={
                    (finalized ? e2eFinal : inbound) != null
                      ? `${(finalized ? e2eFinal : inbound)!.toFixed(1)}%`
                      : "—"
                  }
                  centerLabel={t("bundle.donut.total")}
                  segments={buildYieldDonutSegments(
                    bundle.receivedAtCTotal,
                    bundle.targetQty,
                    t("bundle.donut.received"),
                    t("bundle.donut.remaining"),
                    DONUT_COLORS.e2e,
                  )}
                />
                <DonutChartCard
                  title={
                    finalized
                      ? t("bundle.donut.yieldTitle")
                      : t("bundle.donut.productionTitle")
                  }
                  subtitle={
                    finalized ? t("bundle.donut.yield") : t("bundle.donut.production")
                  }
                  centerValue={
                    (finalized ? yieldFinal : producedAch) != null
                      ? `${(finalized ? yieldFinal : producedAch)!.toFixed(1)}%`
                      : "—"
                  }
                  centerLabel={t("bundle.donut.total")}
                  segments={buildYieldDonutSegments(
                    finalized ? bundle.receivedAtCTotal : bundle.producedTotal,
                    finalized ? grant : bundle.targetQty,
                    finalized ? t("bundle.donut.received") : t("bundle.donut.producedLabel"),
                    t("bundle.donut.remaining"),
                    DONUT_COLORS.production,
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  label={t("bundle.kpi.target")}
                  value={bundle.targetQty.toLocaleString()}
                />
                <StatCard
                  label={t("bundle.kpi.produced")}
                  value={bundle.producedTotal.toLocaleString()}
                  accent="blue"
                />
                <StatCard
                  label={t("bundle.kpi.shippedToC")}
                  value={bundle.shippedToCTotal.toLocaleString()}
                  accent="teal"
                />
                <StatCard
                  label={t("bundle.kpi.receivedAtC")}
                  value={bundle.receivedAtCTotal.toLocaleString()}
                  accent="green"
                />
              </div>

              <div className="rounded-lg border border-scm-outline-variant/60 bg-scm-surface-container-low/50 px-4 py-3">
                <p className="text-sm text-scm-on-surface-variant">
                  <span className="font-semibold text-scm-primary">
                    {t("bundle.nextDirective")}:{" "}
                  </span>
                  {nextDirective
                    ? `${nextDirective.dueDate} ${t("bundle.until")} ${nextDirective.targetQty.toLocaleString()}${nextDirective.comment ? ` — ${nextDirective.comment}` : ""}`
                    : "—"}
                </p>
              </div>
            </div>
          </CollapsibleSection>

          {/* Basic info */}
          <CollapsibleSection
            id="basic"
            title={t("bundle.section.basic")}
            summary={`${bundle.productName} · ${t("bundle.kpi.target")} ${bundle.targetQty.toLocaleString()} · ${formatDateRange(bundle.useFromDate, bundle.useByDate, locale)}`}
            actions={
              canEdit && !editingBasic ? (
                <Button variant="outline" size="sm" onClick={startEditBasic}>
                  {t("common.edit")}
                </Button>
              ) : null
            }
          >
            {editingBasic ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label={t("bundle.form.target")}>
                    <input
                      type="number"
                      className={inputClassName}
                      value={basicDraft.targetQty ?? ""}
                      onChange={(e) =>
                        setBasicDraft((d) => ({ ...d, targetQty: Number(e.target.value) }))
                      }
                    />
                  </FormField>
                  <FormField label={t("bundle.form.useBy")}>
                    <input
                      type="date"
                      className={inputClassName}
                      value={basicDraft.useByDate ?? ""}
                      onChange={(e) =>
                        setBasicDraft((d) => ({ ...d, useByDate: e.target.value }))
                      }
                    />
                  </FormField>
                  <FormField label={t("bundle.form.useFrom")}>
                    <input
                      type="date"
                      className={inputClassName}
                      value={basicDraft.useFromDate ?? ""}
                      onChange={(e) =>
                        setBasicDraft((d) => ({ ...d, useFromDate: e.target.value }))
                      }
                    />
                  </FormField>
                  <FormField label={t("bundle.form.poWo")}>
                    <input
                      className={inputClassName}
                      value={basicDraft.poWoRef ?? ""}
                      onChange={(e) =>
                        setBasicDraft((d) => ({ ...d, poWoRef: e.target.value }))
                      }
                    />
                  </FormField>
                </div>
                <FormField label={t("bundle.form.note")}>
                  <textarea
                    className={`${inputClassName} min-h-[72px] py-2`}
                    value={basicDraft.internalNote ?? ""}
                    onChange={(e) =>
                      setBasicDraft((d) => ({ ...d, internalNote: e.target.value }))
                    }
                  />
                </FormField>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveBasic}>{t("common.save")}</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingBasic(false)}>
                    {t("common.cancel")}
                  </Button>
                </div>
              </div>
            ) : (
              <DetailGrid>
                <DetailField label={t("bundle.form.product")} value={formatBundleProductLabel(bundle)} />
                <DetailField label={t("bundle.form.vendor")} value={bundle.vendorName} />
                <DetailField label={t("bundle.form.theoretical")} value={bundle.theoreticalQty.toLocaleString()} />
                <DetailField label={t("bundle.form.target")} value={bundle.targetQty.toLocaleString()} />
                <DetailField
                  label={t("bundle.form.period")}
                  value={formatDateRange(bundle.useFromDate, bundle.useByDate, locale)}
                />
                <DetailField label={t("bundle.form.poWo")} value={bundle.poWoRef ?? "—"} />
                <DetailField label={t("bundle.form.note")} value={bundle.internalNote ?? "—"} />
              </DetailGrid>
            )}
          </CollapsibleSection>

          {/* Shipment */}
          <CollapsibleSection
            id="shipment"
            title={t("bundle.section.shipment")}
            summary={
              bundle.shippedAt
                ? `${bundle.materialShipQty?.toLocaleString() ?? "—"} · ${bundle.shippedAt}`
                : t("bundle.notShipped")
            }
            actions={
              canEdit && !editingShipment ? (
                <Button variant="outline" size="sm" onClick={startEditShipment}>
                  {t("common.edit")}
                </Button>
              ) : null
            }
          >
            {editingShipment ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label={t("bundle.form.materialShipQty")}>
                    <input
                      type="number"
                      className={inputClassName}
                      value={shipmentDraft.materialShipQty ?? ""}
                      onChange={(e) =>
                        setShipmentDraft((d) => ({
                          ...d,
                          materialShipQty: Number(e.target.value),
                        }))
                      }
                    />
                  </FormField>
                  <FormField label={t("bundle.form.shippedAt")}>
                    <input
                      type="date"
                      className={inputClassName}
                      value={shipmentDraft.shippedAt ?? ""}
                      onChange={(e) =>
                        setShipmentDraft((d) => ({ ...d, shippedAt: e.target.value }))
                      }
                    />
                  </FormField>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveShipment}>{t("common.save")}</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingShipment(false)}>
                    {t("common.cancel")}
                  </Button>
                </div>
              </div>
            ) : (
              <DetailGrid>
                <DetailField
                  label={t("bundle.form.materialShipQty")}
                  value={bundle.materialShipQty?.toLocaleString() ?? "—"}
                />
                <DetailField label={t("bundle.form.shippedAt")} value={bundle.shippedAt ?? "—"} />
              </DetailGrid>
            )}
          </CollapsibleSection>

          {/* Timeline */}
          <CollapsibleSection
            id="timeline"
            title={t("bundle.section.timeline")}
            summary={`${timelineEvents.length}${t("bundle.events")}`}
          >
            <ol className="space-y-3 border-l-2 border-scm-outline-variant pl-4">
              {visibleTimeline.map((ev) => (
                <li key={ev.key} className="relative">
                  <span className="absolute -left-[calc(1rem+5px)] top-1.5 size-2.5 rounded-full bg-scm-secondary" />
                  <p className="text-sm font-medium text-scm-primary">{ev.title}</p>
                  <p className="text-xs text-scm-on-surface-variant">{ev.subtitle}</p>
                </li>
              ))}
            </ol>
            {timelineEvents.length > 5 ? (
              <button
                type="button"
                onClick={() => setTimelineExpanded((v) => !v)}
                className="mt-3 text-sm font-medium text-scm-link hover:underline"
              >
                {timelineExpanded ? t("bundle.timeline.collapse") : t("bundle.timeline.expand")}
              </button>
            ) : null}
          </CollapsibleSection>

          {/* Tabs */}
          <section id="tabs" className="scroll-mt-[4.5rem] border-t border-scm-outline-variant pt-6">
            <h3 className="mb-4 text-base font-semibold text-scm-primary">
              {t("bundle.section.detail")}
            </h3>
            <DashboardCard bodyClassName="p-0">
              <div className="border-b border-scm-outline-variant/60 px-5 pt-1">
                <TabBar
                  tabs={[
                    { id: "reconciliation", label: t("bundle.tab.reconciliation") },
                    { id: "directives", label: t("bundle.tab.directives") },
                    { id: "daily", label: t("bundle.tab.daily") },
                    { id: "shipments", label: t("bundle.tab.shipments") },
                  ]}
                  active={activeTab}
                  onChange={setActiveTab}
                />
              </div>
              <div className="p-5">
              {activeTab === "reconciliation" ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                      label={t("bundle.recon.yield")}
                      value={
                        finalized
                          ? yieldFinal != null
                            ? `${yieldFinal.toFixed(1)}%`
                            : "—"
                          : "—"
                      }
                      accent="blue"
                    />
                    <StatCard
                      label={t("bundle.recon.bProduced")}
                      value={bundle.producedTotal.toLocaleString()}
                      accent="default"
                    />
                    <StatCard
                      label={t("bundle.recon.e2e")}
                      value={
                        finalized && e2eFinal != null ? `${e2eFinal.toFixed(1)}%` : "—"
                      }
                      accent="teal"
                    />
                    <StatCard label={t("bundle.recon.material")} value={materialYield != null ? `${materialYield.toFixed(1)}%` : "—"} accent="green" />
                    <StatCard label={t("bundle.recon.bcDiff")} value={bcDiff.toLocaleString()} accent="amber" />
                  </div>
                  <Link
                    href={`/operations/reconciliation?bundle=${bundle.id}`}
                    className="inline-flex text-sm font-medium text-scm-link hover:underline"
                  >
                    {t("bundle.recon.fullLink")}
                  </Link>
                </div>
              ) : null}
              {activeTab === "directives" ? (
                directives.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-scm-outline-variant">
                    <table className="w-full min-w-[480px] text-sm">
                      <thead>
                        <tr className="border-b bg-scm-surface-container-low text-left text-scm-on-surface-variant">
                          <th className="px-4 py-2.5 font-medium">{t("bundle.directive.period")}</th>
                          <th className="px-4 py-2.5 font-medium text-right">{t("bundle.directive.targetQty")}</th>
                          <th className="px-4 py-2.5 font-medium">{t("bundle.directive.comment")}</th>
                          <th className="px-4 py-2.5 font-medium">{t("wo.col.status")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {directives.map((d) => (
                          <tr key={d.id} className="border-b last:border-0">
                            <td className="px-4 py-2.5">
                              {(d.issuedAt ?? d.dueDate)} ~ {d.dueDate}
                            </td>
                            <td className="px-4 py-2.5 text-right tabular-nums">{d.targetQty.toLocaleString()}</td>
                            <td className="px-4 py-2.5">{d.comment ?? "—"}</td>
                            <td className="px-4 py-2.5">{d.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyTabState message={t("bundle.empty.tab")} />
                )
              ) : null}
              {activeTab === "daily" ? (
                dailyLogs.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-scm-outline-variant">
                    <table className="w-full min-w-[360px] text-sm">
                      <thead>
                        <tr className="border-b bg-scm-surface-container-low text-left text-scm-on-surface-variant">
                          <th className="px-4 py-2.5 font-medium">{t("bundle.daily.date")}</th>
                          <th className="px-4 py-2.5 font-medium text-right">{t("bundle.daily.produced")}</th>
                          <th className="px-4 py-2.5 font-medium text-right">{t("bundle.daily.defect")}</th>
                          <th className="px-4 py-2.5 font-medium text-right">{t("bundle.daily.qc")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailyLogs.slice(0, 14).map((log) => (
                          <tr key={log.id} className="border-b last:border-0">
                            <td className="px-4 py-2.5">{log.date}</td>
                            <td className="px-4 py-2.5 text-right tabular-nums">{log.producedQty.toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-right tabular-nums">{log.defectQty.toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-right tabular-nums">{(log.qcSampleQty ?? 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyTabState
                    message={t("bundle.empty.tab")}
                    linkHref={
                      staffInput
                        ? `/operations/daily-log?bundleId=${bundle.id}`
                        : `/operations/daily-log/history`
                    }
                    linkLabel={
                      staffInput ? t("bundle.empty.dailyLink") : t("nav.dailyLogHistory")
                    }
                  />
                )
              ) : null}
              {activeTab === "shipments" ? (
                shipments.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-scm-outline-variant">
                    <table className="w-full min-w-[480px] text-sm">
                      <thead>
                        <tr className="border-b bg-scm-surface-container-low text-left text-scm-on-surface-variant">
                          <th className="px-4 py-2.5 font-medium">{t("bundle.shipment.number")}</th>
                          <th className="px-4 py-2.5 font-medium text-right">{t("bundle.shipment.shipped")}</th>
                          <th className="px-4 py-2.5 font-medium text-right">{t("bundle.shipment.received")}</th>
                          <th className="px-4 py-2.5 font-medium">{t("bundle.form.shippedAt")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shipments.map((s) => (
                          <tr key={s.id} className="border-b last:border-0">
                            <td className="px-4 py-2.5">{s.number}</td>
                            <td className="px-4 py-2.5 text-right tabular-nums">{s.shippedQty.toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-right tabular-nums">{s.receivedQty?.toLocaleString() ?? "—"}</td>
                            <td className="px-4 py-2.5">{s.shippedAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyTabState
                    message={t("bundle.empty.tab")}
                    linkHref={`/operations/shipments?bundleId=${bundle.id}`}
                    linkLabel={t("bundle.empty.shipLink")}
                  />
                )
              ) : null}
              </div>
            </DashboardCard>
          </section>
      </div>

      <SectionRailNav
        sections={outlineItems}
        scrollOffsetPx={72}
        className="hidden lg:flex"
      />

      {isA && canIssueDirective(role) ? (
        <DirectiveModal
          bundle={bundle}
          open={directiveOpen}
          onClose={() => setDirectiveOpen(false)}
          onSave={(input) => addDirective({ bundleId: bundle.id, ...input })}
        />
      ) : null}
    </>
  );
}

function buildTimeline(
  bundle: MaterialBundle,
  directives: PeriodDirective[],
  t: (key: string, params?: TranslationParams) => string,
  locale: Locale,
) {
  const events: { key: string; title: string; subtitle: string; sort: string }[] = [
    {
      key: "created",
      title: t("timeline.created"),
      subtitle: `${bundle.createdAt.slice(0, 10)} · ${bundle.createdBy}`,
      sort: bundle.createdAt,
    },
  ];
  if (bundle.shippedAt) {
    events.push({
      key: "shipped",
      title: t("timeline.shipped"),
      subtitle: bundle.shippedAt,
      sort: bundle.shippedAt,
    });
  }
  events.push({
    key: "ack",
    title: bundle.acknowledgedAt ? t("timeline.ack") : t("timeline.ackPending"),
    subtitle: bundle.acknowledgedAt
      ? `${bundle.acknowledgedAt} · ${bundle.acknowledgedBy ?? ""}`
      : "—",
    sort: bundle.acknowledgedAt ?? "9999",
  });
  for (const d of directives) {
    events.push({
      key: d.id,
      title: `${t("timeline.directive")} · ${formatCountUnits(locale, d.targetQty, t)}`,
      subtitle: `${d.dueDate}${d.comment ? ` — ${d.comment}` : ""}`,
      sort: d.issuedAt ?? d.dueDate,
    });
  }
  if (bundle.depletedAt) {
    events.push({
      key: "depleted",
      title: t("timeline.depleted"),
      subtitle: bundle.depletedAt,
      sort: bundle.depletedAt,
    });
  }
  if (bundle.closedAt) {
    events.push({
      key: "closed",
      title: t("timeline.closed"),
      subtitle: bundle.closedAt,
      sort: bundle.closedAt,
    });
  }
  return events.sort((a, b) => a.sort.localeCompare(b.sort));
}
