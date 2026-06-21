"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { DashboardCard, StatCard } from "@/components/ui/dashboard-card";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useMockStore } from "@/components/providers/mock-store-provider";
import {
  calcBundleGrantQty,
  formatPct,
  sortBundlesForList,
  type MaterialBundle,
} from "@/lib/mock/material-bundles";
import {
  calcBundleE2eFinal,
  calcBundleInboundAchievement,
  calcBundleYieldFinal,
} from "@/lib/mock/yield-metrics";
import { cn } from "@/lib/utils";

type SupplyStatusKey =
  | "requested"
  | "inProduction"
  | "kolmarShipped"
  | "apChinaReceived"
  | "closed";

const statusMeta: Record<
  SupplyStatusKey,
  {
    label: string;
    icon: string;
    className: string;
  }
> = {
  requested: {
    label: "제조 요청",
    icon: "assignment",
    className: "border-scm-outline-variant bg-scm-surface-container text-scm-primary",
  },
  inProduction: {
    label: "콜마 생산중",
    icon: "precision_manufacturing",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  kolmarShipped: {
    label: "콜마 출고",
    icon: "local_shipping",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  apChinaReceived: {
    label: "AP China 입고",
    icon: "inventory_2",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  closed: {
    label: "검수 마감",
    icon: "task_alt",
    className: "border-teal-200 bg-teal-50 text-teal-700",
  },
};

function resolveSupplyStatus(bundle: MaterialBundle): SupplyStatusKey {
  if (bundle.status === "closed" || bundle.status === "depleted") return "closed";
  if (bundle.receivedAtCTotal > 0) return "apChinaReceived";
  if (bundle.shippedToCTotal > 0) return "kolmarShipped";
  if (bundle.producedTotal > 0) return "inProduction";
  return "requested";
}

function requestNumber(bundle: MaterialBundle) {
  return bundle.number.replace("MB-", "MFG-");
}

function formatNumber(value: number) {
  return value.toLocaleString();
}

function pct(numerator: number, denominator: number) {
  if (denominator <= 0) return null;
  return (numerator / denominator) * 100;
}

function statusBadge(status: SupplyStatusKey) {
  const meta = statusMeta[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-semibold",
        meta.className,
      )}
    >
      <MaterialIcon name={meta.icon} className="text-[14px]" />
      {meta.label}
    </span>
  );
}

function ProgressBar({
  value,
  className,
}: {
  value: number | null;
  className?: string;
}) {
  const width = value == null ? 0 : Math.max(0, Math.min(100, value));
  return (
    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-scm-surface-container">
      <div
        className={cn("h-full rounded-full bg-scm-secondary", className)}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export default function OperatingStructure2Page() {
  const { materialBundles } = useMockStore();

  const supplyBatches = useMemo(
    () => sortBundlesForList(materialBundles),
    [materialBundles],
  );

  const metrics = useMemo(() => {
    const targetTotal = supplyBatches.reduce((sum, b) => sum + b.targetQty, 0);
    const bomGrantTotal = supplyBatches.reduce(
      (sum, b) => sum + calcBundleGrantQty(b),
      0,
    );
    const producedTotal = supplyBatches.reduce(
      (sum, b) => sum + b.producedTotal,
      0,
    );
    const kolmarShippedTotal = supplyBatches.reduce(
      (sum, b) => sum + b.shippedToCTotal,
      0,
    );
    const apChinaReceivedTotal = supplyBatches.reduce(
      (sum, b) => sum + b.receivedAtCTotal,
      0,
    );
    const inboundHoldQty = supplyBatches.reduce(
      (sum, b) => sum + Math.max(0, b.shippedToCTotal - b.receivedAtCTotal),
      0,
    );

    return {
      activeRequests: supplyBatches.filter((b) => b.status !== "closed").length,
      targetTotal,
      bomGrantTotal,
      producedTotal,
      kolmarShippedTotal,
      apChinaReceivedTotal,
      inboundHoldQty,
      inboundAchievement: pct(apChinaReceivedTotal, targetTotal),
      kolmarShipRate: pct(kolmarShippedTotal, targetTotal),
    };
  }, [supplyBatches]);

  const flowStages = [
    {
      title: "APPLICELL Korea",
      subtitle: "브랜드/IP · 제품기획 · BOM · 제조 요청",
      value: formatNumber(metrics.targetTotal),
      label: "제조 목표",
      icon: "business_center",
    },
    {
      title: "Kolmar China",
      subtitle: "외부 제조처 · 생산 결과/출고 자료 등록",
      value: formatNumber(metrics.kolmarShippedTotal),
      label: "완제품 출고",
      icon: "factory",
    },
    {
      title: "APPLICELL China",
      subtitle: "입고 검수 · 판매 가능 재고 전환",
      value: formatNumber(metrics.apChinaReceivedTotal),
      label: "검증 입고",
      icon: "warehouse",
    },
  ];

  const checkpoints = [
    {
      step: "제조 요청 승인",
      owner: "APPLICELL Korea",
      data: "제품, BOM snapshot, 목표 수량, 제조 요청 번호",
      rule: "승인 뒤 BOM과 목표 수량을 제조 요청 기준으로 고정",
    },
    {
      step: "콜마 생산 결과 등록",
      owner: "APPLICELL 운영자",
      data: "생산 수량, 불량/QC, batch, 출고 예정 수량",
      rule: "콜마가 직접 쓰는 계정이 아니라 받은 자료를 내부에서 등록",
    },
    {
      step: "AP China 입고 검수",
      owner: "APPLICELL China",
      data: "실입고 수량, batch/serial/QR, 사진, 시간, 담당자",
      rule: "입고 미확정 수량은 판매 가능 재고와 정산 기준에서 제외",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-scm-primary">
              중국 제조·공급 관리
            </h1>
            <Badge variant="outline" className="bg-white">
              1차 범위
            </Badge>
          </div>
          <p className="mt-1 text-sm text-scm-on-surface-variant">
            APPLICELL Korea 제조 요청부터 Kolmar China 생산·출고, APPLICELL China
            입고 검수까지 관리합니다.
          </p>
        </div>
        <Link
          href="/operations/yield-overview"
          className="inline-flex h-9 items-center gap-1 rounded-md border border-scm-outline-variant bg-white px-3 text-sm font-medium text-scm-primary hover:bg-scm-surface-container"
        >
          <MaterialIcon name="swap_horiz" className="text-[18px]" />
          기존 운영 구조
        </Link>
      </div>

      <div className="rounded-lg border border-scm-outline-variant bg-scm-surface-container-low px-4 py-3 text-sm text-scm-on-surface-variant">
        <div className="flex items-start gap-3">
          <MaterialIcon
            name="info"
            className="mt-0.5 shrink-0 text-[20px] text-scm-secondary"
          />
          <p>
            콜마는 시스템 사용자보다 외부 제조처로 다룹니다. APPLICELL 운영자가
            콜마 제조 자료를 등록하고, AP China 입고 검수 후에만 판매 가능 재고로
            전환합니다.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="진행 제조 요청"
          value={`${metrics.activeRequests}건`}
          hint="planned/active/depleted 포함"
          accent="blue"
        />
        <StatCard
          label="BOM 산출 기준량"
          value={formatNumber(metrics.bomGrantTotal)}
          hint="목표 + 로스 여유"
          accent="default"
        />
        <StatCard
          label="AP China 검증 입고"
          value={formatNumber(metrics.apChinaReceivedTotal)}
          hint={`목표 대비 ${formatPct(metrics.inboundAchievement)}`}
          accent="green"
        />
        <StatCard
          label="입고 보류 수량"
          value={formatNumber(metrics.inboundHoldQty)}
          hint="콜마 출고 - AP China 입고"
          accent={metrics.inboundHoldQty > 0 ? "amber" : "teal"}
        />
      </div>

      <section className="rounded-lg border border-scm-outline-variant bg-white p-5">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto_1fr_auto_1fr] xl:items-stretch">
          {flowStages.map((stage, index) => (
            <div key={stage.title} className="contents">
              <div className="flex min-h-[150px] flex-col justify-between rounded-lg border border-scm-outline-variant bg-scm-surface-container-low p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-scm-secondary">
                      <MaterialIcon name={stage.icon} className="text-[21px]" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-scm-primary">
                        {stage.title}
                      </h2>
                      <p className="mt-0.5 text-xs text-scm-on-surface-variant">
                        {stage.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-scm-on-surface-variant">
                    {stage.label}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-scm-primary">
                    {stage.value}
                  </p>
                </div>
              </div>
              {index < flowStages.length - 1 ? (
                <div className="hidden items-center px-1 text-scm-on-surface-variant xl:flex">
                  <MaterialIcon name="arrow_forward" className="text-[24px]" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.75fr)]">
        <DashboardCard
          title="제조 요청·입고 현황"
          subtitle="기존 물량 데이터를 신규 제조·공급 구조로 해석한 목록"
        >
          <div className="-mx-1 overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-scm-outline-variant/60 bg-[#F8F9FA] text-left text-[11px] font-semibold uppercase text-scm-on-surface-variant">
                  <th className="px-3 py-3">요청</th>
                  <th className="px-3 py-3">제품</th>
                  <th className="px-3 py-3 text-right">목표</th>
                  <th className="px-3 py-3 text-right">BOM 기준</th>
                  <th className="px-3 py-3 text-right">콜마 생산</th>
                  <th className="px-3 py-3 text-right">AP China 입고</th>
                  <th className="px-3 py-3">상태</th>
                  <th className="px-3 py-3 text-right">수율/E2E</th>
                </tr>
              </thead>
              <tbody>
                {supplyBatches.map((bundle) => {
                  const status = resolveSupplyStatus(bundle);
                  const inbound = calcBundleInboundAchievement(bundle);
                  const finalYield = calcBundleYieldFinal(bundle);
                  const finalE2e = calcBundleE2eFinal(bundle);
                  const pendingInbound = Math.max(
                    0,
                    bundle.shippedToCTotal - bundle.receivedAtCTotal,
                  );

                  return (
                    <tr
                      key={bundle.id}
                      className="border-b border-scm-outline-variant/40 last:border-0"
                    >
                      <td className="px-3 py-3 align-top">
                        <p className="font-semibold text-scm-primary">
                          {requestNumber(bundle)}
                        </p>
                        <p className="mt-0.5 text-xs text-scm-on-surface-variant">
                          {bundle.poWoRef ?? "제조 요청서 준비중"}
                        </p>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <p className="font-medium text-scm-primary">
                          {bundle.productName}
                        </p>
                        <p className="mt-0.5 text-xs text-scm-on-surface-variant">
                          {bundle.sku}
                          {bundle.lineName ? ` · ${bundle.lineName}` : ""}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-right align-top tabular-nums">
                        {formatNumber(bundle.targetQty)}
                      </td>
                      <td className="px-3 py-3 text-right align-top tabular-nums">
                        {formatNumber(calcBundleGrantQty(bundle))}
                      </td>
                      <td className="px-3 py-3 align-top">
                        <div className="text-right tabular-nums">
                          {formatNumber(bundle.producedTotal)}
                        </div>
                        <ProgressBar
                          value={pct(bundle.producedTotal, bundle.targetQty)}
                          className="bg-blue-500"
                        />
                      </td>
                      <td className="px-3 py-3 align-top">
                        <div className="text-right tabular-nums">
                          {formatNumber(bundle.receivedAtCTotal)}
                        </div>
                        <ProgressBar value={inbound} className="bg-emerald-500" />
                        {pendingInbound > 0 ? (
                          <p className="mt-1 text-right text-xs text-amber-700">
                            보류 {formatNumber(pendingInbound)}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 align-top">{statusBadge(status)}</td>
                      <td className="px-3 py-3 text-right align-top text-xs tabular-nums text-scm-on-surface-variant">
                        <p>수율 {formatPct(finalYield)}</p>
                        <p className="mt-1">E2E {formatPct(finalE2e)}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DashboardCard>

        <DashboardCard
          title="기존 지표 재사용"
          subtitle="용어만 새 구조에 맞게 바꾸고 계산식은 유지"
        >
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-scm-primary">BOM 기준량</p>
              <p className="mt-1 text-scm-on-surface-variant">
                APPLICELL Korea가 제조 요청을 낼 때 목표 수량과 로스 여유를
                고정합니다.
              </p>
            </div>
            <div>
              <p className="font-semibold text-scm-primary">수율</p>
              <p className="mt-1 text-scm-on-surface-variant">
                마감 후 AP China 검증 입고량 ÷ BOM 산출 기준량으로 표시합니다.
              </p>
            </div>
            <div>
              <p className="font-semibold text-scm-primary">E2E</p>
              <p className="mt-1 text-scm-on-surface-variant">
                마감 후 AP China 검증 입고량 ÷ APPLICELL Korea 제조 목표로
                표시합니다.
              </p>
            </div>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard
        title="검수 체크포인트"
        subtitle="각 단계의 데이터가 확인되기 전까지 다음 운영 기준으로 넘기지 않습니다"
      >
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-scm-outline-variant/60 bg-[#F8F9FA] text-left text-[11px] font-semibold uppercase text-scm-on-surface-variant">
                <th className="px-3 py-3">단계</th>
                <th className="px-3 py-3">담당</th>
                <th className="px-3 py-3">필수 데이터</th>
                <th className="px-3 py-3">운영 규칙</th>
              </tr>
            </thead>
            <tbody>
              {checkpoints.map((item) => (
                <tr
                  key={item.step}
                  className="border-b border-scm-outline-variant/40 last:border-0"
                >
                  <td className="px-3 py-3 font-semibold text-scm-primary">
                    {item.step}
                  </td>
                  <td className="px-3 py-3 text-scm-on-surface-variant">
                    {item.owner}
                  </td>
                  <td className="px-3 py-3 text-scm-on-surface-variant">
                    {item.data}
                  </td>
                  <td className="px-3 py-3 text-scm-on-surface-variant">
                    {item.rule}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  );
}
