"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PageHeader, FormField, inputClassName } from "@/components/layout/page-parts";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/locale-provider";
import { useCatalogStore } from "@/components/providers/catalog-store-provider";
import { ProductThumbnail } from "@/components/catalog/product-thumbnail";
import { COSMETIC_TYPES, getCosmeticTypeLabel } from "@/lib/i18n/catalog-labels";
import {
  suggestProductCode,
  type CosmeticType,
  type ProductBomLine,
} from "@/lib/mock/product-catalog";

export default function NewCatalogProductPage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const { brandLines, products, addProduct } = useCatalogStore();

  const [lineId, setLineId] = useState(brandLines[0]?.id ?? "");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [autoCode, setAutoCode] = useState(true);
  const [cosmeticType, setCosmeticType] = useState<CosmeticType>("lotion");
  const [devDate, setDevDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [bom, setBom] = useState<Omit<ProductBomLine, "id">[]>([
    { itemCode: "", itemName: "", qtyPerUnit: 0, unit: "EA" },
  ]);

  const line = brandLines.find((l) => l.id === lineId);
  const suggested = useMemo(() => {
    if (!line || !autoCode) return "";
    return suggestProductCode(
      line.code,
      cosmeticType,
      products.map((p) => p.code),
    );
  }, [line, cosmeticType, autoCode, products]);

  function updateBom(idx: number, field: keyof ProductBomLine, value: string | number) {
    setBom((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
    );
  }

  function addBomRow() {
    setBom((prev) => [
      ...prev,
      { itemCode: "", itemName: "", qtyPerUnit: 0, unit: "EA" },
    ]);
  }

  function handleSubmit() {
    if (!lineId || !name.trim() || !devDate) return;
    const validBom = bom.filter((b) => b.itemCode.trim() && b.itemName.trim());
    const id = addProduct({
      lineId,
      name: name.trim(),
      code: autoCode ? undefined : code.trim(),
      cosmeticType,
      devDate,
      imageUrl: imageUrl.trim() || undefined,
      bom: validBom,
      autoCode,
    });
    router.push(`/operations/catalog/products/${id}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("catalog.productForm.newTitle")}
        description={t("catalog.productForm.desc")}
      />

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <div>
          <ProductThumbnail
            name={name || t("catalog.productForm.preview")}
            imageUrl={imageUrl}
            cosmeticType={cosmeticType}
            size="lg"
          />
          <div className="mt-3">
          <FormField label={t("catalog.productForm.imageUrl")}>
            <input
              className={inputClassName}
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </FormField>
          </div>
          <p className="mt-1 text-xs text-scm-on-surface-variant">
            {t("catalog.productForm.imageHint")}
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <FormField label={t("catalog.productForm.line")}>
              <select
                className={inputClassName}
                value={lineId}
                onChange={(e) => setLineId(e.target.value)}
              >
                {brandLines.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.code})
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={t("catalog.productForm.cosmeticType")}>
              <select
                className={inputClassName}
                value={cosmeticType}
                onChange={(e) => setCosmeticType(e.target.value as CosmeticType)}
              >
                {COSMETIC_TYPES.map((ct) => (
                  <option key={ct} value={ct}>
                    {getCosmeticTypeLabel(locale, ct)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={t("catalog.productForm.name")}>
              <input
                className={inputClassName}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormField>
            <FormField label={t("catalog.productForm.devDate")}>
              <input
                type="date"
                className={inputClassName}
                value={devDate}
                onChange={(e) => setDevDate(e.target.value)}
              />
            </FormField>
          </div>

          <div className="rounded-lg border border-scm-outline-variant p-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoCode}
                onChange={(e) => setAutoCode(e.target.checked)}
              />
              {t("catalog.productForm.autoCode")}
            </label>
            {autoCode ? (
              <p className="mt-2 font-mono text-sm text-scm-secondary">{suggested}</p>
            ) : (
              <input
                className={`${inputClassName} mt-2`}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="PUMA-LOT-02"
              />
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-scm-primary">
              {t("catalog.productForm.bom")}
            </h3>
            {bom.map((row, idx) => (
              <div
                key={idx}
                className="mt-2 grid gap-2 border-t border-scm-outline-variant/50 pt-2 md:grid-cols-4"
              >
                <input
                  className={inputClassName}
                  placeholder={t("catalog.productForm.itemCode")}
                  value={row.itemCode}
                  onChange={(e) => updateBom(idx, "itemCode", e.target.value)}
                />
                <input
                  className={inputClassName}
                  placeholder={t("catalog.productForm.itemName")}
                  value={row.itemName}
                  onChange={(e) => updateBom(idx, "itemName", e.target.value)}
                />
                <input
                  type="number"
                  step="any"
                  className={inputClassName}
                  placeholder={t("catalog.productForm.qtyPerUnit")}
                  value={row.qtyPerUnit || ""}
                  onChange={(e) =>
                    updateBom(idx, "qtyPerUnit", Number(e.target.value) || 0)
                  }
                />
                <input
                  className={inputClassName}
                  value={row.unit}
                  onChange={(e) => updateBom(idx, "unit", e.target.value)}
                />
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addBomRow}>
              {t("catalog.productForm.addBomRow")}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button type="button" onClick={handleSubmit}>
              {t("common.save")}
            </Button>
            <Link href="/operations/catalog">
              <Button type="button" variant="ghost">
                {t("common.cancel")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
