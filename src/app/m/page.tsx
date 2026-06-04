"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/locale-provider";
import { useMockStore } from "@/components/providers/mock-store-provider";

const statusVariant = {
  in_transit: "secondary" as const,
  receiving: "warning" as const,
  closed: "success" as const,
};

export default function MobileInboundListPage() {
  const { t } = useLocale();
  const { inboundShipments } = useMockStore();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">{t("mobile.inboundTitle")}</h1>
        <p className="text-base text-muted-foreground">{t("mobile.inboundSub")}</p>
      </div>
      <ul className="space-y-3">
        {inboundShipments.map((shipment) => (
          <li
            key={shipment.id}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-lg font-medium">{shipment.number}</div>
                <div className="text-sm text-muted-foreground">
                  {shipment.woNumber} · {shipment.sku}
                </div>
              </div>
              <Badge variant={statusVariant[shipment.status]}>
                {t(`status.${shipment.status}`) || shipment.status}
              </Badge>
            </div>
            <div className="mt-3 flex items-center justify-between text-base">
              <span className="tabular-nums">
                {t("mobile.expected")}: {shipment.expectedQty.toLocaleString()}
              </span>
              {shipment.status === "receiving" ? (
                <Button asChild size="default">
                  <Link href={`/m/receiving/${shipment.id}`}>{t("mobile.receive")}</Link>
                </Button>
              ) : (
                <span className="text-muted-foreground">
                  {t("mobile.received")}: {shipment.receivedQty?.toLocaleString()}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
