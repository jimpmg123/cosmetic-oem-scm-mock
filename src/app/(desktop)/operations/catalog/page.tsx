"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader, inputClassName } from "@/components/layout/page-parts";
import { useLocale } from "@/components/providers/locale-provider";
import { useCatalogStore } from "@/components/providers/catalog-store-provider";
import { LineThumbnail } from "@/components/catalog/line-thumbnail";
import { ManufacturerCard } from "@/components/catalog/manufacturer-card";
import { ProductThumbnail } from "@/components/catalog/product-thumbnail";
import { LineFormModal, type LineFormValues } from "@/components/catalog/line-form-modal";
import { MaterialIcon } from "@/components/ui/material-icon";
import { formatVolumeAmount } from "@/lib/catalog/format-volume";
import { getManufacturerById } from "@/lib/mock/manufacturer-seed";
import { getCosmeticTypeLabel } from "@/lib/i18n/catalog-labels";
import type { BrandLine, CosmeticType } from "@/lib/mock/product-catalog";
import { cn } from "@/lib/utils";

const catalogCardInteractive = cn(
  "transition-all duration-200 ease-out",
  "hover:-translate-y-0.5 hover:border-scm-secondary/70 hover:bg-white hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)]",
  "active:translate-y-0 active:shadow-sm",
);

function formatPlacedAt(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleString(locale === "zh" ? "zh-CN" : locale === "en" ? "en-US" : "ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function LineCard({
  line,
  productCount,
  selected,
  countLabel,
  onSelect,
  onEdit,
  showManufacturer,
  manufacturerLabel,
}: {
  line: BrandLine;
  productCount: number;
  selected: boolean;
  countLabel: string;
  showManufacturer?: boolean;
  manufacturerLabel?: string;
  onSelect: () => void;
  onEdit: () => void;
}) {
  const hasName = Boolean(line.name?.trim());
  const hasCode = Boolean(line.code?.trim());
  const hasDesc = Boolean(line.description?.trim());
  const hasMfr = showManufacturer && Boolean(manufacturerLabel?.trim());

  return (
    <div
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border bg-scm-surface text-left",
        "transition-all duration-200 ease-out",
        selected
          ? "border-scm-secondary ring-2 ring-scm-secondary/30"
          : ["border-scm-outline-variant", catalogCardInteractive],
      )}
    >
      <button type="button" className="flex flex-1 flex-col text-left" onClick={onSelect}>
        <LineThumbnail
          name={line.name || line.code}
          imageUrl={line.imageUrl}
          variant="brand"
        />
        <div className="flex flex-1 flex-col p-3">
          {hasName ? (
            <p
              className={cn(
                "font-semibold text-scm-primary transition-colors duration-200",
                !selected && "group-hover:text-scm-secondary",
              )}
            >
              {line.name}
            </p>
          ) : null}
          {hasCode ? (
            <p className="font-mono text-xs text-scm-on-surface-variant">{line.code}</p>
          ) : null}
          {hasDesc ? (
            <p className="mt-1 line-clamp-2 text-xs text-scm-on-surface-variant">
              {line.description}
            </p>
          ) : null}
          {hasMfr ? (
            <p className="mt-1 text-xs text-scm-secondary">{manufacturerLabel}</p>
          ) : null}
          <p className="mt-auto pt-2 text-xs text-scm-on-surface-variant">
            {productCount} {countLabel}
          </p>
        </div>
      </button>
      <button
        type="button"
        className="absolute right-2.5 top-2.5 rounded-md bg-scm-surface/90 p-1.5 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        title="edit"
      >
        <MaterialIcon name="edit" className="text-[18px] text-scm-on-surface-variant" />
      </button>
    </div>
  );
}

