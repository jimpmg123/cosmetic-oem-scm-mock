"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MaterialLinesTable } from "@/components/catalog/material-lines-table";
import { useCatalogStore } from "@/components/providers/catalog-store-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { useMockStore } from "@/components/providers/mock-store-provider";
import { Button } from "@/components/ui/button";
import { ManufacturerSelect } from "@/components/catalog/manufacturer-select";
import {
  buildShipmentLinesFromCatalog,
  resolveCatalogProduct,
} from "@/lib/catalog/bundle-catalog-link";
import {
  DEFAULT_LOSS_ALLOWANCE_PCT,
  INITIAL_MANUFACTURERS,
  type MaterialRequestLine,
} from "@/lib/mock/product-catalog";
import {
  INITIAL_MATERIAL_SHIPMENTS,
  type MaterialLine,
  type MaterialShipmentRecord,
} from "@/lib/mock/material-shipment-lines";
function toRequestLines(
  lines: MaterialLine[],
  productName?: string,
  lineName?: string,
): MaterialRequestLine[] {
  return lines.map((l) => ({
    id: l.id,
    itemCode: l.itemCode,
    itemName: l.itemName,
    unit: l.unit,
    qty: l.qty,
    productName,
    lineName,
  }));
}

function fromRequestLines(rows: MaterialRequestLine[]): MaterialLine[] {
  return rows.map((r) => ({
    id: r.id,
    itemCode: r.itemCode,
    itemName: r.itemName,
    unit: r.unit,
    qty: r.qty,
    lotNo: undefined,
  }));
}

