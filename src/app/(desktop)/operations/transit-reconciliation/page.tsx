"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLocale } from "@/components/providers/locale-provider";
import { useMockStore } from "@/components/providers/mock-store-provider";
import { INITIAL_MATERIAL_SHIPMENTS } from "@/lib/mock/material-shipment-lines";

export default function TransitReconciliationPage() {
  const { t } = useLocale();
  const { materialBundles, getMaterialReceipt } = useMockStore();

  const rows = useMemo(() => {
    return materialBundles.map((b) => {
      const ships = INITIAL_MATERIAL_SHIPMENTS.filter((s) => s.bundleId === b.id);
      const lineCount = ships.reduce((n, s) => n + s.lines.length, 0);
      const partial = ships.some((s) => s.status === "partial");
      const receipt = getMaterialReceipt(b.id);
      const aShipped =
        receipt?.aShippedQty ?? b.materialShipQty ?? lineCount;
      const bConfirmed = receipt?.bConfirmedQty;
      const gap =
        bConfirmed != null && aShipped != null ? aShipped - bConfirmed : null;

      return {
        bundle: b,
        ships,
        partial,
        receipt,
        aShipped,
        bConfirmed,
        gap,
        lineCount,
      };
    });
  }, [materialBundles, getMaterialReceipt]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-scm-primary">
          {t("transit.title")}
        </h1>
        <p className="mt-1 text-sm text-scm-on-surface-variant">{t("transit.desc")}</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-scm-outline-variant">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-scm-surface-container-low text-left text-scm-on-surface-variant">
            <tr>
              <th className="px-3 py-2">{t("bundle.col.number")}</th>
              <th className="px-3 py-2">{t("transit.shipments")}</th>
              <th className="px-3 py-2">{t("receipt.aShipped")}</th>
              <th className="px-3 py-2">{t("receipt.bConfirmed")}</th>
              <th className="px-3 py-2">{t("receipt.gap")}</th>
              <th className="px-3 py-2">{t("transit.partial")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ bundle, ships, partial, aShipped, bConfirmed, gap }) => (
              <tr
                key={bundle.id}
                className="border-t border-scm-outline-variant/60"
              >
                <td className="px-3 py-2">
                  <Link
                    href={`/operations/material-bundles/${bundle.id}`}
                    className="font-medium text-scm-link hover:underline"
                  >
                    {bundle.number}
                  </Link>
                  <p className="text-xs text-scm-on-surface-variant">{bundle.sku}</p>
                </td>
                <td className="px-3 py-2">
                  {ships.length === 0 ? (
                    "—"
                  ) : (
                    <ul className="space-y-0.5">
                      {ships.map((s) => (
                        <li key={s.id} className="text-xs">
                          {s.number} ({s.lines.length} {t("transit.lines")})
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className="px-3 py-2">{aShipped?.toLocaleString() ?? "—"}</td>
                <td className="px-3 py-2">
                  {bConfirmed != null ? bConfirmed.toLocaleString() : t("receipt.status.pending")}
                </td>
                <td className="px-3 py-2">
                  {gap != null && gap !== 0 ? (
                    <span className="font-medium text-scm-error">{gap}</span>
                  ) : gap === 0 ? (
                    "0"
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-2">
                  {partial ? t("transit.partialYes") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-scm-on-surface-variant">{t("transit.footnote")}</p>
    </div>
  );
}
