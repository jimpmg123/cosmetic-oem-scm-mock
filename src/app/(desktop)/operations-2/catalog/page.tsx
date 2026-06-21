"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { MaterialIcon } from "@/components/ui/material-icon";
import { SearchBox } from "@/components/china-supply/search-box";
import { useRole } from "@/components/providers/role-provider";
import { useChinaSupplyStore } from "@/components/providers/china-supply-store-provider";
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
import {
  COSMETIC_TYPE_LABELS,
  type CatalogProduct,
} from "@/lib/mock/product-catalog";
import type { ManufacturingRequest } from "@/lib/mock/china-supply/manufacturing-requests";
import { searchProducts } from "@/lib/china-supply/search";

const SERIAL_LABEL: Record<ChinaProductSupplySpec["serialPolicy"], string> = {
  unit_qr: "단위 QR",
  carton_qr: "박스 QR",
  none: "없음",
};

type ProductRequestStats = {
  requestCount: number;
  approvedRequestCount: number;
  pendingRequestCount: number;
  firstRequestedAt?: string;
  latestRequestedAt?: string;
  firstApprovedAt?: string;
  approvedQty: number;
  pendingQty: number;
};

function nmpaLabel(type: ChinaProductSupplySpec["nmpaType"]) {
  return type === "special" ? "특수용도(特殊)" : "일반(普通)";
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
}

function productVolume(product: CatalogProduct) {
  return product.productVolume
    ? `${product.productVolume.value}${product.productVolume.unit}`
    : "-";
}

function earlier(current: string | undefined, next: string) {
  return !current || next < current ? next : current;
}

function later(current: string | undefined, next: string) {
  return !current || next > current ? next : current;
}

function emptyStats(): ProductRequestStats {
  return {
    requestCount: 0,
    approvedRequestCount: 0,
    pendingRequestCount: 0,
    approvedQty: 0,
    pendingQty: 0,
  };
}

function buildRequestStats(
  productId: string,
  requests: ManufacturingRequest[],
): ProductRequestStats {
  const stats = emptyStats();

  for (const request of requests) {
    const qty = request.lines
      .filter((line) => line.productId === productId)
      .reduce((sum, line) => sum + line.qty, 0);
    if (qty <= 0 || request.status === "cancelled") continue;

    stats.requestCount += 1;
    stats.firstRequestedAt = earlier(stats.firstRequestedAt, request.createdAt);
    stats.latestRequestedAt = later(stats.latestRequestedAt, request.createdAt);

    if (request.status === "approved") {
      stats.approvedRequestCount += 1;
      stats.approvedQty += qty;
      stats.firstApprovedAt = earlier(
        stats.firstApprovedAt,
        request.approvedAt ?? request.createdAt,
      );
    } else {
      stats.pendingRequestCount += 1;
      stats.pendingQty += qty;
    }
  }

  return stats;
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="shrink-0 text-scm-on-surface-variant">{label}</span>
      <span className="text-right font-medium text-scm-primary">{value}</span>
    </div>
  );
}

function formatQty(value: number) {
  return value > 0 ? `${value.toLocaleString("ko-KR")}개` : "-";
}

