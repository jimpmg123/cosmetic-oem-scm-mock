"use client";

import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useLocale } from "@/components/providers/locale-provider";

export default function OperatingStructure2Page() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-scm-primary">
          {t("structure2.title")}
        </h1>
        <p className="mt-1 text-sm text-scm-on-surface-variant">
          {t("structure2.desc")}
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-scm-outline-variant bg-scm-surface-container-low p-6 text-sm text-scm-on-surface-variant">
        <MaterialIcon
          name="alt_route"
          className="mt-0.5 shrink-0 text-[22px] text-scm-secondary"
        />
        <p>{t("structure2.note")}</p>
      </div>

      <Link
        href="/operations/yield-overview"
        className="inline-flex items-center gap-1 text-sm font-medium text-scm-link hover:underline"
      >
        <MaterialIcon name="swap_horiz" className="text-[18px]" />
        {t("structure2.back")}
      </Link>
    </div>
  );
}
