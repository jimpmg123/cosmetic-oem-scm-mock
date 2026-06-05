"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { FormField, inputClassName } from "@/components/layout/page-parts";
import { TermLabel } from "@/components/ui/term-tooltip";
import { useLocale } from "@/components/providers/locale-provider";
import { useCatalogStore } from "@/components/providers/catalog-store-provider";
import { useMockStore } from "@/components/providers/mock-store-provider";
import {
  DEFAULT_BUNDLE_THEORETICAL_QTY,
  formatCatalogProductOptionLabel,
  resolveLineForProduct,
} from "@/lib/catalog/bundle-product";
import { VENDORS } from "@/lib/mock/material-bundles";

function NewMaterialBundleForm() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createMaterialBundle } = useMockStore();
  const { brandLines, products } = useCatalogStore();

  const sortedProducts = useMemo(
    () =>
      [...products].sort((a, b) => {
        const lineA = resolveLineForProduct(brandLines, a)?.name ?? "";
        const lineB = resolveLineForProduct(brandLines, b)?.name ?? "";
        return lineA.localeCompare(lineB) || a.code.localeCompare(b.code);
      }),
    [products, brandLines],
  );

  const queryProductId = searchParams.get("productId");
  const initialProductId = useMemo(() => {
    if (queryProductId && sortedProducts.some((p) => p.id === queryProductId)) {
      return queryProductId;
    }
    return sortedProducts[0]?.id ?? "";
  }, [queryProductId, sortedProducts]);

  const [productId, setProductId] = useState(initialProductId);
  const [theoreticalQty, setTheoreticalQty] = useState(
    String(DEFAULT_BUNDLE_THEORETICAL_QTY),
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

  const selectedProduct = sortedProducts.find((p) => p.id === productId);
  const selectedLine = selectedProduct
    ? resolveLineForProduct(brandLines, selectedProduct)
    : undefined;

  const prefilledRef = useRef<string | null>(null);

  function handleProductChange(nextId: string) {
    setProductId(nextId);
    const product = sortedProducts.find((p) => p.id === nextId);
    if (!product) return;
    const line = resolveLineForProduct(brandLines, product);
    if (line) setVendorId(line.manufacturerId);
    setTheoreticalQty(String(DEFAULT_BUNDLE_THEORETICAL_QTY));
  }

  useEffect(() => {
    if (!initialProductId || prefilledRef.current === initialProductId) return;
    prefilledRef.current = initialProductId;
    handleProductChange(initialProductId);
  }, [initialProductId, sortedProducts, brandLines]);

  function validate(activate: boolean): boolean {
    if (!productId) {
      setError(t("bundle.form.errorProduct"));
      return false;
    }
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
      productId,
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
          <div className="sm:col-span-2 space-y-1.5">
            <FormField label={t("bundle.form.product")}>
              <select
                className={inputClassName}
                value={productId}
                onChange={(e) => handleProductChange(e.target.value)}
              >
                {sortedProducts.map((product) => {
                  const line = resolveLineForProduct(brandLines, product);
                  return (
                    <option key={product.id} value={product.id}>
                      {formatCatalogProductOptionLabel(product, line?.name ?? "—")}
                    </option>
                  );
                })}
              </select>
            </FormField>
            <p className="text-xs text-scm-on-surface-variant">
              {t("bundle.form.productHint")}
            </p>
          </div>
          {selectedProduct && selectedLine ? (
            <p className="sm:col-span-2 text-xs text-scm-on-surface-variant">
              {t("bundle.form.productSelected")}:{" "}
              <span className="font-mono text-scm-primary">{selectedProduct.code}</span>
              {" · "}
              {selectedLine.name}
              {" · "}
              {selectedProduct.name}
            </p>
          ) : null}
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
          <div className="sm:col-span-2">
            <FormField label={t("bundle.form.poWo")}>
              <input
                className={inputClassName}
                value={poWoRef}
                onChange={(e) => setPoWoRef(e.target.value)}
              />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label={t("bundle.form.note")}>
              <textarea
                className={inputClassName}
                rows={3}
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
              />
            </FormField>
          </div>
        </div>
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

      <div className="flex flex-wrap gap-3 border-t border-scm-outline-variant pt-6">
        <Button type="button" onClick={() => handleSave(false)}>
          {t("bundle.new.save")}
        </Button>
        <Button type="button" variant="secondary" onClick={() => handleSave(true)}>
          {t("bundle.new.saveAndShip")}
        </Button>
        <Button type="button" variant="ghost" onClick={handleCancel}>
          {t("common.cancel")}
        </Button>
      </div>
    </div>
  );
}

export default function NewMaterialBundlePage() {
  return (
    <Suspense fallback={<div className="p-6 text-scm-on-surface-variant">Loading…</div>}>
      <NewMaterialBundleForm />
    </Suspense>
  );
}
