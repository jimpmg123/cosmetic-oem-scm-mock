"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useRole } from "@/components/providers/role-provider";
import {
  canApproveChinaCatalog,
  canEditChinaCatalog,
} from "@/lib/role-access";
import { CHINA_SUPPLY_CATALOG } from "@/lib/mock/china-supply/applicell-catalog";
import { COSMETIC_TYPE_LABELS } from "@/lib/mock/product-catalog";
import { cn } from "@/lib/utils";

/** 주성분/기능성 표시 (itemCode 기준) */
const FUNCTIONAL_CODES = new Set(["RM-ADENOSINE"]);
const KEY_ACTIVE_CODES = new Set(["RM-ADENOSINE", "RM-POONGRAN", "RM-EXOSOME"]);

function activeBadge(itemCode: string) {
  if (FUNCTIONAL_CODES.has(itemCode)) {
    return <Badge variant="success">기능성 주성분</Badge>;
  }
  if (KEY_ACTIVE_CODES.has(itemCode)) {
    return <Badge variant="outline">주성분</Badge>;
  }
  return null;
}

export default function ChinaBomPage() {
  const { role } = useRole();
  const canEdit = canEditChinaCatalog(role);
  const canApprove = canApproveChinaCatalog(role);

  const { products } = CHINA_SUPPLY_CATALOG;
  const [selectedId, setSelectedId] = useState(products[0]?.id ?? "");
  const product = products.find((p) => p.id === selectedId) ?? products[0];

  const percentTotal = product
    ? product.bom.reduce((sum, b) => sum + (b.percent ?? 0), 0)
    : 0;
  const qtyTotal = product
    ? product.bom.reduce((sum, b) => sum + b.qtyPerUnit, 0)
    : 0;
  const volume = product?.productVolume;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-scm-primary">
              BOM 기준
            </h1>
            <Badge variant="outline" className="bg-white">
              APPLICELL Korea 전용 · IP
            </Badge>
          </div>
          <p className="mt-1 text-sm text-scm-on-surface-variant">
            제품 1단위 배합 명세 — 원가 산정·품질 검증·전성분(인허가)의 기준. 배합은
            한국만 보며 중국에는 비공개입니다.
          </p>
        </div>
        <Link
          href="/operations-2/catalog"
          className="inline-flex h-9 items-center gap-1 rounded-md border border-scm-outline-variant bg-white px-3 text-sm font-medium text-scm-primary hover:bg-scm-surface-container"
        >
          <MaterialIcon name="category" className="text-[18px]" />
          제품 카탈로그
        </Link>
      </div>

      {/* 제품 선택 */}
      <div className="flex flex-wrap gap-2">
        {products.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedId(p.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              p.id === selectedId
                ? "border-scm-secondary bg-scm-secondary/10 text-scm-primary"
                : "border-scm-outline-variant bg-white text-scm-on-surface-variant hover:bg-scm-surface-container-low",
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      {product ? (
        <DashboardCard
          title={`${product.name} 배합표`}
          subtitle={`${product.code} · ${COSMETIC_TYPE_LABELS[product.cosmeticType]} · ${
            volume ? `${volume.value}${volume.unit}` : "—"
          }`}
          action={
            <div className="flex items-center gap-1.5">
              {canEdit ? (
                <button
                  type="button"
                  disabled
                  title="다음 단계: 입력 폼 연결"
                  className="inline-flex h-8 cursor-not-allowed items-center gap-1 rounded-md border border-scm-outline-variant bg-white px-2.5 text-xs font-medium text-scm-on-surface-variant opacity-70"
                >
                  <MaterialIcon name="edit" className="text-[16px]" />
                  배합 수정
                </button>
              ) : null}
              {canApprove ? (
                <button
                  type="button"
                  disabled
                  title="다음 단계: 승인·스냅샷 잠금 연결"
                  className="inline-flex h-8 cursor-not-allowed items-center gap-1 rounded-md border border-scm-outline-variant bg-white px-2.5 text-xs font-medium text-scm-on-surface-variant opacity-70"
                >
                  <MaterialIcon name="lock" className="text-[16px]" />
                  승인·잠금
                </button>
              ) : null}
            </div>
          }
        >
          <div className="-mx-1 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-scm-outline-variant/60 bg-[#F8F9FA] text-left text-[11px] font-semibold uppercase text-scm-on-surface-variant">
                  <th className="px-3 py-2.5 w-10 text-right">#</th>
                  <th className="px-3 py-2.5">원료 (INCI)</th>
                  <th className="px-3 py-2.5">자재코드</th>
                  <th className="px-3 py-2.5 text-right">배합 %</th>
                  <th className="px-3 py-2.5 text-right">함량</th>
                </tr>
              </thead>
              <tbody>
                {product.bom.map((b, i) => (
                  <tr
                    key={b.id}
                    className="border-b border-scm-outline-variant/40 last:border-0"
                  >
                    <td className="px-3 py-2 text-right tabular-nums text-scm-on-surface-variant">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-scm-primary">{b.itemName}</span>
                        {activeBadge(b.itemCode)}
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-scm-on-surface-variant">
                      {b.itemCode}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {(b.percent ?? 0).toLocaleString("ko-KR", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}
                      %
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {b.qtyPerUnit} {b.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-scm-outline-variant/70 font-semibold text-scm-primary">
                  <td className="px-3 py-2.5" colSpan={3}>
                    합계
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {percentTotal.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}%
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {qtyTotal.toLocaleString("ko-KR", { maximumFractionDigits: 3 })}{" "}
                    {volume?.unit ?? "ml"}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-lg border border-scm-outline-variant bg-scm-surface-container-low px-4 py-3 text-sm text-scm-on-surface-variant">
            <MaterialIcon
              name="info"
              className="mt-0.5 shrink-0 text-[20px] text-scm-secondary"
            />
            <p>
              콜마가 원료를 <span className="font-medium text-scm-primary">일괄 구매</span>하므로
              APPLICELL은 완제품 수량으로 <span className="font-medium text-scm-primary">발주(PO)</span>합니다.
              BOM은 자재 발주가 아니라{" "}
              <span className="font-medium text-scm-primary">원가 산정·품질 검증·전성분 표시</span>의 기준이며,
              수율/E2E는 발주(목표) 대비 AP China 검증 입고로 봅니다.
            </p>
          </div>
        </DashboardCard>
      ) : null}
    </div>
  );
}
