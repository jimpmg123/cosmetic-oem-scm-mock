"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-parts";
import { useLocale } from "@/components/providers/locale-provider";
import { useCatalogStore } from "@/components/providers/catalog-store-provider";
import { useAAdminPolicy } from "@/components/providers/a-admin-policy-provider";
import { useRole } from "@/components/providers/role-provider";
import { canApproveMaterialRequest } from "@/lib/a-admin-permissions";
import type { MaterialRequestType } from "@/lib/mock/product-catalog";

const TYPE_LABEL: Record<MaterialRequestType, string> = {
  a_push: "req.type.aPush",
  b_production: "req.type.bProduction",
  b_spot: "req.type.bSpot",
};

export default function MaterialRequestsInboxPage() {
  const { t } = useLocale();
  const { role } = useRole();
  const { policy } = useAAdminPolicy();
  const { materialRequests, updateRequestStatus } = useCatalogStore();
  const [filter, setFilter] = useState<MaterialRequestType | "all">("all");

  const rows = useMemo(() => {
    const list = [...materialRequests].sort(
      (a, b) => b.createdAt.localeCompare(a.createdAt),
    );
    if (filter === "all") return list;
    return list.filter((r) => r.type === filter);
  }, [materialRequests, filter]);

  const spotOnly = materialRequests.filter((r) => r.type === "b_spot");

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("req.inbox.title")}
        description={t("req.inbox.desc")}
        actions={
          <Link
            href="/operations/material-push"
            className="text-sm font-medium text-scm-link hover:underline"
          >
            {t("req.push.title")} →
          </Link>
        }
      />

      <div className="rounded-lg border border-scm-outline-variant bg-scm-surface-container-low p-4">
        <p className="text-sm font-medium text-scm-primary">{t("req.inbox.spotHighlight")}</p>
        <p className="mt-1 text-sm text-scm-on-surface-variant">
          {t("req.inbox.spotCount")} {spotOnly.length}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "a_push", "b_production", "b_spot"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1.5 text-sm ${
              filter === f
                ? "bg-scm-secondary text-white"
                : "bg-scm-surface-container text-scm-on-surface-variant"
            }`}
          >
            {f === "all" ? t("req.filter.all") : t(TYPE_LABEL[f])}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-scm-outline-variant">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-scm-surface-container-low text-left text-scm-on-surface-variant">
            <tr>
              <th className="px-3 py-2">{t("req.col.number")}</th>
              <th className="px-3 py-2">{t("req.col.type")}</th>
              <th className="px-3 py-2">{t("req.col.manufacturer")}</th>
              <th className="px-3 py-2">{t("req.col.status")}</th>
              <th className="px-3 py-2">{t("req.col.summary")}</th>
              <th className="px-3 py-2">{t("req.col.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-scm-outline-variant/60">
                <td className="px-3 py-2 font-mono text-xs">{r.number}</td>
                <td className="px-3 py-2">{t(TYPE_LABEL[r.type])}</td>
                <td className="px-3 py-2 text-scm-on-surface-variant">
                  {r.manufacturerName}
                </td>
                <td className="px-3 py-2">{r.status}</td>
                <td className="max-w-md px-3 py-2">
                  {r.type === "a_push" && r.notifyMessage ? (
                    <span>{r.notifyMessage}</span>
                  ) : null}
                  {r.type === "b_spot" && r.comment ? (
                    <span className="text-amber-800 dark:text-amber-200">{r.comment}</span>
                  ) : null}
                  {r.type === "b_production" && r.productionItems?.length ? (
                    <span>
                      {r.productionItems
                        .map((p) => `${p.productName} ×${p.qty}`)
                        .join(", ")}
                    </span>
                  ) : null}
                  <p className="text-xs text-scm-on-surface-variant">
                    {r.lines.length} {t("req.col.lines")}
                  </p>
                </td>
                <td className="px-3 py-2">
                  {r.status === "submitted" && r.type !== "a_push" ? (
                    canApproveMaterialRequest(role, r, policy) ? (
                      <button
                        type="button"
                        className="text-scm-link text-xs font-medium"
                        onClick={() => updateRequestStatus(r.id, "approved")}
                      >
                        {t("req.action.approve")}
                      </button>
                    ) : (
                      <span className="text-xs text-scm-on-surface-variant">
                        {t("req.inbox.superOnly")}
                      </span>
                    )
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filter === "b_spot" || filter === "all" ? (
        <details className="text-sm">
          <summary className="cursor-pointer font-medium text-scm-primary">
            {t("req.inbox.spotDetailTitle")}
          </summary>
          <ul className="mt-2 space-y-3">
            {spotOnly.map((r) => (
              <li
                key={r.id}
                className="rounded-lg border border-scm-outline-variant p-3"
              >
                <p className="font-mono text-xs">{r.number}</p>
                <p className="text-xs text-scm-secondary">{r.manufacturerName}</p>
                <p className="mt-1">{r.comment}</p>
                <ul className="mt-2 text-scm-on-surface-variant">
                  {r.lines.map((l) => (
                    <li key={l.id}>
                      {l.itemCode} {l.itemName}: {l.qty} {l.unit}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
