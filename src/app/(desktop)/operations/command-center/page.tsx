"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { useMockStore } from "@/components/providers/mock-store-provider";
import { YieldDonut } from "@/components/material-bundles/yield-donut";
import { YieldSummaryRow } from "@/components/material-bundles/yield-summary-row";
import { PRODUCT_LINES } from "@/lib/mock/material-shipment-lines";
import { formatPct } from "@/lib/mock/material-bundles";
import { calcBundleInboundAchievement } from "@/lib/mock/yield-metrics";

export default function CommandCenterPage() {
  const { t } = useLocale();
  const { materialBundles, directives, getDirectiveAnalytics } = useMockStore();

  const activeBundles = useMemo(
    () =>
      materialBundles.filter(
        (b) => b.status === "active" || b.status === "planned",
      ),
    [materialBundles],
  );

  const [sku, setSku] = useState("LOTION-250");
  const bundlesForSku = useMemo(
    () => activeBundles.filter((b) => b.sku === sku),
    [activeBundles, sku],
  );

  const [bundleId, setBundleId] = useState("");
  const effectiveBundleId =
    bundleId && bundlesForSku.some((b) => b.id === bundleId)
      ? bundleId
      : (bundlesForSku[0]?.id ?? "");

  const bundle = materialBundles.find((b) => b.id === effectiveBundleId);

  const directiveCases = useMemo(
    () =>
      directives
        .filter(
          (d) =>
            d.bundleId === effectiveBundleId &&
            d.status !== "draft" &&
            d.status !== "cancelled",
        )
        .sort((a, b) => b.dueDate.localeCompare(a.dueDate)),
    [directives, effectiveBundleId],
  );

  const [directiveId, setDirectiveId] = useState("");
  const effectiveDirectiveId =
    directiveId && directiveCases.some((d) => d.id === directiveId)
      ? directiveId
      : (directiveCases[0]?.id ?? "");

  const directive = directiveCases.find((d) => d.id === effectiveDirectiveId);
  const analytics = effectiveDirectiveId
    ? getDirectiveAnalytics(effectiveDirectiveId)
    : null;

  const inboundPct = bundle ? calcBundleInboundAchievement(bundle) : null;

  const lineMeta = PRODUCT_LINES.find((p) => p.sku === sku);
  const daysLeft = directive
    ? Math.max(
        0,
        Math.ceil(
          (new Date(directive.dueDate).getTime() - Date.now()) /
            (86400000),
        ),
      )
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-scm-primary">
          {t("commandCenter.title")}
        </h1>
        <p className="mt-1 text-sm text-scm-on-surface-variant">
          {t("commandCenter.desc")}
        </p>
      </div>

      <div className="grid gap-4 rounded-lg border border-scm-outline-variant bg-scm-surface-container-low p-4 md:grid-cols-3">
        <label className="text-sm">
          <span className="font-medium">{t("commandCenter.productLine")}</span>
          <select
            className="mt-1 w-full rounded-md border border-scm-outline-variant px-3 py-2"
            value={sku}
            onChange={(e) => {
              setSku(e.target.value);
              setBundleId("");
              setDirectiveId("");
            }}
          >
            {PRODUCT_LINES.map((p) => (
              <option key={p.sku} value={p.sku}>
                {p.sku} — {p.productName}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium">{t("commandCenter.bundle")}</span>
          <select
            className="mt-1 w-full rounded-md border border-scm-outline-variant px-3 py-2"
            value={effectiveBundleId}
            onChange={(e) => {
              setBundleId(e.target.value);
              setDirectiveId("");
            }}
            disabled={!bundlesForSku.length}
          >
            {bundlesForSku.length === 0 ? (
              <option value="">{t("commandCenter.noBundle")}</option>
            ) : (
              bundlesForSku.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.number} · {t(`bundle.status.${b.status}`)} · 목표{" "}
                  {b.targetQty.toLocaleString()}
                </option>
              ))
            )}
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium">{t("commandCenter.directive")}</span>
          <select
            className="mt-1 w-full rounded-md border border-scm-outline-variant px-3 py-2"
            value={effectiveDirectiveId}
            onChange={(e) => setDirectiveId(e.target.value)}
            disabled={!directiveCases.length}
          >
            {directiveCases.length === 0 ? (
              <option value="">{t("commandCenter.noDirective")}</option>
            ) : (
              directiveCases.map((d) => (
                <option key={d.id} value={d.id}>
                  {(d.issuedAt ?? d.dueDate).slice(0, 10)} ~ {d.dueDate} · y=
                  {d.targetQty.toLocaleString()}
                </option>
              ))
            )}
          </select>
        </label>
      </div>

      {bundle && lineMeta ? (
        <>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href={`/operations/material-bundles/${bundle.id}`}
              className="font-medium text-scm-link hover:underline"
            >
              {t("commandCenter.linkBundle")} →
            </Link>
            <Link
              href="/operations/material-shipment"
              className="font-medium text-scm-link hover:underline"
            >
              {t("nav.aRawShipment")} →
            </Link>
            <Link
              href="/operations/directive-analytics"
              className="font-medium text-scm-link hover:underline"
            >
              {t("nav.directiveAnalytics")} →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-scm-outline-variant bg-scm-surface p-4">
              <p className="text-xs text-scm-on-surface-variant">
                {t("commandCenter.theoretical")}
              </p>
              <p className="mt-1 text-2xl font-semibold text-scm-primary">
                {bundle.theoreticalQty.toLocaleString()}
              </p>
              <p className="text-xs text-scm-on-surface-variant">
                BOM 기준 (1회 grant)
              </p>
            </div>
            {directive && analytics ? (
              <>
                <div className="rounded-lg border border-scm-outline-variant bg-scm-surface p-4">
                  <p className="text-xs text-scm-on-surface-variant">
                    {t("commandCenter.untilDue")}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-scm-primary">
                    {daysLeft} {t("commandCenter.days")}
                  </p>
                  <p className="text-xs text-scm-on-surface-variant">
                    {directive.dueDate}
                    {directive.comment ? ` · ${directive.comment}` : ""}
                  </p>
                </div>
                <div className="flex justify-center rounded-lg border border-scm-outline-variant bg-scm-surface p-4">
                  <YieldDonut
                    pct={analytics.achievementPct}
                    numerator={analytics.receivedInWindow}
                    denominator={analytics.targetQty}
                    caption={t("commandCenter.achievement")}
                    size={100}
                  />
                </div>
                <div className="flex justify-center rounded-lg border border-scm-outline-variant bg-scm-surface p-4">
                  <YieldDonut
                    pct={inboundPct}
                    numerator={bundle.receivedAtCTotal}
                    denominator={bundle.targetQty}
                    caption={t("bundle.donut.inboundAchievement")}
                    size={100}
                  />
                </div>
              </>
            ) : (
              <p className="col-span-3 text-sm text-scm-on-surface-variant">
                {t("commandCenter.noDirective")}
              </p>
            )}
          </div>

          {analytics && directive ? (
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
                      ? (analytics.producedInWindow / analytics.targetQty) *
                        100
                      : null,
                  numerator: analytics.producedInWindow,
                  denominator: analytics.targetQty,
                  caption: t("analytics.produced"),
                },
                {
                  pct:
                    analytics.targetQty > 0
                      ? (analytics.shippedInWindow / analytics.targetQty) * 100
                      : null,
                  numerator: analytics.shippedInWindow,
                  denominator: analytics.targetQty,
                  caption: t("analytics.shipped"),
                },
                {
                  pct: analytics.qcRate,
                  numerator: analytics.qcInWindow,
                  denominator:
                    analytics.producedInWindow + analytics.qcInWindow,
                  caption: t("analytics.qcRate"),
                },
              ]}
            />
          ) : null}

          <div className="rounded-lg border border-scm-outline-variant bg-scm-surface-container-low p-4 text-sm text-scm-on-surface-variant">
            <p className="font-medium text-scm-primary">
              {t("commandCenter.workloadNote")}
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>{t("commandCenter.note1")}</li>
              <li>{t("commandCenter.note2")}</li>
              <li>{t("commandCenter.note3")}</li>
            </ul>
            {inboundPct != null ? (
              <p className="mt-3">
                {t("bundle.donut.inboundAchievement")} {formatPct(inboundPct)} ·{" "}
                {t("bundle.kpi.produced")} {bundle.producedTotal.toLocaleString()} /{" "}
                {t("bundle.kpi.receivedAtC")} {bundle.receivedAtCTotal.toLocaleString()}
              </p>
            ) : null}
          </div>
        </>
      ) : (
        <p className="text-sm text-scm-on-surface-variant">
          {t("commandCenter.noBundle")}
        </p>
      )}
    </div>
  );
}