export default function MaterialShipmentPage() {
  const { t } = useLocale();
  const { materialBundles } = useMockStore();
  const { brandLines, products } = useCatalogStore();

  const [filterMfrId, setFilterMfrId] = useState(INITIAL_MANUFACTURERS[0]?.id ?? "");

  const aBundles = useMemo(() => {
    const open = materialBundles.filter((b) => b.status !== "closed");
    if (!filterMfrId) return open;
    return open.filter((b) => b.vendorId === filterMfrId);
  }, [materialBundles, filterMfrId]);

  const [bundleId, setBundleId] = useState(aBundles[0]?.id ?? "");
  const bundle = aBundles.find((b) => b.id === bundleId);

  useEffect(() => {
    if (!aBundles.length) {
      setBundleId("");
      return;
    }
    if (!aBundles.some((b) => b.id === bundleId)) {
      setBundleId(aBundles[0].id);
    }
  }, [aBundles, bundleId]);

  const catalogContext = useMemo(() => {
    if (!bundle) return null;
    const product = resolveCatalogProduct(products, bundle.sku, bundle.productId);
    if (!product) return null;
    const line = brandLines.find((l) => l.id === product.lineId);
    return { product, lineName: line?.name ?? "" };
  }, [bundle, products, brandLines]);

  const [shipments, setShipments] = useState(INITIAL_MATERIAL_SHIPMENTS);
  const bundleShipments = shipments.filter((s) => s.bundleId === bundleId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftRequestLines, setDraftRequestLines] = useState<MaterialRequestLine[]>([]);
  const [savedMsg, setSavedMsg] = useState("");

  function buildDefaultLines(): MaterialLine[] {
    if (!bundle || !catalogContext) return [];
    const units = bundle.grantQty ?? bundle.targetQty;
    return buildShipmentLinesFromCatalog(
      catalogContext.product,
      catalogContext.lineName,
      units,
      bundle.lossAllowancePct ?? DEFAULT_LOSS_ALLOWANCE_PCT,
    );
  }

  function startNewShipment() {
    if (!bundle || !catalogContext) return;
    const id = `mshp-new-${Date.now()}`;
    const lines = buildDefaultLines();
    const row: MaterialShipmentRecord = {
      id,
      bundleId: bundle.id,
      number: `MSHP-DRAFT`,
      shippedAt: new Date().toISOString().slice(0, 10),
      status: "planned",
      manufacturerId: bundle.vendorId,
      manufacturerName: bundle.vendorName,
      lines,
      note: t("shipmentLines.newNote"),
    };
    setShipments((prev) => [...prev, row]);
    setEditingId(id);
    setDraftRequestLines(
      toRequestLines(lines, catalogContext.product.name, catalogContext.lineName),
    );
  }

  function startEdit(s: MaterialShipmentRecord) {
    setEditingId(s.id);
    setDraftRequestLines(
      toRequestLines(
        s.lines,
        catalogContext?.product.name,
        catalogContext?.lineName,
      ),
    );
  }

  function saveDraft() {
    if (!editingId) return;
    const lines = fromRequestLines(draftRequestLines);
    setShipments((prev) =>
      prev.map((s) =>
        s.id === editingId ? { ...s, lines, status: "shipped" as const } : s,
      ),
    );
    setEditingId(null);
    setSavedMsg(t("common.savedMock"));
    setTimeout(() => setSavedMsg(""), 2500);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-scm-primary">
          {t("shipmentLines.title")}
        </h1>
        <p className="mt-1 text-sm text-scm-on-surface-variant">
          {t("shipmentLines.desc")}
        </p>
        {savedMsg ? (
          <p className="mt-2 text-sm font-medium text-scm-secondary">{savedMsg}</p>
        ) : null}
      </div>

      <ManufacturerSelect
        manufacturers={INITIAL_MANUFACTURERS}
        value={filterMfrId}
        onChange={(id) => {
          setFilterMfrId(id);
          setBundleId("");
          setEditingId(null);
        }}
        label={t("shipmentLines.selectManufacturer")}
        hint={t("shipmentLines.mfrHint")}
      />

      <label className="block max-w-xl text-sm">
        <span className="font-medium">{t("shipmentLines.selectBundle")}</span>
        <select
          className="mt-1 w-full rounded-md border border-scm-outline-variant px-3 py-2"
          value={bundleId}
          onChange={(e) => {
            setBundleId(e.target.value);
            setEditingId(null);
          }}
        >
          {aBundles.map((b) => (
            <option key={b.id} value={b.id}>
              {b.number} · {b.sku} · {b.productName}
            </option>
          ))}
        </select>
      </label>

      {bundle ? (
        <>
          <p className="text-sm text-scm-on-surface-variant">
            {t("shipmentLines.vendorLabel")}:{" "}
            <strong>{bundle.vendorName}</strong>
            {" · "}
            {t("shipmentLines.theoreticalHint")}:{" "}
            <strong>{bundle.theoreticalQty.toLocaleString()}</strong>
            {catalogContext ? (
              <>
                {" · "}
                <span className="text-scm-primary">{catalogContext.product.name}</span>
                <span className="text-scm-on-surface-variant">
                  {" "}
                  ({catalogContext.product.code})
                </span>
              </>
            ) : null}
            {" · "}
            <Link
              href={`/operations/material-bundles/${bundle.id}`}
              className="text-scm-link hover:underline"
            >
              {bundle.number}
            </Link>
          </p>

          {!catalogContext ? (
            <p className="rounded-md border border-amber-200/80 bg-amber-50/50 px-3 py-2 text-sm text-scm-on-surface-variant">
              {t("shipmentLines.noCatalogProduct")}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={startNewShipment}
              disabled={!catalogContext}
            >
              {t("shipmentLines.addShipment")}
            </Button>
          </div>

          {bundleShipments.map((s) => (
            <div
              key={s.id}
              className="overflow-hidden rounded-lg border border-scm-outline-variant bg-scm-surface-lowest shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-scm-outline-variant/60 px-3 py-2.5">
                <div>
                  <p className="font-medium text-scm-primary">
                    {s.number} · {s.shippedAt}
                  </p>
                  <p className="text-xs text-scm-on-surface-variant">
                    {s.manufacturerName} · {t(`shipmentLines.status.${s.status}`)}
                    {s.note ? ` · ${s.note}` : ""}
                  </p>
                </div>
                {editingId !== s.id ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(s)}
                  >
                    {t("common.edit")}
                  </Button>
                ) : null}
              </div>
              {editingId !== s.id ? (
                <MaterialLinesTable
                  lines={toRequestLines(
                    s.lines,
                    catalogContext?.product.name,
                    catalogContext?.lineName,
                  )}
                  allowQtyEdit={false}
                />
              ) : null}
            </div>
          ))}

          {editingId ? (
            <div className="space-y-3 rounded-lg border-2 border-scm-primary/30 bg-scm-surface-container-low p-4">
              <p className="font-medium text-scm-primary">{t("shipmentLines.editor")}</p>
              <div className="overflow-hidden rounded-lg border border-scm-outline-variant bg-scm-surface-lowest">
                <MaterialLinesTable
                  lines={draftRequestLines}
                  allowQtyEdit
                  onChangeQty={(id, qty) =>
                    setDraftRequestLines((prev) =>
                      prev.map((l) => (l.id === id ? { ...l, qty } : l)),
                    )
                  }
                  onRemove={(id) =>
                    setDraftRequestLines((prev) => prev.filter((l) => l.id !== id))
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" onClick={saveDraft}>
                  {t("common.save")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingId(null)}
                >
                  {t("common.cancel")}
                </Button>
              </div>
            </div>
          ) : null}

          {catalogContext ? (
            <details className="text-sm text-scm-on-surface-variant">
              <summary className="cursor-pointer font-medium">
                {t("shipmentLines.bomRef")} ({catalogContext.product.code})
              </summary>
              <ul className="mt-2 list-inside list-disc">
                {catalogContext.product.bom.map((l) => (
                  <li key={l.id}>
                    {l.itemCode} — {l.itemName} · {l.qtyPerUnit} {l.unit}/ea
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
