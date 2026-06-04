"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/locale-provider";
import { useMockStore } from "@/components/providers/mock-store-provider";

export default function DiscrepancyPage() {
  const params = useParams<{ id: string }>();
  const { t } = useLocale();
  const { getShipment } = useMockStore();
  const shipment = getShipment(params.id);

  if (!shipment) {
    return <p className="text-muted-foreground">Shipment not found</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t("mobile.discrepancy")}</h1>
        <p className="text-base text-muted-foreground">{shipment.number}</p>
      </div>
      <div className="space-y-3">
        <Button className="h-12 w-full text-base" variant="outline">
          Research missing units
        </Button>
        <Button className="h-12 w-full text-base" variant="outline">
          Accept variance
        </Button>
      </div>
      <Button asChild variant="ghost" className="w-full">
        <Link href="/m">{t("mobile.backList")}</Link>
      </Button>
    </div>
  );
}