export default function CatalogPage() {
  const { t, locale } = useLocale();
  const { manufacturers, brandLines, products, addBrandLine, updateBrandLine } =
    useCatalogStore();
  const [companiesOpen, setCompaniesOpen] = useState(true);
  const [selectedManufacturerId, setSelectedManufacturerId] = useState<string | null>(
    null,
  );
  const [linesOpen, setLinesOpen] = useState(true);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [lineModal, setLineModal] = useState<"add" | "edit" | null>(null);
  const [editingLine, setEditingLine] = useState<BrandLine | undefined>();
  const [productSearch, setProductSearch] = useState("");

  const hubDesc = t("catalog.hub.desc");

  const visibleLines = useMemo(() => {
    if (!selectedManufacturerId) return brandLines;
    return brandLines.filter((l) => l.manufacturerId === selectedManufacturerId);
  }, [brandLines, selectedManufacturerId]);

  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedManufacturerId) {
      const lineIds = new Set(
        brandLines
          .filter((l) => l.manufacturerId === selectedManufacturerId)
          .map((l) => l.id),
      );
      list = list.filter((p) => lineIds.has(p.lineId));
    }
    if (selectedLineId) {
      list = list.filter((p) => p.lineId === selectedLineId);
    }
    const q = productSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => {
      const line = brandLines.find((l) => l.id === p.lineId);
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        getCosmeticTypeLabel(locale, p.cosmeticType).toLowerCase().includes(q) ||
        (line?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [
    products,
    selectedManufacturerId,
    selectedLineId,
    productSearch,
    brandLines,
    locale,
  ]);

  const selectedManufacturer = getManufacturerById(
    manufacturers,
    selectedManufacturerId ?? undefined,
  );
  const selectedLine = brandLines.find((l) => l.id === selectedLineId);

  function selectManufacturer(id: string) {
    setSelectedManufacturerId((prev) => {
      const next = prev === id ? null : id;
      if (next && selectedLineId) {
        const line = brandLines.find((l) => l.id === selectedLineId);
        if (line?.manufacturerId !== next) setSelectedLineId(null);
      }
      if (!next) setSelectedLineId(null);
      return next;
    });
  }

  function clearCompanyFilter() {
    setSelectedManufacturerId(null);
    setSelectedLineId(null);
  }

  function handleLineSubmit(values: LineFormValues) {
    if (lineModal === "edit" && editingLine) {
      updateBrandLine(editingLine.id, values);
    } else {
      const id = addBrandLine(values);
      setSelectedLineId(id);
      setSelectedManufacturerId(values.manufacturerId);
    }
    setLineModal(null);
    setEditingLine(undefined);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("catalog.hub.title")}
        description={hubDesc.trim() ? hubDesc : undefined}
      />

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <h2 className="text-sm font-semibold text-scm-primary">
              {t("catalog.companies.title")}
            </h2>
            <button
              type="button"
              className="rounded-md p-1 text-scm-on-surface-variant hover:bg-scm-surface-container-low"
              onClick={() => setCompaniesOpen((o) => !o)}
              aria-expanded={companiesOpen}
              aria-label={
                companiesOpen
                  ? t("catalog.companies.collapse")
                  : t("catalog.companies.expand")
              }
            >
              <MaterialIcon
                name={companiesOpen ? "expand_less" : "expand_more"}
                className="text-[22px]"
              />
            </button>
          </div>
          {selectedManufacturerId ? (
            <button
              type="button"
              className="text-sm text-scm-link hover:underline"
              onClick={clearCompanyFilter}
            >
              {t("catalog.filter.clearCompany")}
            </button>
          ) : null}
        </div>

        {companiesOpen ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {manufacturers.map((m) => {
              const mLines = brandLines.filter((l) => l.manufacturerId === m.id);
              const mProducts = products.filter((p) =>
                mLines.some((l) => l.id === p.lineId),
              );
              return (
                <ManufacturerCard
                  key={m.id}
                  company={m}
                  lineCount={mLines.length}
                  productCount={mProducts.length}
                  selected={selectedManufacturerId === m.id}
                  lineLabel={t("catalog.companies.linesShort")}
                  productLabel={t("catalog.products.countShort")}
                  onSelect={() => selectManufacturer(m.id)}
                />
              );
            })}
          </div>
        ) : null}
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <h2 className="text-sm font-semibold text-scm-primary">
              {t("catalog.lines.title")}
            </h2>
            <button
              type="button"
              className="rounded-md p-1 text-scm-on-surface-variant hover:bg-scm-surface-container-low"
              onClick={() => setLinesOpen((o) => !o)}
              aria-expanded={linesOpen}
              aria-label={linesOpen ? t("catalog.lines.collapse") : t("catalog.lines.expand")}
            >
              <MaterialIcon
                name={linesOpen ? "expand_less" : "expand_more"}
                className="text-[22px]"
              />
            </button>
          </div>
          {selectedLineId ? (
            <button
              type="button"
              className="text-sm text-scm-link hover:underline"
              onClick={() => setSelectedLineId(null)}
            >
              {t("catalog.filter.clearLine")}
            </button>
          ) : null}
        </div>

        {selectedManufacturer ? (
          <p className="mb-3 text-sm text-scm-on-surface-variant">
            {t("catalog.filter.byCompany")}: {selectedManufacturer.name}
            {!selectedLineId ? (
              <span className="ml-2 text-xs">({t("catalog.filter.allLines")})</span>
            ) : null}
          </p>
        ) : null}

        {linesOpen ? (
          visibleLines.length === 0 ? (
            <p className="text-sm text-scm-on-surface-variant">{t("common.empty")}</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              <button
                type="button"
                onClick={() => {
                  setEditingLine(undefined);
                  setLineModal("add");
                }}
                className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-scm-outline-variant bg-scm-surface-container-low text-scm-on-surface-variant transition-colors hover:border-scm-secondary hover:text-scm-secondary"
              >
                <MaterialIcon name="add" className="text-[32px]" />
                <span className="mt-2 text-xs font-medium">{t("catalog.lines.add")}</span>
              </button>

              {visibleLines.map((line) => (
                <LineCard
                  key={line.id}
                  line={line}
                  showManufacturer={!selectedManufacturerId}
                  manufacturerLabel={
                    getManufacturerById(manufacturers, line.manufacturerId)?.name
                  }
                  productCount={products.filter((p) => p.lineId === line.id).length}
                  selected={selectedLineId === line.id}
                  countLabel={t("catalog.products.countShort")}
                  onSelect={() =>
                    setSelectedLineId((prev) => (prev === line.id ? null : line.id))
                  }
                  onEdit={() => {
                    setEditingLine(line);
                    setLineModal("edit");
                  }}
                />
              ))}
            </div>
          )
        ) : null}
      </section>

      <section>
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-scm-primary">
              {t("catalog.products.title")}
            </h2>
            {selectedLine ? (
              <p className="mt-1 text-sm text-scm-on-surface-variant">
                {t("catalog.filter.byLine")}: {selectedLine.name}
                {selectedLine.placedAt ? (
                  <span className="ml-2 text-xs">
                    ({formatPlacedAt(selectedLine.placedAt, locale)})
                  </span>
                ) : null}
              </p>
            ) : selectedManufacturer ? (
              <p className="mt-1 text-sm text-scm-on-surface-variant">
                {t("catalog.filter.byCompany")}: {selectedManufacturer.name}
              </p>
            ) : (
              <p className="mt-1 text-sm text-scm-on-surface-variant">
                {t("catalog.filter.allProducts")}
              </p>
            )}
          </div>
          <input
            className={cn(inputClassName, "w-full sm:max-w-xs")}
            placeholder={t("catalog.products.search")}
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Link
            href="/operations/catalog/products/new"
            className={cn(
              "group flex h-24 flex-col items-center justify-center rounded-lg border-2 border-dashed",
              "border-scm-outline-variant bg-scm-surface-container-low text-scm-on-surface-variant",
              catalogCardInteractive,
              "hover:text-scm-secondary",
            )}
          >
            <MaterialIcon
              name="add"
              className="text-[28px] transition-transform duration-200 group-hover:scale-110"
            />
            <span className="mt-1 text-xs font-medium">{t("catalog.products.new")}</span>
          </Link>

          {filteredProducts.map((p) => {
            const line = brandLines.find((l) => l.id === p.lineId);
            return (
              <Link
                key={p.id}
                href={`/operations/catalog/products/${p.id}`}
                className={cn(
                  "group flex h-24 items-center gap-3 rounded-lg border border-scm-outline-variant bg-scm-surface p-4",
                  catalogCardInteractive,
                )}
              >
                <ProductThumbnail
                  name={p.name}
                  imageUrl={p.imageUrl}
                  cosmeticType={p.cosmeticType}
                  className="shrink-0 transition-transform duration-200 group-hover:scale-[1.03]"
                />
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="truncate font-semibold text-scm-primary transition-colors duration-200 group-hover:text-scm-secondary">
                    {p.name}
                  </p>
                  {!selectedLineId && line?.name ? (
                    <p className="truncate text-xs text-scm-secondary">{line.name}</p>
                  ) : null}
                  <p className="truncate text-xs text-scm-on-surface-variant">
                    {getCosmeticTypeLabel(locale, p.cosmeticType)} · {p.code}
                    {p.productVolume ? (
                      <span className="ml-1">
                        · {formatVolumeAmount(p.productVolume)}
                      </span>
                    ) : null}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredProducts.length === 0 ? (
          <p className="mt-3 text-sm text-scm-on-surface-variant">
            {t("catalog.products.empty")}
          </p>
        ) : null}
      </section>

      <LineFormModal
        open={lineModal !== null}
        mode={lineModal === "edit" ? "edit" : "add"}
        initial={editingLine}
        onClose={() => {
          setLineModal(null);
          setEditingLine(undefined);
        }}
        onSubmit={handleLineSubmit}
      />
    </div>
  );
}