export default function ChinaCatalogPage() {
  const { role } = useRole();
  const { requests } = useChinaSupplyStore();
  const canEdit = canEditChinaCatalog(role);
  const canApprove = canApproveChinaCatalog(role);

  const { brandLines, products } = CHINA_SUPPLY_CATALOG;
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(products[0]?.id ?? "");

  const requestStatsByProduct = useMemo(() => {
    return new Map(
      products.map((product) => [product.id, buildRequestStats(product.id, requests)]),
    );
  }, [products, requests]);

  const visibleProducts = useMemo(
    () => searchProducts(products, search),
    [products, search],
  );

  useEffect(() => {
    if (visibleProducts.length === 0) return;
    if (!visibleProducts.some((product) => product.id === selectedId)) {
      setSelectedId(visibleProducts[0].id);
    }
  }, [selectedId, visibleProducts]);

  const selectedProduct =
    visibleProducts.find((product) => product.id === selectedId) ??
    visibleProducts[0] ??
    null;
  const selectedSpec = selectedProduct ? getSupplySpec(selectedProduct.id) : undefined;
  const selectedLine = selectedProduct
    ? brandLines.find((line) => line.id === selectedProduct.lineId)
    : undefined;
  const selectedStats = selectedProduct
    ? requestStatsByProduct.get(selectedProduct.id) ?? emptyStats()
    : emptyStats();

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
            완제품 SKU 마스터 — 목록은 식별·발주 상태 중심으로 보고, 상세에서
            포장·바코드·QR·LOT 기준을 확인합니다.
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
          . 최초 발주일과 누적 발주량은 제품 마스터 수기값이 아니라 제조 요청 이력에서
          파생합니다.
        </p>
      </div>

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

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
        <DashboardCard
          title={`제품 목록 (${visibleProducts.length}/${products.length}종)`}
          subtitle="제품명, SKU, 바코드, LOT, 발주 이력 기준"
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
              placeholder="제품명 · SKU · 바코드 · LOT 검색"
            />

            <div className="-mx-1 overflow-x-auto rounded-lg border border-scm-outline-variant">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-scm-outline-variant/60 bg-[#F8F9FA] text-left text-[11px] font-semibold uppercase text-scm-on-surface-variant">
                    <th className="px-3 py-2.5">제품</th>
                    <th className="px-3 py-2.5">식별</th>
                    <th className="px-3 py-2.5">최초 발주</th>
                    <th className="px-3 py-2.5 text-right">확정량</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleProducts.map((product) => {
                    const spec = getSupplySpec(product.id);
                    const stats = requestStatsByProduct.get(product.id) ?? emptyStats();
                    const isSelected = selectedProduct?.id === product.id;

                    return (
                      <tr
                        key={product.id}
                        tabIndex={0}
                        aria-selected={isSelected}
                        onClick={() => setSelectedId(product.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedId(product.id);
                          }
                        }}
                        className={`cursor-pointer border-b border-scm-outline-variant/40 outline-none last:border-0 hover:bg-scm-surface-container-low focus:bg-scm-surface-container-low ${
                          isSelected ? "bg-scm-secondary/10" : "bg-white"
                        }`}
                      >
                        <td className="px-3 py-3 align-top">
                          <div className="flex items-start gap-2.5">
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-scm-surface-container text-scm-secondary">
                              <MaterialIcon name="category" className="text-[18px]" />
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-scm-primary">
                                {product.name}
                              </p>
                              <p className="mt-0.5 font-mono text-xs text-scm-on-surface-variant">
                                {product.code} · {COSMETIC_TYPE_LABELS[product.cosmeticType]} ·{" "}
                                {productVolume(product)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <p className="font-mono text-xs font-medium text-scm-primary">
                            {spec?.barcode ?? "-"}
                          </p>
                          <p className="mt-0.5 max-w-[220px] truncate font-mono text-[11px] text-scm-on-surface-variant">
                            {spec?.lotFormat ?? "-"}
                          </p>
                        </td>
                        <td className="px-3 py-3 align-top tabular-nums text-scm-on-surface-variant">
                          {formatDate(stats.firstApprovedAt)}
                        </td>
                        <td className="px-3 py-3 text-right align-top tabular-nums font-medium text-scm-primary">
                          {formatQty(stats.approvedQty)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {visibleProducts.length === 0 ? (
              <p className="py-8 text-center text-sm text-scm-on-surface-variant">
                검색 결과가 없습니다.
              </p>
            ) : null}
          </div>
        </DashboardCard>

        <DashboardCard
          title="제품 상세"
          subtitle={selectedProduct ? `${selectedProduct.code} · ${selectedProduct.name}` : "선택 없음"}
          action={
            selectedProduct ? (
              <Link
                href="/operations-2/bom"
                className="inline-flex h-8 items-center gap-1 rounded-md border border-scm-outline-variant bg-white px-2.5 text-xs font-medium text-scm-primary hover:bg-scm-surface-container"
              >
                <MaterialIcon name="account_tree" className="text-[16px]" />
                BOM
              </Link>
            ) : undefined
          }
        >
          {selectedProduct ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-scm-primary">
                    {selectedProduct.name}
                  </p>
                  <p className="mt-0.5 text-xs text-scm-on-surface-variant">
                    {selectedLine?.name ?? "-"} · {productVolume(selectedProduct)}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 bg-white">
                  {selectedSpec ? nmpaLabel(selectedSpec.nmpaType) : "-"}
                </Badge>
              </div>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase text-scm-on-surface-variant">
                  마스터
                </h3>
                <div className="divide-y divide-scm-outline-variant/40 rounded-md bg-scm-surface-container-low px-3 py-1">
                  <SpecRow label="SKU" value={selectedProduct.code} />
                  <SpecRow
                    label="제품 유형"
                    value={COSMETIC_TYPE_LABELS[selectedProduct.cosmeticType]}
                  />
                  <SpecRow label="개발일" value={formatDate(selectedProduct.devDate)} />
                  <SpecRow label="등록일" value={formatDate(selectedProduct.createdAt)} />
                  <SpecRow label="제조처" value={KOLMAR_CHINA.name} />
                </div>
              </section>

              {selectedSpec ? (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase text-scm-on-surface-variant">
                    입고·추적 사양
                  </h3>
                  <div className="divide-y divide-scm-outline-variant/40 rounded-md bg-scm-surface-container-low px-3 py-1">
                    <SpecRow label="바코드" value={selectedSpec.barcode} />
                    <SpecRow
                      label="시리얼/QR"
                      value={SERIAL_LABEL[selectedSpec.serialPolicy]}
                    />
                    <SpecRow label="LOT 포맷" value={selectedSpec.lotFormat} />
                    <SpecRow
                      label="포장 입수"
                      value={`내박스 ${selectedSpec.packaging.unitsPerInner}개 · 카톤 ${selectedSpec.packaging.unitsPerInner * selectedSpec.packaging.innersPerCarton}개`}
                    />
                    <SpecRow
                      label="팔레트"
                      value={`${selectedSpec.packaging.cartonsPerPallet}카톤`}
                    />
                    <SpecRow
                      label="단위중량"
                      value={`${selectedSpec.packaging.unitNetWeightG} g`}
                    />
                    <SpecRow
                      label="유통기한"
                      value={`제조일 +${selectedSpec.shelfLifeMonths}개월`}
                    />
                    <SpecRow
                      label="기능성"
                      value={selectedSpec.functionalClaim ?? "-"}
                    />
                    <SpecRow
                      label="표준 로스 여유"
                      value={`${selectedSpec.lossAllowancePct}%`}
                    />
                  </div>
                </section>
              ) : null}

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase text-scm-on-surface-variant">
                  콜마 발주 이력
                </h3>
                <div className="divide-y divide-scm-outline-variant/40 rounded-md bg-scm-surface-container-low px-3 py-1">
                  <SpecRow
                    label="최초 요청일"
                    value={formatDate(selectedStats.firstRequestedAt)}
                  />
                  <SpecRow
                    label="최초 확정 발주일"
                    value={formatDate(selectedStats.firstApprovedAt)}
                  />
                  <SpecRow
                    label="최근 요청일"
                    value={formatDate(selectedStats.latestRequestedAt)}
                  />
                  <SpecRow
                    label="누적 확정 발주량"
                    value={formatQty(selectedStats.approvedQty)}
                  />
                  <SpecRow
                    label="승인 전 수량"
                    value={formatQty(selectedStats.pendingQty)}
                  />
                  <SpecRow
                    label="요청 건수"
                    value={`${selectedStats.requestCount.toLocaleString("ko-KR")}건`}
                  />
                </div>
                <p className="mt-2 text-xs leading-5 text-scm-on-surface-variant">
                  최초 발주일은 제품 마스터에 직접 입력하지 않고, 확정된 제조 요청(PO)
                  이력에서 계산합니다. 이렇게 해야 제품 정보와 실제 발주 원장이
                  어긋나지 않습니다.
                </p>
              </section>

              <div className="flex flex-wrap items-center justify-end gap-1.5 border-t border-scm-outline-variant pt-3">
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
          ) : (
            <p className="py-8 text-center text-sm text-scm-on-surface-variant">
              제품을 선택하세요.
            </p>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
