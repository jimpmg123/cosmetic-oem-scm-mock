"use client";

import { FormField, inputClassName } from "@/components/layout/page-parts";
import { useLocale } from "@/components/providers/locale-provider";
import {
  formatManufacturerLabel,
  type ManufacturingCompany,
} from "@/lib/mock/manufacturer-seed";

export function ManufacturerSelect({
  manufacturers,
  value,
  onChange,
  label,
  required,
  hint,
}: {
  manufacturers: ManufacturingCompany[];
  value: string;
  onChange: (manufacturerId: string) => void;
  label?: string;
  required?: boolean;
  hint?: string;
}) {
  const { t } = useLocale();

  return (
    <FormField label={label ?? t("mfr.select.label")}>
      <select
        className={inputClassName}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{t("mfr.select.placeholder")}</option>
        {manufacturers.map((m) => (
          <option key={m.id} value={m.id}>
            {formatManufacturerLabel(m)}
          </option>
        ))}
      </select>
      {hint ? (
        <p className="mt-1 text-xs text-scm-on-surface-variant">{hint}</p>
      ) : null}
    </FormField>
  );
}
