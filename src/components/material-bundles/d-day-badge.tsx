"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { formatDdayLabel } from "@/lib/i18n/format-locale";
import { getDday } from "@/lib/mock/material-bundles";
import { cn } from "@/lib/utils";

export function DDayBadge({
  useByDate,
  className,
}: {
  useByDate: string;
  className?: string;
}) {
  const { locale, t } = useLocale();
  const dday = getDday(useByDate);

  if (dday > 7) return null;

  let style: string;

  if (dday < 0) {
    style = "bg-red-50 text-red-700 border-red-200";
  } else if (dday === 0) {
    style = "bg-scm-warning-bg text-scm-warning-text border-scm-warning-border";
  } else {
    style = "bg-scm-warning-bg text-scm-warning-text border-scm-warning-border";
  }

  const label = formatDdayLabel(locale, dday, t);

  return (
    <span
      className={cn(
        "ml-1.5 inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
        style,
        className,
      )}
    >
      {label}
    </span>
  );
}
