"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/page-parts";
import { useLocale } from "@/components/providers/locale-provider";
import { MaterialIcon } from "@/components/ui/material-icon";

export default function MaterialRequestsHubPage() {
  const { t } = useLocale();

  const cards = [
    {
      href: "/operations/material-requests/production",
      icon: "precision_manufacturing",
      titleKey: "req.hub.production",
      descKey: "req.hub.productionDesc",
    },
    {
      href: "/operations/material-requests/spot",
      icon: "build_circle",
      titleKey: "req.hub.spot",
      descKey: "req.hub.spotDesc",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("req.hub.title")}
        description={t("req.hub.desc")}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="flex gap-4 rounded-lg border border-scm-outline-variant bg-scm-surface p-5 hover:border-scm-secondary"
          >
            <MaterialIcon name={c.icon} className="text-[32px] text-scm-secondary" />
            <div>
              <p className="font-semibold text-scm-primary">{t(c.titleKey)}</p>
              <p className="mt-1 text-sm text-scm-on-surface-variant">{t(c.descKey)}</p>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-sm text-scm-on-surface-variant">{t("req.hub.aPushNote")}</p>
    </div>
  );
}
