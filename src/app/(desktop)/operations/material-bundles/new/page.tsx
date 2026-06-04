"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { FormField, inputClassName } from "@/components/layout/page-parts";
import { TermLabel } from "@/components/ui/term-tooltip";
import { useLocale } from "@/components/providers/locale-provider";
import { useMockStore } from "@/components/providers/mock-store-provider";
import { SKU_OPTIONS, VENDORS } from "@/lib/mock/material-bundles";

export default function NewMaterialBundlePage() {
  const { t } = useLocale();
  const router = useRouter();
  const { createMaterialBundle } = useMockStore();

  const [sku, setSku] = useState(SKU_OPTIONS[0]?.sku ?? "");
  const [theoreticalQty, setTheoreticalQty] = useState(
    String(SKU_OPTIONS[0]?.theoreticalQty ?? 0),
  );
  const [targetQty, setTargetQty] = useState("");
  const [useFromDate, setUseFromDate] = useState("");
  const [useByDate, setUseByDate] = useState("");
  const [vendorId, setVendorId] = useState(VENDORS[0]?.id ?? "");
  const [poWoRef, setPoWoRef] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [materialShipQty, setMaterialShipQty] = useState("");
  const [shippedAt, setShippedAt] = useState("");
  const [error, setError] = useState("");

  function handleSkuChange(nextSku: string) {
    setSku(nextSku);
    const meta = SKU_OPTIONS.find((s) => s.sku === nextSku);
    if (meta) {
      setTheoreticalQty(String(meta.theoreticalQty));
    }
  }

  function validate(activate: boolean): boolean {
    const n = Number(theoreticalQty);
    const target = Number(targetQty);
    if (target > n) {
      setError(t("bundle.form.errorTarget"));
      return false;
    }
    if (useFromDate && useByDate && useFromDate > useByDate) {
      setError(t("bundle.form.errorDates"));
      return false;
    }
    if (activate && !shippedAt) {
      setError(t("bundle.form.errorShipDate"));
      return false;
    }
    if (!useByDate) {
      setError(t("bundle.form.errorUseBy"));
      return false;
    }
    setError("");
    return true;
  }

  function handleSave(activate: boolean) {
    if (!validate(activate)) return;
    const id = createMaterialBundle({
      sku,
      theoreticalQty: Number(theoreticalQty),
      targetQty: Number(targetQty),
      useFromDate: useFromDate || undefined,
      useByDate,
      vendorId,
      poWoRef: poWoRef || undefined,
      internalNote: internalNote || undefined,
      materialShipQty: materialShipQty ? Number(materialShipQty) : undefined,
      shippedAt: shippedAt || undefined,
      activate,
    });
    router.push(`/operations/material-bundles/${id}`);
  }

  function handleCancel() {
    if (
      !sku &&
      !targetQty &&
      !useByDate &&
      window.confirm(t("bundle.form.cancelConfirm"))
    ) {
      router.push("/operations/material-bundles");
      return;
    }
    if (window.confirm(t("bundle.form.cancelConfirm"))) {
      router.push("/operations/material-bundles");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/operations/material-bundles"
          className="mb-2 inline-flex items-center gap-1 text-sm text-scm-on-surface-variant hover:text-scm-primary"
        >
          <MaterialIcon name="arrow_back" className="text-[18px]" />
          {t("bundle.backToList")}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-scm-primary">
          {t("bundle.new.title")}
        </h1>
        <p className="mt-1 text-sm text-scm-on-surface-variant">
          {t("bundle.new.desc")}
        </p>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <section className="space-y-4 border-t border-scm-outline-variant pt-6">
        <h2 className="text-base font-semibold text-scm-primary">
          {t("bundle.section.basic")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t("bundle.form.sku")}>
            <select
              className={inputClassName}
              value={sku}
              onChange={(e) => handleSkuChange(e.target.value)}
            >
              {SKU_OPTIONS.map((opt) => (
                <option key={opt.sku} value={opt.sku}>
                  {opt.sku} — {opt.productName}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label={t("bundle.form.vendor")}>
            <select
              className={inputClassName}
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
            >
              {VENDORS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.chineseName ? `${v.name} (${v.chineseName})` : v.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField
            label={
              <TermLabel term="theoreticalOutput">
                {t("bundle.form.theoretical")}
              </TermLabel>
            }
          >
            <input
              type="number"
              className={inputClassName}
              value={theoreticalQty}
              onChange={(e) => setTheoreticalQty(e.target.value)}
              required
            />
          </FormField>
          <FormField label={t("bundle.form.target")}>
            <input
              type="number"
              className={inputClassName}
              value={targetQty}
              onChange={(e) => setTargetQty(e.target.value)}
              required
            />
          </FormField>
          <FormField label={t("bundle.form.useFrom")}>
            <input
              type="date"
              className={inputClassName}
              value={useFromDate}
              onChange={(e) => setUseFromDate(e.target.value)}
            />
          </FormField>
          <FormField label={t("bundle.form.useBy")}>
            <input
              type="date"
              className={inputClassName}
              value={useByDate}
              onChange={(e) => setUseByDate(e.target.value)}
              required
            />
          </FormField>
          <FormField label={t("bundle.form.poWo")} >
            <input
              className={`${inputClassName} sm:col-span-2`}
              value={poWoRef}
              onChange={(e) => setPoWoRef(e.target.value)}
            />
          </FormField>
        </div>
        <FormField label={t("bundle.form.note")}>
          <textarea
            className={`${inputClassName} min-h-[88px] py-2`}
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
          />
        </FormField>
      </section>

      <section className="space-y-4 border-t border-scm-outline-variant pt-6">
        <h2 className="text-base font-semibold text-scm-primary">
          {t("bundle.section.shipment")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t("bundle.form.materialShipQty")}>
            <input
              type="number"
              className={inputClassName}
              value={materialShipQty}
              onChange={(e) => setMaterialShipQty(e.target.value)}
            />
          </FormField>
          <FormField label={t("bundle.form.shippedAt")}>
            <input
              type="date"
              className={inputClassName}
              value={shippedAt}
              onChange={(e) => setShippedAt(e.target.value)}
            />
          </FormField>
        </div>
      </section>

      <div className="flex flex-wrap gap-2 border-t border-scm-outline-variant pt-6">
        <Button onClick={() => handleSave(false)}>{t("common.save")}</Button>
        <Button variant="outline" onClick={() => handleSave(true)}>
          {t("bundle.new.saveAndShip")}
        </Button>
        <Button variant="outline" onClick={handleCancel}>
          {t("common.cancel")}
        </Button>
      </div>
    </div>
  );
}
