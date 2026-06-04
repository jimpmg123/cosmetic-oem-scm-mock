"use client";

import { MaterialIcon } from "@/components/ui/material-icon";
import {
  formatManufacturerLabel,
  type ManufacturingCompany,
} from "@/lib/mock/manufacturer-seed";
import { cn } from "@/lib/utils";

export function ManufacturerCard({
  company,
  lineCount,
  productCount,
  selected,
  lineLabel,
  productLabel,
  onSelect,
}: {
  company: ManufacturingCompany;
  lineCount: number;
  productCount: number;
  selected: boolean;
  lineLabel: string;
  productLabel: string;
  onSelect: () => void;
}) {
  const hasConcept = Boolean(company.concept?.trim());

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex min-h-[140px] flex-col rounded-lg border bg-scm-surface p-4 text-left",
        "transition-all duration-200 ease-out",
        selected
          ? "border-scm-secondary ring-2 ring-scm-secondary/30"
          : [
              "border-scm-outline-variant",
              "hover:-translate-y-0.5 hover:border-scm-secondary/70",
              "hover:bg-white hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)]",
              "active:translate-y-0 active:shadow-sm",
            ],
      )}
    >
      <div className="flex items-start gap-2">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-scm-surface-container-low text-scm-secondary",
            "transition-colors duration-200",
            !selected && "group-hover:bg-scm-secondary/10 group-hover:text-scm-secondary",
          )}
        >
          <MaterialIcon name="factory" className="text-[22px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-semibold leading-snug text-scm-primary transition-colors duration-200",
              !selected && "group-hover:text-scm-secondary",
            )}
          >
            {company.name}
          </p>
          <p className="text-xs text-scm-on-surface-variant">{company.chineseName}</p>
        </div>
      </div>
      {hasConcept ? (
        <p className="mt-2 line-clamp-2 text-xs text-scm-on-surface-variant">
          {company.concept}
        </p>
      ) : null}
      <p className="mt-auto pt-3 text-xs text-scm-on-surface-variant">
        {lineCount} {lineLabel} · {productCount} {productLabel}
      </p>
      <p className="sr-only">{formatManufacturerLabel(company)}</p>
    </button>
  );
}
