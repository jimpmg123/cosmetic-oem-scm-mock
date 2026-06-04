"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { type BundleStatus } from "@/lib/mock/material-bundles";
import { cn } from "@/lib/utils";

const STYLES: Record<BundleStatus, string> = {
  planned: "bg-scm-planned-bg text-scm-planned-text border-scm-outline-variant",
  active: "bg-scm-success-bg text-scm-success-text border-scm-success-border",
  depleted: "bg-scm-warning-bg text-scm-warning-text border-scm-warning-border",
  closed: "bg-blue-50 text-blue-800 border-blue-200",
};

export function BundleStatusBadge({ status }: { status: BundleStatus }) {
  const { t } = useLocale();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STYLES[status],
      )}
    >
      {t(`bundle.status.${status}`)}
    </span>
  );
}
