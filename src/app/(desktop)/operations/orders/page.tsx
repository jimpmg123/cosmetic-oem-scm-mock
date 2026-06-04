"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { TermLabel } from "@/components/ui/term-tooltip";
import { DataTable, PageHeader } from "@/components/layout/page-parts";
import { useLocale } from "@/components/providers/locale-provider";
import { useMockStore } from "@/components/providers/mock-store-provider";

export default function ProductionOrdersPage() {
  const { t } = useLocale();
  const { workOrders } = useMockStore();

  return (
    <>
      <PageHeader title={t("orders.title")} description={t("orders.desc")} />
      <DataTable
        columns={[
          { key: "number", label: <TermLabel term="wo" /> },
          { key: "product", label: <TermLabel term="sku" /> },
          { key: "vendor", label: <TermLabel term="vendor" /> },
          { key: "target", label: t("wo.col.target"), align: "right" },
          { key: "material", label: t("wo.col.material"), align: "right" },
          { key: "claimed", label: t("wo.col.claimed"), align: "right" },
          { key: "status", label: t("wo.col.status") },
        ]}
        rows={workOrders.map((wo) => ({
          number: (
            <Link href="/erp/work-orders" className="font-medium hover:underline">
              {wo.number}
            </Link>
          ),
          product: `${wo.sku} — ${wo.productName}`,
          vendor: wo.vendor,
          target: wo.targetQty.toLocaleString(),
          material: wo.materialShipQty.toLocaleString(),
          claimed: wo.bClaimedQty?.toLocaleString() ?? "—",
          status: (
            <Badge variant="outline">{t(`status.${wo.status}`) || wo.status}</Badge>
          ),
        }))}
        emptyMessage={t("common.empty")}
      />
    </>
  );
}
