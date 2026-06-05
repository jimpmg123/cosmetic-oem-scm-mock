"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader, FormField, inputClassName } from "@/components/layout/page-parts";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/locale-provider";
import { useCatalogStore } from "@/components/providers/catalog-store-provider";
import { useAAdminPolicy } from "@/components/providers/a-admin-policy-provider";
import { useRole } from "@/components/providers/role-provider";
import { MaterialLinePicker } from "@/components/catalog/material-line-picker";
import { ManufacturerSelect } from "@/components/catalog/manufacturer-select";
import {
  canCreatePushNotice,
  canEditPushRequest,
  canPublishPushRequest,
  isSuperAdmin,
} from "@/lib/a-admin-permissions";
import { A_PUSH_YIELD_PCT } from "@/lib/mock/product-catalog";
import type { MaterialRequest } from "@/lib/mock/product-catalog";

const EMPTY_FORM = {
  manufacturerId: "",
  targetQty: "1000",
  notifyMessage: "",
};

export default function MaterialPushPage() {
  const { t } = useLocale();
  const { role } = useRole();
  const { policy } = useAAdminPolicy();
  const {
    manufacturers,
    materialRequests,
    savePushNotice,
    publishPushNotice,
  } = useCatalogStore();

  const pushRows = useMemo(
    () =>
      materialRequests
        .filter((r) => r.type === "a_push")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [materialRequests],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [lines, setLines] = useState<MaterialRequest["lines"]>([]);
  const [done, setDone] = useState("");

  const selected = pushRows.find((r) => r.id === selectedId);
  const scaledUnits = Math.max(0, Number(form.targetQty) || 0);
  const readOnly = selected
    ? !canEditPushRequest(role, selected)
    : false;
  const canPublishSelected = selected
    ? canPublishPushRequest(role, selected, policy)
    : false;

  const createdByLabel = isSuperAdmin(role) ? "A Super Admin" : "A Admin";

  function loadIntoForm(row: MaterialRequest) {
    setSelectedId(row.id);
    setForm({
      manufacturerId: row.manufacturerId,
      targetQty: String(row.targetFinishedQty ?? 1000),
      notifyMessage: row.notifyMessage ?? "",
    });
    setLines(row.lines);
    setDone("");
  }

  function resetForm() {
    setSelectedId(null);
    setForm({
      ...EMPTY_FORM,
      manufacturerId: manufacturers[0]?.id ?? "",
    });
    setLines([]);
    setDone("");
  }

  function handleSaveDraft() {
    if (!form.manufacturerId || !form.notifyMessage.trim() || !lines.length) return;
    if (scaledUnits <= 0) return;
    if (readOnly) return;

    const id = savePushNotice({
      id: selectedId ?? undefined,
      manufacturerId: form.manufacturerId,
      targetFinishedQty: scaledUnits,
      notifyMessage: form.notifyMessage.trim(),
      lines,
      authorRole: role,
      createdBy: createdByLabel,
      publish: false,
    });
    setSelectedId(id);
    setDone(t("req.push.savedDraft"));
  }

  function handlePublish() {
    if (!form.manufacturerId || !form.notifyMessage.trim() || !lines.length) return;
    if (scaledUnits <= 0) return;

    if (selectedId && canPublishSelected) {
      if (canEditPushRequest(role, selected!)) {
        savePushNotice({
          id: selectedId,
          manufacturerId: form.manufacturerId,
          targetFinishedQty: scaledUnits,
          notifyMessage: form.notifyMessage.trim(),
          lines,
          authorRole: selected!.authorRole ?? role,
          createdBy: selected!.createdBy,
          publish: true,
        });
      } else {
        publishPushNotice(selectedId);
      }
      setDone(t("req.push.published"));
      return;
    }

    if (!selectedId && canCreatePushNotice(role)) {
      const publishAllowed =
        isSuperAdmin(role) ||
        (role === "a_admin" && policy.adminCanPublishPush);
      if (!publishAllowed) {
        handleSaveDraft();
        return;
      }
      savePushNotice({
        manufacturerId: form.manufacturerId,
        targetFinishedQty: scaledUnits,
        notifyMessage: form.notifyMessage.trim(),
        lines,
        authorRole: role,
        createdBy: createdByLabel,
        publish: true,
      });
      setDone(t("req.push.published"));
      resetForm();
    }
  }

  const showPublishButton =
    isSuperAdmin(role) ||
    (role === "a_admin" && policy.adminCanPublishPush);

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
        {t("req.push.workflowHint")}
      </div>

      <section className="overflow-x-auto rounded-lg border border-scm-outline-variant">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-scm-surface-container-low text-left text-scm-on-surface-variant">
            <tr>
              <th className="px-3 py-2">{t("req.col.number")}</th>
              <th className="px-3 py-2">{t("req.push.col.author")}</th>
              <th className="px-3 py-2">{t("req.col.status")}</th>
              <th className="px-3 py-2">{t("req.col.summary")}</th>
              <th className="px-3 py-2">{t("req.col.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {pushRows.map((r) => (
              <tr key={r.id} className="border-t border-scm-outline-variant/60">
                <td className="px-3 py-2 font-mono text-xs">{r.number}</td>
                <td className="px-3 py-2 text-xs">
                  {r.authorRole === "super_admin"
                    ? t("role.super_admin")
                    : t("role.a_admin")}
                </td>
                <td className="px-3 py-2">{r.status}</td>
                <td className="max-w-xs truncate px-3 py-2">{r.notifyMessage}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className="text-scm-link text-xs font-medium"
                    onClick={() => loadIntoForm(r)}
                  >
                    {canEditPushRequest(role, r)
                      ? t("common.edit")
                      : t("common.view")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pushRows.length === 0 ? (
          <p className="px-3 py-4 text-sm text-scm-on-surface-variant">
            {t("req.push.empty")}
          </p>
        ) : null}
      </section>

      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-scm-primary">
          {selected ? t("req.push.formEdit") : t("req.push.formNew")}
        </h2>
        {selected ? (
          <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
            {t("req.push.newForm")}
          </Button>
        ) : null}
      </div>

      {readOnly ? (
        <p className="text-sm text-amber-800 dark:text-amber-200">
          {t("req.push.readOnlyHint")}
        </p>
      ) : null}

      <fieldset disabled={readOnly} className="space-y-6 disabled:opacity-70">
      <ManufacturerSelect
        manufacturers={manufacturers}
        value={form.manufacturerId || manufacturers[0]?.id || ""}
        onChange={(id) => setForm((f) => ({ ...f, manufacturerId: id }))}
        required
        hint={t("req.push.mfrHint")}
      />

      <FormField label={t("req.push.targetQty")}>
        <input
          type="number"
          min={1}
          className={inputClassName}
          value={form.targetQty}
          onChange={(e) => setForm((f) => ({ ...f, targetQty: e.target.value }))}
        />
        <p className="mt-1 text-xs text-scm-on-surface-variant">
          {t("req.push.targetQtyHint")}
        </p>
      </FormField>

      <FormField label={t("req.push.notifyMessage")}>
        <textarea
          className={inputClassName}
          rows={3}
          value={form.notifyMessage}
          onChange={(e) => setForm((f) => ({ ...f, notifyMessage: e.target.value }))}
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
      </fieldset>

      <div className="flex flex-wrap gap-2">
        {!readOnly ? (
          <Button
            type="button"
            variant="secondary"
            onClick={handleSaveDraft}
            disabled={!form.manufacturerId || !lines.length || scaledUnits <= 0}
          >
            {t("req.push.saveDraft")}
          </Button>
        ) : null}
        {showPublishButton && !readOnly ? (
          <Button
            type="button"
            onClick={handlePublish}
            disabled={!form.manufacturerId || !lines.length || scaledUnits <= 0}
          >
            {t("req.push.publish")}
          </Button>
        ) : null}
        {readOnly && selected && canPublishSelected ? (
          <Button type="button" onClick={handlePublish}>
            {t("req.push.publish")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
