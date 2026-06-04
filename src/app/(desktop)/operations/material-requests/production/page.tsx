"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader, FormField, inputClassName } from "@/components/layout/page-parts";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/locale-provider";
import {
  useCatalogStore,
  calcProductionLines,
  DEFAULT_YIELD_PCT,
  MAX_YIELD_PCT,
} from "@/components/providers/catalog-store-provider";
import { useRole } from "@/components/providers/role-provider";
import { ProductThumbnail } from "@/components/catalog/product-thumbnail";
import { ManufacturerSelect } from "@/components/catalog/manufacturer-select";
import type { MaterialRequestLine, ProductionRequestItem } from "@/lib/mock/product-catalog";

type DraftProduct = {
  productId: string;
  qty: number;
  yieldPct: number;
};

export default function MaterialRequestProductionPage() {
  const { t } = useLocale();
  const { role } = useRole();
  const { manufacturers, brandLines, products, submitMaterialRequest } = useCatalogStore();
  const [manufacturerId, setManufacturerId] = useState(manufacturers[0]?.id ?? "");
  const [drafts, setDrafts] = useState<DraftProduct[]>([]);
  const [pickId, setPickId] = useState("");
  const [pickQty, setPickQty] = useState("100");
  const [pickYield, setPickYield] = useState(String(DEFAULT_YIELD_PCT));
  const [comment, setComment] = useState("");
  const [done, setDone] = useState("");

  const mergedLines = useMemo(() => {
    const map = new Map<string, MaterialRequestLine>();
    for (const d of drafts) {
      const product = products.find((p) => p.id === d.productId);
      if (!product) continue;
      const lines = calcProductionLines(product, d.qty, d.yieldPct);
      for (const line of lines) {
        const key = `${line.itemCode}::${line.productId ?? ""}`;
        const prev = map.get(key);
        if (prev) {
          map.set(key, { ...prev, qty: prev.qty + line.qty });
        } else {
          map.set(key, line);
        }
      }
    }
    return [...map.values()];
  }, [drafts, products]);

  function addDraft() {
    const product = products.find((p) => p.id === pickId);
    if (!product) return;
    const qty = Math.max(1, Number(pickQty) || 1);
    let yieldPct = Number(pickYield) || DEFAULT_YIELD_PCT;
    yieldPct = Math.min(MAX_YIELD_PCT, Math.max(0, yieldPct));
    const line = brandLines.find((l) => l.id === product.lineId);
    if (line) setManufacturerId(line.manufacturerId);

    setDrafts((prev) => {
      const existing = prev.find((d) => d.productId === pickId);
      if (existing) {
        return prev.map((d) =>
          d.productId === pickId ? { ...d, qty, yieldPct } : d,
        );
      }
      return [...prev, { productId: pickId, qty, yieldPct }];
    });
  }

  function removeDraft(productId: string) {
    setDrafts((prev) => prev.filter((d) => d.productId !== productId));
  }

  function handleSubmit() {
    if (!manufacturerId || !drafts.length || !mergedLines.length) return;
    const productionItems: ProductionRequestItem[] = drafts.map((d) => {
      const p = products.find((x) => x.id === d.productId)!;
      return {
        productId: d.productId,
        productName: p.name,
        qty: d.qty,
        yieldPct: d.yieldPct,
      };
    });
    submitMaterialRequest({
      type: "b_production",
      lines: mergedLines,
      productionItems,
      comment: comment || undefined,
      manufacturerId,
      createdBy: role === "b_admin" ? "B Admin" : "User",
    });
    setDone(t("req.production.submitted"));
    setDrafts([]);
    setComment("");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("req.production.title")}
        description={t("req.production.desc")}
        actions={
          <Link href="/operations/material-requests" className="text-sm text-scm-link">
            ← {t("req.hub.title")}
          </Link>
        }
      />
      {done ? <p className="text-sm font-medium text-scm-secondary">{done}</p> : null}

      <div className="rounded-lg border border-scm-outline-variant bg-scm-surface-container-low p-3 text-sm">
        {t("req.production.formula")}
      </div>

      <ManufacturerSelect
        manufacturers={manufacturers}
        value={manufacturerId}
        onChange={setManufacturerId}
        required
        hint={t("req.production.mfrHint")}
      />

      <div className="grid gap-3 md:grid-cols-4 md:items-end">
        <div className="md:col-span-2">
        <FormField label={t("req.production.product")}>
          <select
            className={inputClassName}
            value={pickId}
            onChange={(e) => setPickId(e.target.value)}
          >
            <option value="">{t("picker.selectProduct")}</option>
            {brandLines.map((line) => (
              <optgroup key={line.id} label={line.name}>
                {products
                  .filter((p) => p.lineId === line.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </FormField>
        </div>
        <FormField label={t("req.production.qty")}>
          <input
            type="number"
            min={1}
            className={inputClassName}
            value={pickQty}
            onChange={(e) => setPickQty(e.target.value)}
          />
        </FormField>
        <FormField label={t("req.production.yield")}>
          <input
            type="number"
            min={0}
            max={MAX_YIELD_PCT}
            className={inputClassName}
            value={pickYield}
            onChange={(e) => setPickYield(e.target.value)}
          />
          <p className="mt-0.5 text-xs text-scm-on-surface-variant">
            {t("req.production.yieldHint")} ({MAX_YIELD_PCT}% max)
          </p>
        </FormField>
        <Button type="button" onClick={addDraft}>
          {t("req.production.addProduct")}
        </Button>
      </div>

      {drafts.length > 0 ? (
        <ul className="space-y-2">
          {drafts.map((d) => {
            const p = products.find((x) => x.id === d.productId);
            if (!p) return null;
            return (
              <li
                key={d.productId}
                className="flex items-center gap-3 rounded-lg border border-scm-outline-variant p-3"
              >
                <ProductThumbnail
                  name={p.name}
                  imageUrl={p.imageUrl}
                  cosmeticType={p.cosmeticType}
                  size="sm"
                />
                <div className="flex-1 text-sm">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-scm-on-surface-variant">
                    {d.qty.toLocaleString()} {t("req.production.units")} · +{d.yieldPct}%{" "}
                    {t("req.production.yield")}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-xs text-scm-error"
                  onClick={() => removeDraft(d.productId)}
                >
                  {t("common.delete")}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {mergedLines.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold text-scm-primary">
            {t("req.production.preview")}
          </h2>
          <table className="mt-2 w-full text-sm">
            <tbody>
              {mergedLines.map((l) => (
                <tr key={l.id} className="border-t border-scm-outline-variant/50">
                  <td className="py-1.5 font-mono text-xs">{l.itemCode}</td>
                  <td>{l.itemName}</td>
                  <td className="text-right tabular-nums">
                    {l.qty} {l.unit}
                  </td>
                  <td className="text-scm-on-surface-variant text-xs">{l.productName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <FormField label={t("req.production.comment")}>
        <textarea
          className={inputClassName}
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </FormField>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!manufacturerId || !mergedLines.length}
      >
        {t("req.production.submit")}
      </Button>
    </div>
  );
}
