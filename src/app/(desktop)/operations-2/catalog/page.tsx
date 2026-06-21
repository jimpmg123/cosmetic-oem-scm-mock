"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useRole } from "@/components/providers/role-provider";
import {
  canApproveChinaCatalog,
  canEditChinaCatalog,
} from "@/lib/role-access";
import {
  APPLICELL_KOREA,
  CHINA_SUPPLY_CATALOG,
  KOLMAR_CHINA,
  getSupplySpec,
  type ChinaProductSupplySpec,
} from "@/lib/mock/china-supply/applicell-catalog";
import { COSMETIC_TYPE_LABELS } from "@/lib/mock/product-catalog";
import { SearchBox } from "@/components/china-supply/search-box";
import { searchProducts } from "@/lib/china-supply/search";

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

export default function ChinaCatalogPage() {
  const { role } = useRole();
  const canEdit = canEditChinaCatalog(role);
  const canApprove = canApproveChinaCatalog(role);

  const { brandLines, products } = CHINA_SUPPLY_CATALOG;
  const [search, setSearch] = useState("");
  const visibleProducts = useMemo(
    () => searchProducts(products, search),
    [products, search],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-scm-primary">
              제품 카탈로그
            </h1>
            <Badge variant="outline" className="bg-white">
              APPLICELL Korea 전용
            </Badge>
          </div>
          <p className="mt-1 text-sm text-scm-on-surface-variant">
            완제품 SKU 마스터 — 식별·포장·검수 사양을 관리합니다. 배합(원료 %)은{" "}
            <Link href="/operations-2/bom" className="text-scm-link hover:underline">
              BOM 기준
            </Link>{" "}
            에서 봅니다.
          </p>
        </div>
        <Link
          href="/operations-2"
          className="inline-flex h-9 items-center gap-1 rounded-md border border-scm-outline-variant bg-white px-3 text-sm font-medium text-scm-primary hover:bg-scm-surface-container"
        >
          <MaterialIcon name="dashboard" className="text-[18px]" />
          현황으로
        </Link>
      </div>

      {/* 권한 안내 (SoD) */}
      <div className="flex items-start gap-3 rounded-lg border border-scm-outline-variant bg-scm-surface-container-low px-4 py-3 text-sm">
        <MaterialIcon
          name={canApprove ? "verified_user" : "edit_note"}
          className="mt-0.5 shrink-0 text-[20px] text-scm-secondary"
        />
        <p className="text-scm-on-surface-variant">
          현재 권한:{" "}
          <span className="font-semibold text-scm-primary">
            {canApprove
              ? "확정 — 제품·사양 승인 및 잠금(최고관리자)"
              : canEdit
                ? "입력 — 제품·사양 작성/수정(실무 운영자)"
                : "읽기"}
          </span>
          . 입력과 확정은 서로 다른 담당이 맡습니다(업무 분리).
        </p>
      </div>

      {/* 공급사 / 제조처 */}
      <div className="grid gap-3 md:grid-cols-2">
        <DashboardCard title="브랜드 공급사 (판매원)">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-scm-surface-container text-scm-secondary">
              <MaterialIcon name="business_center" className="text-[24px]" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-scm-primary">{APPLICELL_KOREA.name}</p>
              <p className="mt-0.5 text-xs text-scm-on-surface-variant">
                {APPLICELL_KOREA.role}
              </p>
            </div>
          </div>
        </DashboardCard>
        <DashboardCard title="제조처 (외부)">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-scm-surface-container text-scm-secondary">
              <MaterialIcon name="factory" className="text-[24px]" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-scm-primary">
                {KOLMAR_CHINA.name}{" "}
                <span className="font-normal text-scm-on-surface-variant">
                  ({KOLMAR_CHINA.chineseName})
                </span>
              </p>
              <p className="mt-0.5 text-xs text-scm-on-surface-variant">
                {KOLMAR_CHINA.concept}
              </p>
            </div>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard
        title={`제품 목록 (${visibleProducts.length}/${products.length}종)`}
        subtitle="식별 + 입고·검수 사양 (배합/원료는 비공개 — BOM 기준 메뉴)"
        action={
          canEdit ? (
            <button
              type="button"
              disabled
              title="다음 단계: 입력 폼 연결"
              className="inline-flex h-9 cursor-not-allowed items-center gap-1 rounded-md border border-scm-outline-variant bg-white px-3 text-sm font-medium text-scm-on-surface-variant opacity-70"
            >
              <MaterialIcon name="add" className="text-[18px]" />
              제품 추가
            </button>
          ) : undefined
        }
      >
        <div className="space-y-4">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="제품명 · SKU · 바코드 검색"
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {visibleProducts.map((p) => {
            const line = brandLines.find((l) => l.id === p.lineId);
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
                      {line ? ` · ${line.name}` : ""}
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
                      value={`단위 ${spec.packaging.unitsPerInner} / 내박스, 카톤당 ${perCarton}개`}
                    />
                    <SpecRow label="단위중량" value={`${spec.packaging.unitNetWeightG} g`} />
                    <SpecRow label="바코드" value={spec.barcode} />
                    <SpecRow label="시리얼/QR" value={SERIAL_LABEL[spec.serialPolicy]} />
                    <SpecRow label="LOT 포맷" value={spec.lotFormat} />
                    <SpecRow label="유통기한" value={`제조일 +${spec.shelfLifeMonths}개월`} />
                    {spec.functionalClaim ? (
                      <SpecRow label="기능성" value={spec.functionalClaim} />
                    ) : null}
                    <SpecRow
                      label="표준 로스 여유"
                      value={`${spec.lossAllowancePct}%`}
                    />
                  </div>
                ) : null}

                <div className="mt-3 flex items-center justify-between gap-2">
                  <Link
                    href="/operations-2/bom"
                    className="inline-flex items-center gap-1 text-sm font-medium text-scm-link hover:underline"
                  >
                    <MaterialIcon name="account_tree" className="text-[18px]" />
                    BOM 기준 보기
                  </Link>
                  <div className="flex items-center gap-1.5">
                    {canEdit ? (
                      <button
                        type="button"
                        disabled
                        title="다음 단계: 입력 폼 연결"
                        className="inline-flex h-8 cursor-not-allowed items-center gap-1 rounded-md border border-scm-outline-variant bg-white px-2.5 text-xs font-medium text-scm-on-surface-variant opacity-70"
                      >
                        <MaterialIcon name="edit" className="text-[16px]" />
                        수정
                      </button>
                    ) : null}
                    {canApprove ? (
                      <button
                        type="button"
                        disabled
                        title="다음 단계: 승인·잠금 연결"
                        className="inline-flex h-8 cursor-not-allowed items-center gap-1 rounded-md border border-scm-outline-variant bg-white px-2.5 text-xs font-medium text-scm-on-surface-variant opacity-70"
                      >
                        <MaterialIcon name="lock" className="text-[16px]" />
                        승인·잠금
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
            })}
          </div>
          {visibleProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-scm-on-surface-variant">
              검색 결과가 없습니다.
            </p>
          ) : null}
        </div>
      </DashboardCard>
    </div>
  );
}
