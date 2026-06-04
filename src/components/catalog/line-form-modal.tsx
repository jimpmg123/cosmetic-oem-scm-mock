"use client";

import { useEffect, useState } from "react";
import { FormField, inputClassName } from "@/components/layout/page-parts";
import { Button } from "@/components/ui/button";
import { LineThumbnail } from "@/components/catalog/line-thumbnail";
import { ManufacturerSelect } from "@/components/catalog/manufacturer-select";
import { useLocale } from "@/components/providers/locale-provider";
import { useCatalogStore } from "@/components/providers/catalog-store-provider";
import type { BrandLine } from "@/lib/mock/product-catalog";

function nowForDatetimeLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function isoFromDatetimeLocal(value: string): string {
  if (!value) return new Date().toISOString();
  return new Date(value).toISOString();
}

function datetimeLocalFromIso(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return nowForDatetimeLocal();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export type LineFormValues = {
  code: string;
  name: string;
  description?: string;
  imageUrl?: string;
  placedAt: string;
  manufacturerId: string;
};

export function LineFormModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "add" | "edit";
  initial?: BrandLine;
  onClose: () => void;
  onSubmit: (values: LineFormValues) => void;
}) {
  const { t } = useLocale();
  const { manufacturers } = useCatalogStore();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [placedAt, setPlacedAt] = useState(nowForDatetimeLocal());
  const [manufacturerId, setManufacturerId] = useState(manufacturers[0]?.id ?? "");

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initial) {
      setCode(initial.code);
      setName(initial.name);
      setDesc(initial.description ?? "");
      setImageUrl(initial.imageUrl ?? "");
      setPlacedAt(datetimeLocalFromIso(initial.placedAt));
      setManufacturerId(initial.manufacturerId);
    } else {
      setCode("");
      setName("");
      setDesc("");
      setImageUrl("");
      setPlacedAt(nowForDatetimeLocal());
      setManufacturerId(manufacturers[0]?.id ?? "");
    }
  }, [open, mode, initial, manufacturers]);

  if (!open) return null;

  function handleSubmit() {
    if (!code.trim() || !name.trim() || !manufacturerId) return;
    onSubmit({
      code: code.trim(),
      name: name.trim(),
      description: desc.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      placedAt: isoFromDatetimeLocal(placedAt),
      manufacturerId,
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-scm-outline-variant bg-scm-surface p-5 shadow-lg">
        <h2 className="text-lg font-semibold text-scm-primary">
          {mode === "add" ? t("catalog.lines.add") : t("common.edit")}
        </h2>

        <div className="mt-4 space-y-4">
          <FormField label={t("catalog.lines.imageUrl")}>
            <LineThumbnail
              name={name || t("catalog.lines.title")}
              imageUrl={imageUrl}
              variant="brand"
              className="mb-2"
            />
            <input
              className={inputClassName}
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://"
            />
          </FormField>
          <ManufacturerSelect
            manufacturers={manufacturers}
            value={manufacturerId}
            onChange={setManufacturerId}
            required
          />
          <FormField label={t("catalog.lines.code")}>
            <input
              className={inputClassName}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </FormField>
          <FormField label={t("catalog.lines.name")}>
            <input
              className={inputClassName}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>
          <FormField label={t("catalog.lines.description")}>
            <input
              className={inputClassName}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </FormField>
          <FormField label={t("catalog.lines.placedAt")}>
            <input
              type="datetime-local"
              className={inputClassName}
              value={placedAt}
              onChange={(e) => setPlacedAt(e.target.value)}
            />
          </FormField>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {mode === "add" ? t("common.add") : t("common.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
