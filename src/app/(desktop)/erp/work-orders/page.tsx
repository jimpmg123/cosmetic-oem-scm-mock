"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TermLabel } from "@/components/ui/term-tooltip";
import {
  DataTable,
  FormField,
  PageHeader,
  inputClassName,
} from "@/components/layout/page-parts";
import { useLocale } from "@/components/providers/locale-provider";
import { useMockStore } from "@/components/providers/mock-store-provider";

export default function WorkOrdersPage() {
  const { t } = useLocale();
  const { workOrders, addWorkOrder, deleteWorkOrder } = useMockStore();
  const [sku, setSku] = useState("");
  const [productName, setProductName] = useState("");
  const [targetQty, setTargetQty] = useState("500");
  const [vendor, setVendor] = useState("B Cosmetics (CN)");
  const [showForm, setShowForm] = useState(false);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    addWorkOrder({
      sku: sku.trim(),
      productName: productName.trim(),
      targetQty: Number(targetQty) || 0,
      vendor: vendor.trim(),
    });
    setSku("");
    setProductName("");
    setTargetQty("500");
    setShowForm(false);
  }

  function handleDelete(id: string) {
    if (window.confirm(t("common.confirmDelete"))) {
      deleteWorkOrder(id);
    }
  }

  return (
    <>
      <PageHeader
        title={t("wo.title")}
        description={t("wo.desc")}
        actions={
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? t("common.cancel") : t("wo.add")}
          </Button>
        }
      />
      {showForm ? (
        <form
          onSubmit={handleAdd}
          className="mb-6 grid gap-4 rounded-md border border-border bg-card p-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <FormField label={<TermLabel term="sku" />}>
            <input
              className={inputClassName}
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
              placeholder="SERUM-50"
            />
          </FormField>
          <FormField label={t("wo.form.product")}>
            <input
              className={inputClassName}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </FormField>
          <FormField label={t("wo.form.target")}>
            <input
              type="number"
              className={inputClassName}
              value={targetQty}
              onChange={(e) => setTargetQty(e.target.value)}
              required
            />
          </FormField>
          <FormField label={<TermLabel term="vendor" />}>
            <input
              className={inputClassName}
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              required
            />
          </FormField>
          <div className="sm:col-span-2 lg:col-span-4">
            <Button type="submit">{t("common.add")}</Button>
          </div>
        </form>
      ) : null}
      <DataTable
        columns={[
          { key: "number", label: t("wo.col.number") },
          { key: "item", label: t("wo.col.item") },
          { key: "vendor", label: <TermLabel term="vendor" /> },
          { key: "target", label: t("wo.col.target"), align: "right" },
          { key: "yield", label: <TermLabel term="yield" />, align: "right" },
          { key: "status", label: t("wo.col.status") },
          { key: "actions", label: t("common.actions") },
        ]}
        rows={workOrders.map((wo) => ({
          number: wo.number,
          item: wo.productName,
          vendor: wo.vendor,
          target: wo.targetQty.toLocaleString(),
          yield: `${wo.yieldAllowancePct}%`,
          status: (
            <Badge variant="outline">{t(`status.${wo.status}`) || wo.status}</Badge>
          ),
          actions: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(wo.id)}
            >
              {t("common.delete")}
            </Button>
          ),
        }))}
        emptyMessage={t("common.empty")}
      />
    </>
  );
}
