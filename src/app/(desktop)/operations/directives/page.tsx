"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { useMockStore } from "@/components/providers/mock-store-provider";

export default function DirectivesListPage() {
  const { t } = useLocale();
  const { directives, materialBundles } = useMockStore();

  const rows = useMemo(
    () =>
      [...directives]
        .map((d) => ({
          d,
          bundle: materialBundles.find((b) => b.id === d.bundleId),
        }))
        .sort((a, b) => b.d.dueDate.localeCompare(a.d.dueDate)),
    [directives, materialBundles],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-scm-primary">
          {t("directivesList.title")}
        </h1>
        <p className="mt-1 text-sm text-scm-on-surface-variant">
          {t("directivesList.desc")}
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-scm-outline-variant">
        <table className="w-full text-sm">
          <thead className="bg-scm-surface-container-low text-left text-scm-on-surface-variant">
            <tr>
              <th className="px-3 py-2">{t("bundle.col.number")}</th>
              <th className="px-3 py-2">{t("directivesList.period")}</th>
              <th className="px-3 py-2">{t("bundle.col.target")}</th>
              <th className="px-3 py-2">{t("directivesList.status")}</th>
              <th className="px-3 py-2">{t("directivesList.comment")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ d, bundle }) => (
              <tr
                key={d.id}
                className="border-t border-scm-outline-variant/60"
              >
                <td className="px-3 py-2">
                  {bundle ? (
                    <Link
                      href={`/operations/material-bundles/${bundle.id}`}
                      className="text-scm-link hover:underline"
                    >
                      {bundle.number}
                    </Link>
                  ) : (
                    d.bundleId
                  )}
                </td>
                <td className="px-3 py-2">
                  {(d.issuedAt ?? "—").slice(0, 10)} ~ {d.dueDate}
                </td>
                <td className="px-3 py-2">{d.targetQty.toLocaleString()}</td>
                <td className="px-3 py-2">{d.status}</td>
                <td className="max-w-xs truncate px-3 py-2 text-scm-on-surface-variant">
                  {d.comment ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
