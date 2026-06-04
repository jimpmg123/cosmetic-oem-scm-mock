"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/locale-provider";
import { useMockStore } from "@/components/providers/mock-store-provider";

function BundleShipmentsContent() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const {
    materialBundles,
    bundleShipments,
    dailyLogs,
    addBundleShipment,
  } = useMockStore();

  const active = materialBundles.filter((b) => b.status === "active");
  const initialBundle =
    searchParams.get("bundleId") ?? active[0]?.id ?? "";
  const [bundleId, setBundleId] = useState(initialBundle);
  const [qty, setQty] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saved, setSaved] = useState(false);

  const bundle = materialBundles.find((b) => b.id === bundleId);
  const rows = bundleShipments.filter((s) => s.bundleId === bundleId);

  const shippableCap = useMemo(() => {
    const produced = dailyLogs
      .filter((l) => l.bundleId === bundleId)
      .reduce((s, l) => s + l.producedQty, 0);
    const defect = dailyLogs
      .filter((l) => l.bundleId === bundleId)
      .reduce((s, l) => s + l.defectQty, 0);
    const alreadyShipped = rows.reduce((s, r) => s + r.shippedQty, 0);
    return Math.max(0, produced - defect - alreadyShipped);
  }, [bundleId, dailyLogs, rows]);

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!bundleId) return;
    addBundleShipment({
      bundleId,
      shippedQty: Number(qty) || 0,
      shippedAt: date,
    });
    setQty("");
    setSaved(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-scm-primary">{t("bundleShip.title")}</h1>
        <p className="mt-1 text-sm text-scm-on-surface-variant">{t("bundleShip.desc")}</p>
      </div>

      <label className="block max-w-md text-sm">
        <span className="font-medium">{t("dailyLog.selectBundle")}</span>
        <select
          className="mt-1 w-full rounded-md border border-scm-outline-variant px-3 py-2"
          value={bundleId}
          onChange={(e) => {
            setBundleId(e.target.value);
            setSaved(false);
          }}
        >
          {active.map((b) => (
            <option key={b.id} value={b.id}>
              {b.number} — {b.sku}
            </option>
          ))}
        </select>
      </label>

      <form
        onSubmit={onAdd}
        className="grid gap-4 rounded-lg border border-scm-outline-variant bg-scm-surface-lowest p-5 sm:grid-cols-3"
      >
        <label className="block text-sm sm:col-span-1">
          <span className="font-medium">{t("bundle.shipment.shipped")}</span>
          <input
            type="number"
            min={1}
            max={shippableCap || undefined}
            required
            className="mt-1 w-full rounded-md border border-scm-outline-variant px-3 py-2 tabular-nums"
            value={qty}
            onChange={(e) => {
              setQty(e.target.value);
              setSaved(false);
            }}
          />
          <p className="mt-1 text-xs text-scm-on-surface-variant">
            {t("bundleShip.maxHint")}: {shippableCap.toLocaleString()}
          </p>
        </label>
        <label className="block text-sm">
          <span className="font-medium">{t("bundle.form.shippedAt")}</span>
          <input
            type="date"
            className="mt-1 w-full rounded-md border border-scm-outline-variant px-3 py-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <div className="flex items-end">
          <Button type="submit" className="w-full sm:w-auto">
            {t("bundleShip.add")}
          </Button>
        </div>
        {saved ? (
          <p className="text-sm text-emerald-700 sm:col-span-3">{t("common.savedMock")}</p>
        ) : null}
      </form>

      {bundle ? (
        <p className="text-sm text-scm-on-surface-variant">
          {bundle.number} · {bundle.productName}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-scm-outline-variant bg-scm-surface-lowest">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b bg-scm-surface-container-low text-left text-scm-on-surface-variant">
              <th className="px-4 py-3 font-medium">{t("bundle.shipment.number")}</th>
              <th className="px-4 py-3 font-medium text-right">{t("bundle.shipment.shipped")}</th>
              <th className="px-4 py-3 font-medium text-right">{t("bundle.shipment.received")}</th>
              <th className="px-4 py-3 font-medium">{t("bundle.form.shippedAt")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-scm-on-surface-variant">
                  {t("common.empty")}
                </td>
              </tr>
            ) : (
              rows.map((s) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{s.number}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{s.shippedQty.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {s.receivedQty?.toLocaleString() ?? "—"}
                  </td>
                  <td className="px-4 py-3">{s.shippedAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Button variant="outline" asChild>
        <Link href={`/operations/bundles/${bundleId}`}>{t("bundle.backToList")}</Link>
      </Button>
    </div>
  );
}

export default function BundleShipmentsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <BundleShipmentsContent />
    </Suspense>
  );
}
