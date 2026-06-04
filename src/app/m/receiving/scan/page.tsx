"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/locale-provider";
import { useMockStore } from "@/components/providers/mock-store-provider";

const MOCK_SHIPMENT_ID = "shp-001";
const MOCK_QR = "QR-SHP-2026-001";

export default function QrScanPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { getShipment } = useMockStore();
  const mockShipment = getShipment(MOCK_SHIPMENT_ID);

  function handleMockScan() {
    router.push(`/m/receiving/${MOCK_SHIPMENT_ID}?scanned=${encodeURIComponent(MOCK_QR)}`);
  }

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold">{t("mobile.scanTitle")}</h1>
        <p className="mt-1 text-base text-muted-foreground">{t("mobile.scanSub")}</p>
      </div>
      <div className="flex h-72 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30">
        <QrCode className="h-20 w-20 text-muted-foreground" strokeWidth={1.5} />
        <p className="mt-4 px-4 text-center text-sm text-muted-foreground">
          {t("mobile.scanHint")}
        </p>
      </div>
      <Button size="lg" className="w-full" onClick={handleMockScan}>
        {t("mobile.scanMock")} (SHP-2026-001)
      </Button>
      {mockShipment ? (
        <p className="text-center text-sm text-muted-foreground">
          QR: {MOCK_QR}
          <br />
          WO: {mockShipment.woNumber}
        </p>
      ) : null}
      <Button asChild variant="outline">
        <Link href="/m">{t("mobile.backList")}</Link>
      </Button>
    </div>
  );
}
