"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { MaterialIcon } from "@/components/ui/material-icon";
import {
  CHINA_SUPPLY_CATALOG,
  getSupplySpec,
  type ChinaProductSupplySpec,
} from "@/lib/mock/china-supply/applicell-catalog";
import { COSMETIC_TYPE_LABELS } from "@/lib/mock/product-catalog";

const SERIAL_LABEL: Record<ChinaProductSupplySpec["serialPolicy"], string> = {
  unit_qr: "단위 QR",
  carton_qr: "박스 QR",
  none: "없음",
};

function nmpaLabel(type: ChinaProductSupplySpec["nmpaType"]) {
  return type === "special" ? "특수용도(特殊)" : "일반(普通)";
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
      <span className="text-scm-on-surface-variant">{label}</span>
      <span className="text-right font-medium text-scm-primary">{value}</span>
    </div>
  );
}

export default function ChinaInboundViewPage() {
  const { products } = CHINA_SUPPLY_CATALOG;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-scm-primary">
              입고용 제품 정보
            </h1>
            <Badge variant="outline" className="bg-white">
              읽기 전용
            </Badge>
          </div>
          <p className="mt-1 text-sm text-scm-on-surface-variant">
            입고 검수에 필요한 제품 식별·포장·정품 정보입니다. 배합(원료 %)은
            제공되지 않습니다.
          </p>
        </div>
        <Link
          href="/operations-2/inbound/inspection"
          className="inline-flex h-9 items-center gap-1 rounded-md border border-scm-outline-variant bg-white px-3 text-sm font-medium text-scm-primary hover:bg-scm-surface-container"
        >
          <MaterialIcon name="inventory_2" className="text-[18px]" />
          입고 검수로
        </Link>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-scm-outline-variant bg-scm-surface-container-low px-4 py-3 text-sm text-scm-on-surface-variant">
        <MaterialIcon
          name="fact_check"
          className="mt-0.5 shrink-0 text-[20px] text-scm-secondary"
        />
        <p>
          검수 시 <span className="font-medium text-scm-primary">카톤당 개수·단위중량·바코드·QR·LOT·유통기한</span>
          을 실물과 대조합니다. 콜마 출고 수량과 차이가 있으면 입고 보류로 처리합니다.
        </p>
      </div>

      <DashboardCard title="제품 검수 기준" subtitle="배합/원료 비공개 · 식별·포장·정품 정보만">
        <div className="grid gap-4 lg:grid-cols-2">
          {products.map((p) => {
            const spec = getSupplySpec(p.id);
            const perCarton = spec
              ? spec.packaging.unitsPerInner * spec.packaging.innersPerCarton
              : null;
            const volume = p.productVolume
              ? `${p.productVolume.value}${p.productVolume.unit}`
              : "—";

            return (
              <div
                key={p.id}
                className="rounded-lg border border-scm-outline-variant bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-scm-primary">{p.name}</p>
                    <p className="mt-0.5 text-xs text-scm-on-surface-variant">
                      <span className="font-mono">{p.code}</span> ·{" "}
                      {COSMETIC_TYPE_LABELS[p.cosmeticType]} · {volume}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 bg-white">
                    {spec ? nmpaLabel(spec.nmpaType) : "—"}
                  </Badge>
                </div>

                {spec ? (
                  <div className="mt-3 divide-y divide-scm-outline-variant/40 rounded-md bg-scm-surface-container-low px-3 py-1">
                    <SpecRow
                      label="포장 입수"
                      value={`단위 ${spec.packaging.unitsPerInner} / 내박스 ${spec.packaging.innersPerCarton} / 카톤`}
                    />
                    <SpecRow label="카톤당 개수" value={`${perCarton}개`} />
                    <SpecRow
                      label="팔레트당 카톤"
                      value={`${spec.packaging.cartonsPerPallet}카톤`}
                    />
                    <SpecRow label="단위중량" value={`${spec.packaging.unitNetWeightG} g`} />
                    <SpecRow label="바코드" value={spec.barcode} />
                    <SpecRow label="시리얼/QR" value={SERIAL_LABEL[spec.serialPolicy]} />
                    <SpecRow label="LOT 포맷" value={spec.lotFormat} />
                    <SpecRow label="유통기한" value={`제조일 +${spec.shelfLifeMonths}개월`} />
                    {spec.functionalClaim ? (
                      <SpecRow label="기능성 표시" value={spec.functionalClaim} />
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </DashboardCard>
    </div>
  );
}
