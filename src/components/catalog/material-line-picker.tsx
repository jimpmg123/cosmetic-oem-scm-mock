"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/locale-provider";
import { useCatalogStore } from "@/components/providers/catalog-store-provider";
import { ProductThumbnail } from "@/components/catalog/product-thumbnail";
import { formatBomPercent, formatBomQtyPerUnit } from "@/lib/catalog/format-volume";
import { getCosmeticTypeLabel } from "@/lib/i18n/catalog-labels";
import {
  A_PUSH_YIELD_PCT,
  calcProductionLines,
  scaledMaterialQty,
  searchCatalog,
  type CatalogProduct,
  type CatalogSearchHit,
  type MaterialRequestLine,
} from "@/lib/mock/product-catalog";
import { inputClassName } from "@/components/layout/page-parts";
import { MaterialLinesTable } from "@/components/catalog/material-lines-table";

function hitKey(hit: CatalogSearchHit): string {
  if (hit.kind === "line") return `line-${hit.line.id}`;
  if (hit.kind === "product") return `prod-${hit.product.id}`;
  return `mat-${hit.product.id}-${hit.bom.itemCode}`;
}

export function MaterialLinePicker({
  lines,
  onChange,
  allowQtyEdit = true,
  /** 완제품 목표 수량 — 설정 시 BOM 추가에 수율 반영 */
  scaleTargetUnits,
  /** scaleTargetUnits 와 함께 사용 (기본 A 통지 5%) */
  scaleYieldPct = A_PUSH_YIELD_PCT,
}: {
  lines: MaterialRequestLine[];
  onChange: (lines: MaterialRequestLine[]) => void;
  allowQtyEdit?: boolean;
  scaleTargetUnits?: number;
  scaleYieldPct?: number;
}) {
  const { t, locale } = useLocale();
  const { brandLines, products } = useCatalogStore();
  const [query, setQuery] = useState("");
  const [pickProductId, setPickProductId] = useState("");
  const [mode, setMode] = useState<"search" | "product">("search");

  const scaledUnits = Math.max(0, scaleTargetUnits ?? 0);
  const useScaling = scaledUnits > 0;

  const effectiveUnits = useScaling
    ? Math.ceil(scaledUnits * (1 + scaleYieldPct / 100))
    : 0;

  const hits = useMemo(
    () => searchCatalog(query, brandLines, products).slice(0, 12),
    [query, brandLines, products],
  );

  const selectedProduct = products.find((p) => p.id === pickProductId);

  function addLine(partial: Omit<MaterialRequestLine, "id">) {
    const exists = lines.find(
      (l) =>
        l.itemCode === partial.itemCode &&
        l.productId === partial.productId,
    );
    if (exists) {
      onChange(
        lines.map((l) =>
          l.itemCode === partial.itemCode && l.productId === partial.productId
            ? { ...l, qty: partial.qty }
            : l,
        ),
      );
      return;
    }
    onChange([
      ...lines,
      { id: `rl-${Date.now()}-${Math.random()}`, ...partial },
    ]);
  }

  function addProductBom(
    product: CatalogProduct,
    lineName: string,
    replaceExisting = true,
  ) {
    if (useScaling) {
      const calculated = calcProductionLines(
        product,
        scaledUnits,
        scaleYieldPct,
        lineName,
      ).map((row) => ({
        ...row,
        id: `rl-${Date.now()}-${Math.random()}`,
      }));
      const rest = replaceExisting
        ? lines.filter((l) => l.productId !== product.id)
        : lines;
      onChange([...rest, ...calculated]);
      return;
    }

    for (const b of product.bom) {
      addLine({
        itemCode: b.itemCode,
        itemName: b.itemName,
        unit: b.unit,
        qty: b.qtyPerUnit,
        productId: product.id,
        productName: product.name,
        lineName,
      });
    }
  }

  function qtyForBom(
    product: CatalogProduct,
    bomQtyPerUnit: number,
  ): number {
    if (!useScaling) return bomQtyPerUnit;
    return scaledMaterialQty(bomQtyPerUnit, scaledUnits, scaleYieldPct);
  }

  function addFromHit(hit: CatalogSearchHit) {
    if (hit.kind === "line") return;
    if (hit.kind === "product") {
      addProductBom(hit.product, hit.line.name);
      return;
    }
    addLine({
      itemCode: hit.bom.itemCode,
      itemName: hit.bom.itemName,
      unit: hit.bom.unit,
      qty: qtyForBom(hit.product, hit.bom.qtyPerUnit),
      productId: hit.product.id,
      productName: hit.product.name,
      lineName: hit.line.name,
    });
  }

  function removeLine(id: string) {
    onChange(lines.filter((l) => l.id !== id));
  }

  function updateQty(id: string, qty: number) {
    onChange(lines.map((l) => (l.id === id ? { ...l, qty } : l)));
  }

  return (
    <div className="space-y-4">
      {useScaling ? (
        <p className="rounded-md border border-scm-outline-variant/80 bg-scm-surface-container-low px-3 py-2 text-sm text-scm-on-surface-variant">
          {t("picker.scaleHint")
            .replace("{target}", scaledUnits.toLocaleString())
            .replace("{effective}", effectiveUnits.toLocaleString())
            .replace("{yield}", String(scaleYieldPct))}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("search")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            mode === "search"
              ? "bg-scm-secondary text-white"
              : "bg-scm-surface-container text-scm-on-surface-variant"
          }`}
        >
          {t("picker.modeSearch")}
        </button>
        <button
          type="button"
          onClick={() => setMode("product")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            mode === "product"
              ? "bg-scm-secondary text-white"
              : "bg-scm-surface-container text-scm-on-surface-variant"
          }`}
        >
          {t("picker.modeProduct")}
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-scm-outline-variant bg-scm-surface-lowest shadow-sm">
        <div className="space-y-3 border-b border-scm-outline-variant/60 p-3">
          {mode === "search" ? (
            <>
              <input
                className={inputClassName}
                placeholder={t("picker.searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {hits.length > 0 ? (
                <ul className="max-h-40 space-y-0.5 overflow-y-auto text-sm">
                  {hits.map((hit) => (
                    <li key={hitKey(hit)}>
                      <button
                        type="button"
                        className="w-full rounded px-2 py-1.5 text-left hover:bg-scm-surface-container"
                        onClick={() => addFromHit(hit)}
                        disabled={
                          hit.kind === "line" ||
                          (useScaling && hit.kind === "product" && !scaledUnits)
                        }
                      >
                        {hit.kind === "line" && (
                          <span>
                            [{t("picker.hitLine")}] {hit.line.name} ({hit.line.code})
                          </span>
                        )}
                        {hit.kind === "product" && (
                          <span>
                            [{t("picker.hitProduct")}] {hit.line.name} ·{" "}
                            {hit.product.name}{" "}
                            <span className="text-scm-on-surface-variant">
                              {hit.product.code} ·{" "}
                              {getCosmeticTypeLabel(locale, hit.product.cosmeticType)}
                            </span>
                          </span>
                        )}
                        {hit.kind === "material" && (
                          <span>
                            [{t("picker.hitMaterial")}] {hit.bom.itemCode}{" "}
                            {hit.bom.itemName}{" "}
                            <span className="text-scm-on-surface-variant">
                              ← {hit.product.name}
                            </span>
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : query ? (
                <p className="text-sm text-scm-on-surface-variant">
                  {t("picker.noHits")}
                </p>
              ) : null}
            </>
          ) : (
            <div className="space-y-2">
              <select
                className={inputClassName}
                value={pickProductId}
                onChange={(e) => setPickProductId(e.target.value)}
              >
                <option value="">{t("picker.selectProduct")}</option>
                {brandLines.map((line) => {
                  const lineProducts = products.filter((p) => p.lineId === line.id);
                  if (!lineProducts.length) return null;
                  return (
                    <optgroup key={line.id} label={line.name}>
                      {lineProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code})
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
              {selectedProduct ? (
                <div className="rounded-md border border-scm-outline-variant/80 bg-scm-surface-container-low p-3">
                  <div className="flex gap-3">
                    <ProductThumbnail
                      name={selectedProduct.name}
                      imageUrl={selectedProduct.imageUrl}
                      cosmeticType={selectedProduct.cosmeticType}
                    />
                    <div className="min-w-0 text-sm">
                      <p className="font-medium truncate">{selectedProduct.name}</p>
                      <p className="text-scm-on-surface-variant">
                        {getCosmeticTypeLabel(locale, selectedProduct.cosmeticType)} ·{" "}
                        {selectedProduct.code}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-sm">
                    {selectedProduct.bom.map((b) => {
                      const scaledQty = qtyForBom(selectedProduct, b.qtyPerUnit);
                      return (
                        <li key={b.id} className="flex justify-between gap-2">
                          <span className="min-w-0 truncate">
                            {b.itemCode} {b.itemName}
                            <span className="ml-1 text-xs text-scm-on-surface-variant">
                              {formatBomPercent(b.percent)} ·{" "}
                              {useScaling
                                ? `${scaledQty} ${b.unit}`
                                : formatBomQtyPerUnit(b)}
                            </span>
                          </span>
                          <button
                            type="button"
                            className="shrink-0 text-xs font-medium text-scm-link"
                            onClick={() => {
                              const line = brandLines.find(
                                (l) => l.id === selectedProduct.lineId,
                              );
                              addLine({
                                itemCode: b.itemCode,
                                itemName: b.itemName,
                                unit: b.unit,
                                qty: scaledQty,
                                productId: selectedProduct.id,
                                productName: selectedProduct.name,
                                lineName: line?.name,
                              });
                            }}
                          >
                            + {t("common.add")}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <Button
                    type="button"
                    size="sm"
                    className="mt-2"
                    variant="outline"
                    disabled={useScaling && scaledUnits <= 0}
                    onClick={() => {
                      const line = brandLines.find(
                        (l) => l.id === selectedProduct.lineId,
                      );
                      if (line) addProductBom(selectedProduct, line.name);
                    }}
                  >
                    {t("picker.addAllBom")}
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <MaterialLinesTable
          lines={lines}
          allowQtyEdit={allowQtyEdit}
          onChangeQty={updateQty}
          onRemove={removeLine}
        />
      </div>
    </div>
  );
}
