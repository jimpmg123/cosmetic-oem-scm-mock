"use client";

import { useState } from "react";
import { PageHeader, FormField, inputClassName } from "@/components/layout/page-parts";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/locale-provider";
import { useAAdminPolicy } from "@/components/providers/a-admin-policy-provider";
import { useRole } from "@/components/providers/role-provider";
import { isSuperAdmin } from "@/lib/a-admin-permissions";

export default function AdminSettingsPage() {
  const { t } = useLocale();
  const { role } = useRole();
  const { policy, updatePolicy } = useAAdminPolicy();
  const [draft, setDraft] = useState({
    adminCanPublishPush: policy.adminCanPublishPush,
    autoApproveQtyThreshold: String(policy.autoApproveQtyThreshold),
  });
  const [saved, setSaved] = useState(false);

  if (!isSuperAdmin(role)) {
    return (
      <p className="text-scm-on-surface-variant">{t("role.accessDenied")}</p>
    );
  }

  function handleSave() {
    const threshold = Math.max(0, Number(draft.autoApproveQtyThreshold) || 0);
    updatePolicy({
      adminCanPublishPush: draft.adminCanPublishPush,
      autoApproveQtyThreshold: threshold,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        title={t("admin.settings.title")}
        description={t("admin.settings.desc")}
      />

      <section className="space-y-6 rounded-lg border border-scm-outline-variant p-6">
        <h2 className="text-base font-semibold text-scm-primary">
          {t("admin.settings.aAdminSection")}
        </h2>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4"
            checked={draft.adminCanPublishPush}
            onChange={(e) =>
              setDraft((d) => ({ ...d, adminCanPublishPush: e.target.checked }))
            }
          />
          <span>
            <span className="block font-medium text-scm-primary">
              {t("admin.settings.adminCanPublishPush")}
            </span>
            <span className="mt-1 block text-sm text-scm-on-surface-variant">
              {t("admin.settings.adminCanPublishPushHint")}
            </span>
          </span>
        </label>

        <FormField label={t("admin.settings.autoApproveThreshold")}>
          <input
            type="number"
            min={0}
            className={inputClassName}
            value={draft.autoApproveQtyThreshold}
            onChange={(e) =>
              setDraft((d) => ({ ...d, autoApproveQtyThreshold: e.target.value }))
            }
          />
          <p className="mt-1 text-xs text-scm-on-surface-variant">
            {t("admin.settings.autoApproveThresholdHint")}
          </p>
        </FormField>

        <Button type="button" onClick={handleSave}>
          {t("common.save")}
        </Button>
        {saved ? (
          <p className="text-sm text-scm-secondary">{t("common.savedMock")}</p>
        ) : null}
      </section>
    </div>
  );
}
