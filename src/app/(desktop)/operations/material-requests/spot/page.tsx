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
import type { MaterialRequestLine } from "@/lib/mock/product-catalog";

export default function MaterialRequestSpotPage() {
  const { t } = useLocale();
  const { role } = useRole();
  const { manufacturers, submitMaterialRequest } = useCatalogStore();
  const [manufacturerId, setManufacturerId] = useState(manufacturers[0]?.id ?? "");
  const [lines, setLines] = useState<MaterialRequestLine[]>([]);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState("");

  function handleSubmit() {
    if (!manufacturerId || !lines.length || !comment.trim()) return;
    submitMaterialRequest({
      type: "b_spot",
      lines,
      comment: comment.trim(),
      manufacturerId,
      createdBy: role === "b_admin" ? "B Admin" : "User",
    });
    setDone(t("req.spot.submitted"));
    setLines([]);
    setComment("");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("req.spot.title")}
        description={t("req.spot.desc")}
        actions={
          <Link href="/operations/material-requests" className="text-sm text-scm-link">
            ← {t("req.hub.title")}
          </Link>
        }
      />
      {done ? <p className="text-sm font-medium text-scm-secondary">{done}</p> : null}

      <div className="rounded-lg border border-amber-200/80 bg-amber-50/50 p-3 text-sm dark:border-amber-900/50 dark:bg-amber-950/20">
        {t("req.spot.typeHint")}
      </div>

      <ManufacturerSelect
        manufacturers={manufacturers}
        value={manufacturerId}
        onChange={setManufacturerId}
        required
        hint={t("req.spot.mfrHint")}
      />

      <MaterialLinePicker lines={lines} onChange={setLines} />

      <FormField label={t("req.spot.comment")}>
        <textarea
          className={inputClassName}
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("req.spot.commentPlaceholder")}
          required
        />
      </FormField>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!manufacturerId || !lines.length || !comment.trim()}
      >
        {t("req.spot.submit")}
      </Button>
    </div>
  );
}
