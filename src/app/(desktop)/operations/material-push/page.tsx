"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader, FormField, inputClassName } from "@/components/layout/page-parts";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/locale-provider";
import { useCatalogStore } from "@/components/providers/catalog-store-provider";
import { useRole } from "@/components/providers/role-provider";
import { MaterialLinePicker } from "@/components/catalog/material-line-picker";
import { ManufacturerSelect } from "@/components/catalog/manufacturer-select";
import { A_PUSH_YIELD_PCT } from "@/lib/mock/product-catalog";
import type { MaterialRequestLine } from "@/lib/mock/product-catalog";

export default function MaterialPushPage() {
  const { t } = useLocale();
  const { role } = useRole();
  const { manufacturers, submitMaterialRequest } = useCatalogStore();
  const [manufacturerId, setManufacturerId] = useState(manufacturers[0]?.id ?? "");
  const [targetQty, setTargetQty] = useState("1000");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [lines, setLines] = useState<MaterialRequestLine[]>([]);
  const [done, setDone] = useState("");

  const scaledUnits = Math.max(0, Number(targetQty) || 0);

  const createdBy =
    role === "super_admin" ? "A Admin" : role === "b_admin" ? "B Admin" : "User";

  function handleSubmit() {
    if (!manufacturerId || !notifyMessage.trim() || lines.length === 0) return;
    if (scaledUnits <= 0) return;
    submitMaterialRequest({
      type: "a_push",
      lines,
      notifyMessage: notifyMessage.trim(),
      manufacturerId,
      createdBy,
    });
    setDone(t("req.push.submitted"));
    setNotifyMessage("");
    setLines([]);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("req.push.title")}
        description={t("req.push.desc")}
        actions={
          <Link
            href="/operations/material-requests/inbox"
            className="text-sm font-medium text-scm-link hover:underline"
          >
            {t("req.inbox.title")} →
          </Link>
        }
      />
      {done ? <p className="text-sm font-medium text-scm-secondary">{done}</p> : null}

      <div className="rounded-lg border border-amber-200/80 bg-amber-50/50 p-3 text-sm text-scm-on-surface-variant dark:border-amber-900/50 dark:bg-amber-950/20">
        {t("req.push.typeHint")}
      </div>

      <ManufacturerSelect
        manufacturers={manufacturers}
        value={manufacturerId}
        onChange={setManufacturerId}
        required
        hint={t("req.push.mfrHint")}
      />

      <FormField label={t("req.push.targetQty")}>
        <input
          type="number"
          min={1}
          className={inputClassName}
          value={targetQty}
          onChange={(e) => setTargetQty(e.target.value)}
        />
        <p className="mt-1 text-xs text-scm-on-surface-variant">
          {t("req.push.targetQtyHint")}
        </p>
        <p className="mt-1 text-xs font-medium text-scm-secondary">
          {t("req.push.yieldFixed")}
        </p>
      </FormField>

      <FormField label={t("req.push.notifyMessage")}>
        <textarea
          className={inputClassName}
          rows={3}
          value={notifyMessage}
          onChange={(e) => setNotifyMessage(e.target.value)}
          placeholder={t("req.push.notifyPlaceholder")}
        />
      </FormField>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-scm-primary">
          {t("req.push.materials")}
        </h2>
        <MaterialLinePicker
          lines={lines}
          onChange={setLines}
          scaleTargetUnits={scaledUnits}
          scaleYieldPct={A_PUSH_YIELD_PCT}
        />
      </section>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!manufacturerId || !lines.length || scaledUnits <= 0}
      >
        {t("req.push.submit")}
      </Button>
    </div>
  );
}
