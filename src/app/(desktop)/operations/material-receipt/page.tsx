"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/locale-provider";
import { useMockStore } from "@/components/providers/mock-store-provider";

function MaterialReceiptForm() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const {
    materialBundles,
    getMaterialReceipt,
    getReceiptAudits,
    saveMaterialReceipt,
  } = useMockStore();

  const active = materialBundles.filter((b) => b.status === "active");
  const [bundleId, setBundleId] = useState(
    searchParams.get("bundleId") ?? active[0]?.id ?? "",
  );
  const bundle = materialBundles.find((b) => b.id === bundleId);
  const receipt = bundleId ? getMaterialReceipt(bundleId) : undefined;
  const audits = bundleId ? getReceiptAudits(bundleId) : [];

  const [qty, setQty] = useState(
    String(receipt?.bConfirmedQty ?? bundle?.materialShipQty ?? ""),
  );
  const [comment, setComment] = useState("");
  const [saved, setSaved] = useState(false);

  const aShipped = receipt?.aShippedQty ?? bundle?.materialShipQty ?? 0;
  const gap =
    receipt?.bConfirmedQty != null ? aShipped - receipt.bConfirmedQty : null;

  function onSave() {
    if (!bundleId || !comment.trim()) return;
    saveMaterialReceipt(bundleId, Number(qty) || 0, comment);
    setSaved(true);
    setComment("");
  }

  function onMatchAll() {
    setQty(String(aShipped));
    saveMaterialReceipt(bundleId, aShipped, "전량 일치 확인");
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-scm-primary">{t("receipt.title")}</h1>
        <p className="mt-1 text-sm text-scm-on-surface-variant">{t("receipt.desc")}</p>
      </div>

      <label className="block text-sm">
        <span className="font-medium">{t("dailyLog.selectBundle")}</span>
        <select
          className="mt-1 w-full rounded-md border border-scm-outline-variant px-3 py-2"
          value={bundleId}
          onChange={(e) => {
            setBundleId(e.target.value);
            const r = getMaterialReceipt(e.target.value);
            const b = materialBundles.find((x) => x.id === e.target.value);
            setQty(String(r?.bConfirmedQty ?? b?.materialShipQty ?? ""));
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

      <div className="rounded-lg border border-scm-outline-variant bg-scm-surface-lowest p-5 space-y-4">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-scm-on-surface-variant">{t("receipt.aShipped")}</dt>
            <dd className="text-lg font-medium tabular-nums">{aShipped.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-scm-on-surface-variant">{t("receipt.status.pending")}</dt>
            <dd className="font-medium">
              {receipt?.status === "matched"
                ? t("receipt.status.matched")
                : receipt?.status === "disputed"
                  ? t("receipt.status.disputed")
                  : t("receipt.status.pending")}
            </dd>
          </div>
        </dl>

        <label className="block text-sm">
          <span className="font-medium">{t("receipt.bConfirmed")}</span>
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-md border border-scm-outline-variant px-3 py-3 text-xl tabular-nums"
            value={qty}
            onChange={(e) => {
              setQty(e.target.value);
              setSaved(false);
            }}
          />
        </label>

        {gap != null && gap !== 0 ? (
          <p className="text-sm text-amber-800">
            {t("receipt.gap")}: {gap > 0 ? "+" : ""}
            {gap.toLocaleString()}
          </p>
        ) : null}

        <label className="block text-sm">
          <span className="font-medium">{t("receipt.comment")}</span>
          <textarea
            className="mt-1 w-full rounded-md border border-scm-outline-variant px-3 py-2"
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="수정·확정 사유"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={onSave} disabled={!comment.trim()}>
            {t("common.save")}
          </Button>
          <Button type="button" variant="outline" onClick={onMatchAll}>
            {t("receipt.matchAll")}
          </Button>
        </div>
        {saved ? <p className="text-sm text-emerald-700">{t("common.savedMock")}</p> : null}
      </div>

      {audits.length > 0 ? (
        <div className="rounded-lg border border-scm-outline-variant">
          <h2 className="border-b px-4 py-3 font-medium">{t("receipt.history")}</h2>
          <ul className="divide-y text-sm">
            {audits.map((a) => (
              <li key={a.id} className="px-4 py-3">
                <div className="text-scm-on-surface-variant">
                  {new Date(a.changedAt).toLocaleString()} · {a.changedBy} · {a.action}
                </div>
                <div className="tabular-nums">
                  {a.previousQty?.toLocaleString() ?? "—"} → {a.newQty.toLocaleString()}
                </div>
                <div className="mt-1">{a.comment}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default function MaterialReceiptPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <MaterialReceiptForm />
    </Suspense>
  );
}
