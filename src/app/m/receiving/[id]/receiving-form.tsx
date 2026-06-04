"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TermLabel } from "@/components/ui/term-tooltip";
import { useLocale } from "@/components/providers/locale-provider";
import { useMockStore } from "@/components/providers/mock-store-provider";

export default function ReceivingForm() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const scanned = searchParams.get("scanned");
  const { t } = useLocale();
  const { getShipment, saveInboundReceiving } = useMockStore();
  const shipment = getShipment(params.id);
  const [qty, setQty] = useState(
    shipment?.receivedQty?.toString() ?? shipment?.expectedQty.toString() ?? "",
  );
  const [saved, setSaved] = useState(false);

  if (!shipment) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Shipment not found
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/m">{t("mobile.backList")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const diff = Number(qty) - shipment.expectedQty;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t("mobile.receivingTitle")}</h1>
        <p className="text-base text-muted-foreground">{shipment.number}</p>
        {scanned ? (
          <p className="mt-1 text-sm text-emerald-700">Scanned: {scanned}</p>
        ) : null}
      </div>
      <dl className="space-y-3 rounded-lg border border-border bg-card p-4 text-base">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">
            <TermLabel term="wo" />
          </dt>
          <dd>{shipment.woNumber}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">
            <TermLabel term="sku" />
          </dt>
          <dd>{shipment.sku}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">
            <TermLabel term="expected" />
          </dt>
          <dd className="tabular-nums">{shipment.expectedQty.toLocaleString()}</dd>
        </div>
      </dl>
      <div>
        <label className="mb-2 block text-base font-medium">
          {t("mobile.actualQty")}
        </label>
        <input
          type="number"
          value={qty}
          onChange={(e) => {
            setQty(e.target.value);
            setSaved(false);
          }}
          className="h-12 w-full rounded-md border border-input bg-background px-3 text-xl tabular-nums"
        />
        {diff !== 0 ? (
          <p className="mt-2 text-base text-amber-700">
            <TermLabel term="discrepancy" />: {diff > 0 ? "+" : ""}
            {diff.toLocaleString()}
          </p>
        ) : null}
      </div>
      <Button
        className="h-12 w-full text-base"
        size="lg"
        onClick={() => {
          saveInboundReceiving(shipment.id, Number(qty) || 0);
          setSaved(true);
        }}
      >
        {t("mobile.saveInbound")}
      </Button>
      {saved ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-base text-emerald-800">
          {t("common.savedMock")}{" "}
          {diff !== 0 ? (
            <Link href={`/m/discrepancy/${shipment.id}`} className="underline">
              <TermLabel term="discrepancy" />
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
