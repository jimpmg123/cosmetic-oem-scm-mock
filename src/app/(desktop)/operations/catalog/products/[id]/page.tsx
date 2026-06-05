"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-parts";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useLocale } from "@/components/providers/locale-provider";
import { useCatalogStore } from "@/components/providers/catalog-store-provider";
import { ProductThumbnail } from "@/components/catalog/product-thumbnail";
import {
  formatBomPercent,
  formatBomQtyPerUnit,
  formatVolumeAmount,
} from "@/lib/catalog/format-volume";
import { getCosmeticTypeLabel } from "@/lib/i18n/catalog-labels";

export default function CatalogProductDetailPage() {
  const { t, locale } = useLocale();
  const params = useParams();
  const id = params.id as string;
  const { getProduct, brandLines } = useCatalogStore();
  const product = getProduct(id);
  const line = product ? brandLines.find((l) => l.id === product.lineId) : undefined;

  if (!product) {
    return (
      <p className="text-scm-on-surface-variant">{t("catalog.products.notFound")}</p>
    );
  }

  const newVolumeHref = `/operations/material-bundles/new?productId=${encodeURIComponent(product.id)}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        description={`${line?.name ?? ""} · ${product.code}`}
        actions={
          <Link
            href="/operations/catalog"
            className="text-sm font-medium text-scm-link hover:underline"
          >
            ← {t("catalog.products.title")}
          </Link>
        }
      />

      <div className="flex flex-wrap gap-6">
        <ProductThumbnail
          name={product.name}
          imageUrl={product.imageUrl}
          cosmeticType={product.cosmeticType}
          size="lg"
        />
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-scm-on-surface-variant">{t("catalog.productForm.line")}</dt>
            <dd className="font-medium">{line?.name}</dd>
          </div>
          <div>
            <dt className="text-scm-on-surface-variant">{t("catalog.productForm.cosmeticType")}</dt>
            <dd>{getCosmeticTypeLabel(locale, product.cosmeticType)}</dd>
          </div>
          <div>
            <dt className="text-scm-on-surface-variant">{t("catalog.productForm.devDate")}</dt>
            <dd>{product.devDate}</dd>
          </div>
          <div>
            <dt className="text-scm-on-surface-variant">{t("catalog.productForm.code")}</dt>
            <dd className="font-mono">{product.code}</dd>
          </div>
          {product.productVolume ? (
            <div>
              <dt className="text-scm-on-surface-variant">
                {t("catalog.productForm.productVolume")}
              </dt>
              <dd className="tabular-nums">{formatVolumeAmount(product.productVolume)}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-scm-primary">{t("catalog.productForm.bom")}</h2>
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr className="text-left text-scm-on-surface-variant">
              <th className="py-1">{t("catalog.productForm.itemCode")}</th>
              <th>{t("catalog.productForm.itemName")}</th>
              <th className="text-right">{t("catalog.productForm.percent")}</th>
              <th className="text-right">{t("catalog.productForm.qtyPerUnit")}</th>
            </tr>
          </thead>
          <tbody>
            {product.bom.map((b) => (
              <tr key={b.id} className="border-t border-scm-outline-variant/50">
                <td className="py-2 font-mono text-xs">{b.itemCode}</td>
                <td>{b.itemName}</td>
                <td className="text-right tabular-nums">{formatBomPercent(b.percent)}</td>
                <td className="text-right tabular-nums">{formatBomQtyPerUnit(b)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4">
          <Button asChild>
            <Link href={newVolumeHref}>
              <MaterialIcon name="add" className="mr-1 text-[18px]" />
              {t("nav.materialBundlesNew")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
