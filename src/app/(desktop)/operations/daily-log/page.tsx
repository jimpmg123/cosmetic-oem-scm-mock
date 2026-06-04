"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/locale-provider";
import { useMockStore } from "@/components/providers/mock-store-provider";
import {
  buildDirectiveAnalytics,
  calcQcRate,
} from "@/lib/mock/analytics";
import { formatPct } from "@/lib/mock/material-bundles";

function DailyLogForm() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const {
    materialBundles,
    dailyLogs,
    bundleShipments,
    saveDailyLog,
    isBundleAtRiskReceipt,
    getDirectivesForBundle,
  } = useMockStore();

  const activeBundles = materialBundles.filter(
    (b) => b.status === "active" || b.status === "depleted",
  );

  const initialBundle =
    searchParams.get("bundleId") ??
    activeBundles[0]?.id ??
    "";
  const initialDate =
    searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

  const [bundleId, setBundleId] = useState(initialBundle);
  const [date, setDate] = useState(initialDate);
  const [saved, setSaved] = useState(false);

  const existing = dailyLogs.find(
    (l) => l.bundleId === bundleId && l.date === date,
  );
  const [produced, setProduced] = useState(
    String(existing?.producedQty ?? ""),
  );
  const [defect, setDefect] = useState(String(existing?.defectQty ?? "0"));
  const [qc, setQc] = useState(String(existing?.qcSampleQty ?? "0"));
  const [note, setNote] = useState(existing?.note ?? "");

  const bundle = materialBundles.find((b) => b.id === bundleId);
  const atRisk = bundleId ? isBundleAtRiskReceipt(bundleId) : false;

  const nextDirective = useMemo(() => {
    const list = getDirectivesForBundle(bundleId).filter(
      (d) => d.status === "issued" || d.status === "in_progress",
    );
    return list[0];
  }, [bundleId, getDirectivesForBundle]);

  const directiveProgress = useMemo(() => {
    if (!nextDirective) return null;
    return buildDirectiveAnalytics(nextDirective, dailyLogs, bundleShipments);
  }, [nextDirective, dailyLogs, bundleShipments]);

  const qcRate = calcQcRate(Number(produced) || 0, Number(qc) || 0);
  const shippable = Math.max(0, (Number(produced) || 0) - (Number(defect) || 0));

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bundleId) return;
    saveDailyLog({
      bundleId,
      date,
      producedQty: Number(produced) || 0,
      defectQty: Number(defect) || 0,
      qcSampleQty: Number(qc) || 0,
      note,
    });
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-scm-primary">
          {t("dailyLog.title")}
        </h1>
        <p className="mt-1 text-sm text-scm-on-surface-variant">
          {t("dailyLog.desc")}
        </p>
      </div>

      {atRisk ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {t("bundle.atRiskReceipt")}
        </div>
      ) : null}

      {bundle && nextDirective ? (
        <div className="rounded-lg border border-scm-outline-variant bg-scm-surface-container-low p-4 text-sm">
          <div className="font-medium text-scm-primary">
            {nextDirective.dueDate} {t("bundle.until")} {nextDirective.targetQty.toLocaleString()}
          </div>
          {nextDirective.comment ? (
            <p className="mt-1 text-scm-on-surface-variant">{nextDirective.comment}</p>
          ) : null}
          {directiveProgress ? (
            <p className="mt-2 tabular-nums">
              {t("dailyLog.directiveProgress")}:{" "}
              {directiveProgress.receivedInWindow.toLocaleString()} /{" "}
              {directiveProgress.targetQty.toLocaleString()} (
              {formatPct(directiveProgress.achievementPct)})
            </p>
          ) : null}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-scm-outline-variant bg-scm-surface-lowest p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium">{t("dailyLog.selectBundle")}</span>
            <select
              className="mt-1 w-full rounded-md border border-scm-outline-variant px-3 py-2"
              value={bundleId}
              onChange={(e) => {
                setBundleId(e.target.value);
                setSaved(false);
              }}
            >
              {activeBundles.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.number} — {b.sku}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">{t("dailyLog.date")}</span>
            <input
              type="date"
              className="mt-1 w-full rounded-md border border-scm-outline-variant px-3 py-2"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setSaved(false);
              }}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium">{t("dailyLog.produced")}</span>
            <input
              type="number"
              min={0}
              required
              className="mt-1 w-full rounded-md border border-scm-outline-variant px-3 py-3 text-xl tabular-nums"
              value={produced}
              onChange={(e) => {
                setProduced(e.target.value);
                setSaved(false);
              }}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">{t("dailyLog.defect")}</span>
            <input
              type="number"
              min={0}
              required
              className="mt-1 w-full rounded-md border border-scm-outline-variant px-3 py-3 text-xl tabular-nums"
              value={defect}
              onChange={(e) => {
                setDefect(e.target.value);
                setSaved(false);
              }}
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="font-medium">{t("dailyLog.qc")}</span>
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-md border border-scm-outline-variant px-3 py-2 tabular-nums"
            value={qc}
            onChange={(e) => {
              setQc(e.target.value);
              setSaved(false);
            }}
          />
        </label>

        <div className="flex gap-4 text-sm text-scm-on-surface-variant">
          <span>
            {t("dailyLog.shippable")}: <strong className="text-scm-primary">{shippable}</strong>
          </span>
          {qcRate != null ? (
            <span>
              {t("dailyLog.qcRate")}: <strong className="text-scm-primary">{formatPct(qcRate)}</strong>
            </span>
          ) : null}
        </div>

        <label className="block text-sm">
          <span className="font-medium">{t("dailyLog.note")}</span>
          <textarea
            className="mt-1 w-full rounded-md border border-scm-outline-variant px-3 py-2"
            rows={3}
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setSaved(false);
            }}
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <Button type="submit">{t("common.save")}</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/operations/production-calendar">{t("nav.productionCalendar")}</Link>
          </Button>
        </div>
        {saved ? (
          <p className="text-sm text-emerald-700">{t("common.savedMock")}</p>
        ) : null}
      </form>
    </div>
  );
}

export default function DailyLogPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <DailyLogForm />
    </Suspense>
  );
}
