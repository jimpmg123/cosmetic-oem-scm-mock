"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/page-parts";
import { useLocale } from "@/components/providers/locale-provider";

export function OpsMockPage({
  titleKey,
  descKey,
  specPath,
  related,
}: {
  titleKey: string;
  descKey: string;
  specPath?: string;
  related?: { href: string; labelKey: string }[];
}) {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <PageHeader title={t(titleKey)} description={t(descKey)} />
      <div className="rounded-lg border border-dashed border-scm-outline-variant bg-scm-surface-container-low px-6 py-10 text-center">
        <p className="text-sm font-medium text-scm-primary">UI Mock — 구조 확정용</p>
        <p className="mt-2 text-sm text-scm-on-surface-variant">
          {specPath ? `Spec: docs/pages/${specPath}` : null}
        </p>
      </div>
      {related && related.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {related.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="text-sm font-medium text-scm-link hover:underline"
            >
              {t(r.labelKey)} →
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
