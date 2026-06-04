"use client";

import { useMemo } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { useCatalogStore } from "@/components/providers/catalog-store-provider";
import {
  buildMaterialScopeIndex,
  formatProductLineLabel,
} from "@/lib/catalog/material-scope";
import type { MaterialRequestLine } from "@/lib/mock/product-catalog";

export function MaterialLinesTable({
  lines,
  onChangeQty,
  onRemove,
  allowQtyEdit = true,
  compact = true,
}: {
  lines: MaterialRequestLine[];
  onChangeQty?: (id: string, qty: number) => void;
  onRemove?: (id: string) => void;
  allowQtyEdit?: boolean;
  compact?: boolean;
}) {
  const { t } = useLocale();
  const { brandLines, products } = useCatalogStore();

  const scopeIndex = useMemo(
    () => buildMaterialScopeIndex(products, brandLines),
    [products, brandLines],
  );

  if (lines.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-scm-on-surface-variant">
        {t("picker.empty")}
      </p>
    );
  }

  const cell = compact ? "px-2 py-1.5" : "px-3 py-2";

  return (
    <div className="overflow-x-auto">
      <table
        className={`w-full text-sm ${compact ? "table-fixed" : ""}`}
        style={compact ? { minWidth: 520 } : undefined}
      >
        <thead>
          <tr className="border-b border-scm-outline-variant bg-scm-surface-container-low/80 text-left text-xs font-medium text-scm-on-surface-variant">
            <th className={`${cell} w-[42%]`}>{t("picker.colMaterial")}</th>
            <th className={`${cell} w-[22%]`}>{t("picker.colProductLine")}</th>
            <th className={`${cell} w-[28%] text-right`}>{t("picker.colQty")}</th>
            {onRemove ? <th className={`${cell} w-12`} /> : null}
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => (
            <tr
              key={l.id}
              className="border-b border-scm-outline-variant/40 last:border-0"
            >
              <td className={cell}>
                <span className="block font-mono text-[11px] leading-tight text-scm-on-surface-variant">
                  {l.itemCode}
                </span>
                <span className="block truncate text-scm-primary">{l.itemName}</span>
              </td>
              <td className={`${cell} truncate text-scm-on-surface-variant`}>
                {formatProductLineLabel(l.itemCode, l.productName, scopeIndex)}
              </td>
              <td className={`${cell} text-right`}>
                {allowQtyEdit && onChangeQty ? (
                  <div className="inline-flex items-center justify-end gap-1.5">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      className="w-[5.5rem] rounded border border-scm-outline-variant px-2 py-1 text-right text-sm tabular-nums"
                      value={l.qty}
                      onChange={(e) =>
                        onChangeQty(l.id, Number(e.target.value) || 0)
                      }
                    />
                    <span className="shrink-0 text-xs text-scm-on-surface-variant">
                      {l.unit}
                    </span>
                  </div>
                ) : (
                  <span className="tabular-nums">
                    {l.qty.toLocaleString()}{" "}
                    <span className="text-xs text-scm-on-surface-variant">
                      {l.unit}
                    </span>
                  </span>
                )}
              </td>
              {onRemove ? (
                <td className={`${cell} text-right`}>
                  <button
                    type="button"
                    className="text-xs font-medium text-scm-error hover:underline"
                    onClick={() => onRemove(l.id)}
                  >
                    {t("common.delete")}
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
