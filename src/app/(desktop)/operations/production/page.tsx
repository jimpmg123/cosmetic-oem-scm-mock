"use client";

import { useState } from "react";
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

export default function ProductionEntryPage() {
  const { t } = useLocale();
  const { workOrders, productionEntries, addProductionEntry, deleteProductionEntry } =
    useMockStore();
  const [woId, setWoId] = useState(workOrders[0]?.id ?? "");
  const [qty, setQty] = useState("");
  const [scrap, setScrap] = useState("0");
  const [note, setNote] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!woId) return;
    addProductionEntry({
      woId,
      qty: Number(qty) || 0,
      scrap: Number(scrap) || 0,
      note,
    });
    setQty("");
    setScrap("0");
    setNote("");
  }

  function handleDelete(id: string) {
    if (window.confirm(t("common.confirmDelete"))) {
      deleteProductionEntry(id);
    }
  }

  const woMap = Object.fromEntries(workOrders.map((w) => [w.id, w]));

  return (
    <>
      <PageHeader title={t("production.title")} description={t("production.desc")} />
      <form
        onSubmit={handleAdd}
        className="mb-6 grid gap-4 rounded-md border border-border bg-card p-5 sm:grid-cols-2 lg:grid-cols-5"
      >
        <FormField label={<TermLabel term="wo" />}>
          <select
            className={inputClassName}
            value={woId}
            onChange={(e) => setWoId(e.target.value)}
            required
          >
            {workOrders.map((wo) => (
              <option key={wo.id} value={wo.id}>
                {wo.number} — {wo.sku}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t("production.col.qty")}>
          <input
            type="number"
            className={inputClassName}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            required
          />
        </FormField>
        <FormField label={t("production.col.scrap")}>
          <input
            type="number"
            className={inputClassName}
            value={scrap}
            onChange={(e) => setScrap(e.target.value)}
          />
        </FormField>
        <FormField label={t("production.col.note")}>
          <input
            className={inputClassName}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </FormField>
        <div className="flex items-end">
          <Button type="submit" className="w-full">
            {t("production.add")}
          </Button>
        </div>
      </form>
      <DataTable
        columns={[
          { key: "wo", label: <TermLabel term="wo" /> },
          { key: "qty", label: t("production.col.qty"), align: "right" },
          { key: "scrap", label: t("production.col.scrap"), align: "right" },
          { key: "note", label: t("production.col.note") },
          { key: "actions", label: t("common.actions") },
        ]}
        rows={productionEntries.map((entry) => ({
          wo: woMap[entry.woId]?.number ?? entry.woId,
          qty: entry.qty.toLocaleString(),
          scrap: entry.scrap.toLocaleString(),
          note: entry.note || "—",
          actions: (
            <Button variant="outline" size="sm" onClick={() => handleDelete(entry.id)}>
              {t("common.delete")}
            </Button>
          ),
        }))}
        emptyMessage={t("common.empty")}
      />
    </>
  );
}
