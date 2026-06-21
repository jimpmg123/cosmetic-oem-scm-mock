"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useMockStore } from "@/components/providers/mock-store-provider";
import {
  calcBundleGrantQty,
  formatPct,
  getDday,
  sortBundlesForList,
} from "@/lib/mock/material-bundles";
import { calcBundleInboundAchievement } from "@/lib/mock/yield-metrics";
import { cn } from "@/lib/utils";

type SignalTone = "green" | "yellow" | "red" | "neutral";

const toneMeta: Record<
  SignalTone,
  {
    label: string;
    icon: string;
    badge: "success" | "warning" | "danger" | "outline";
    className: string;
    iconClassName: string;
  }
> = {
  green: {
    label: "정상",
    icon: "check_circle",
    badge: "success",
    className: "border-emerald-200 bg-emerald-50",
    iconClassName: "text-emerald-700",
  },
  yellow: {
    label: "주의",
    icon: "error",
    badge: "warning",
    className: "border-amber-200 bg-amber-50",
    iconClassName: "text-amber-700",
  },
  red: {
    label: "위험",
    icon: "warning",
    badge: "danger",
    className: "border-red-200 bg-red-50",
    iconClassName: "text-red-700",
  },
  neutral: {
    label: "연결 전",
    icon: "pending",
    badge: "outline",
    className: "border-scm-outline-variant bg-scm-surface-container-low",
    iconClassName: "text-scm-on-surface-variant",
  },
};

function formatNumber(value: number) {
  return value.toLocaleString("ko-KR");
}

function formatEok(won: number) {
  const eok = won / 100_000_000;
  return `${eok.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}억`;
}

function pct(numerator: number, denominator: number) {
  if (denominator <= 0) return null;
  return (numerator / denominator) * 100;
}

function revenueSignal(value: number | null): SignalTone {
  if (value == null) return "neutral";
  if (value >= 95) return "green";
  if (value >= 85) return "yellow";
  return "red";
}

function supplySignal(value: number | null): SignalTone {
  if (value == null) return "neutral";
  if (value >= 97) return "green";
  if (value >= 92) return "yellow";
  return "red";
}

function riskSignal(count: number): SignalTone {
  if (count === 0) return "green";
  if (count <= 2) return "yellow";
  return "red";
}

function SignalCard({
  title,
  value,
  detail,
  tone,
}: {
  title: string;
  value: string;
  detail: string;
  tone: SignalTone;
}) {
  const meta = toneMeta[tone];
  return (
    <div className={cn("rounded-xl border p-4", meta.className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-scm-on-surface-variant">
            {title}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-scm-primary">
            {value}
          </p>
        </div>
        <MaterialIcon name={meta.icon} className={cn("text-[26px]", meta.iconClassName)} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant={meta.badge}>{meta.label}</Badge>
        <span className="text-xs text-scm-on-surface-variant">{detail}</span>
      </div>
    </div>
  );
}

function MetricLine({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: SignalTone;
}) {
  const meta = toneMeta[tone];
  return (
    <div className="grid gap-2 border-b border-scm-outline-variant/50 py-3 last:border-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <p className="font-medium text-scm-primary">{label}</p>
        {hint ? (
          <p className="mt-0.5 text-xs text-scm-on-surface-variant">{hint}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-2 sm:justify-end">
        <span className="font-semibold tabular-nums text-scm-primary">{value}</span>
        <MaterialIcon name={meta.icon} className={cn("text-[18px]", meta.iconClassName)} />
      </div>
    </div>
  );
}

function ProgressLine({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: number | null;
  detail: string;
  tone: SignalTone;
}) {
  const width = value == null ? 0 : Math.max(0, Math.min(100, value));
  const barClass = {
    green: "bg-emerald-600",
    yellow: "bg-amber-500",
    red: "bg-red-600",
    neutral: "bg-scm-on-surface-variant",
  }[tone];

  return (
    <div className="py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-scm-primary">{label}</p>
        <p className="text-sm font-semibold tabular-nums text-scm-primary">
          {formatPct(value)}
        </p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-scm-surface-container">
        <div className={cn("h-full rounded-full", barClass)} style={{ width: `${width}%` }} />
      </div>
      <p className="mt-1 text-xs text-scm-on-surface-variant">{detail}</p>
    </div>
  );
}

export default function ExecutiveOverviewPage() {
  const { materialBundles } = useMockStore();

  const metrics = useMemo(() => {
    const bundles = sortBundlesForList(materialBundles);
    const monthlyPlanSets = 10_000;
    const annualRevenuePlan = 12_000_000_000;
    const annualOperatingProfitPlan = 1_800_000_000;
    const dividendPlan = annualOperatingProfitPlan * 0.5;
    const targetTotal = bundles.reduce((sum, bundle) => sum + bundle.targetQty, 0);
    const grantTotal = bundles.reduce((sum, bundle) => sum + calcBundleGrantQty(bundle), 0);
    const producedTotal = bundles.reduce((sum, bundle) => sum + bundle.producedTotal, 0);
    const shippedTotal = bundles.reduce((sum, bundle) => sum + bundle.shippedToCTotal, 0);
    const receivedTotal = bundles.reduce((sum, bundle) => sum + bundle.receivedAtCTotal, 0);
    const inboundHoldQty = bundles.reduce(
      (sum, bundle) => sum + Math.max(0, bundle.shippedToCTotal - bundle.receivedAtCTotal),
      0,
    );
    const supplyReadinessPct = pct(receivedTotal, monthlyPlanSets);
    const inboundAchievement = pct(receivedTotal, targetTotal);
    const productionProgress = pct(producedTotal, targetTotal);
    const kolmarShipProgress = pct(shippedTotal, targetTotal);
    const expiringSoonQty = bundles
      .filter((bundle) => {
        const dday = getDday(bundle.useByDate, new Date(2026, 5, 21));
        return dday >= 0 && dday <= 60;
      })
      .reduce((sum, bundle) => sum + bundle.receivedAtCTotal, 0);
    const activeIssueCount =
      (inboundHoldQty > 0 ? 1 : 0) +
      (supplyReadinessPct != null && supplyReadinessPct < 85 ? 1 : 0);

    return {
      monthlyPlanSets,
      annualRevenuePlan,
      annualOperatingProfitPlan,
      dividendPlan,
      targetTotal,
      grantTotal,
      producedTotal,
      shippedTotal,
      receivedTotal,
      inboundHoldQty,
      supplyReadinessPct,
      inboundAchievement,
      productionProgress,
      kolmarShipProgress,
      expiringSoonQty,
      activeIssueCount,
    };
  }, [materialBundles]);

  const revenueTone = revenueSignal(metrics.supplyReadinessPct);
  const supplyTone = supplySignal(metrics.inboundAchievement);
  const riskTone = riskSignal(metrics.activeIssueCount);

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-scm-primary">
              Executive Overview
            </h1>
            <Badge variant="outline" className="bg-white">
              경영진용
            </Badge>
          </div>
          <p className="mt-1 max-w-3xl text-sm text-scm-on-surface-variant">
            전체 중국 사업이 계획대로 돈을 만들고 있는지, 그 매출이 검증 판매인지,
            치명 리스크가 있는지만 빠르게 봅니다.
          </p>
        </div>
        <div className="rounded-lg border border-scm-outline-variant bg-white px-3 py-2 text-xs text-scm-on-surface-variant">
          1차 mock: 공급 건전성 중심 · 유통/판매 데이터는 2차 연결
        </div>
      </div>

      <section className="grid gap-3 lg:grid-cols-3">
        <SignalCard
          title="계획 대비 매출"
          value={formatPct(metrics.supplyReadinessPct)}
          detail="주문·결제 미연동, AP China 입고 기준 대체"
          tone={revenueTone}
        />
        <SignalCard
          title="검증 판매율"
          value="P2 예정"
          detail="소비자 결제·수령·반품기간 데이터 필요"
          tone="neutral"
        />
        <SignalCard
          title="치명 리스크"
          value={`${metrics.activeIssueCount}건`}
          detail="입고 보류와 월 계획 미달 신호 기준"
          tone={riskTone}
        />
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardCard
          title="재무 결과"
          subtitle="PDF 사업계획의 1차년도 모델과 현재 공급 준비율을 같이 표시"
        >
          <MetricLine
            label="연간 매출 계획"
            value={formatEok(metrics.annualRevenuePlan)}
            hint="PDF 1차년도 계획"
            tone="neutral"
          />
          <MetricLine
            label="영업이익 계획"
            value={formatEok(metrics.annualOperatingProfitPlan)}
            hint="연 매출 대비 15% 모델"
            tone="neutral"
          />
          <MetricLine
            label="배당 가능액"
            value={formatEok(metrics.dividendPlan)}
            hint="영업이익 50% 기준"
            tone="neutral"
          />
          <MetricLine
            label="월 계획 대비 판매 가능 재고 준비"
            value={`${formatNumber(metrics.receivedTotal)} / ${formatNumber(metrics.monthlyPlanSets)}`}
            hint="주문/결제 전까지 매출 대체 지표로만 사용"
            tone={revenueTone}
          />
        </DashboardCard>

        <DashboardCard
          title="성장 궤적"
          subtitle="거래처 확장과 재구매는 2차 유통·판매 모델에서 연결"
        >
          <MetricLine
            label="월 판매 세트 계획곡선"
            value="10,000 → 65,536"
            hint="초기 월 1만 세트에서 성장 시나리오"
            tone="neutral"
          />
          <MetricLine
            label="현재 공급 준비 세트"
            value={formatNumber(metrics.receivedTotal)}
            hint="AP China 검증 입고 기준"
            tone={revenueTone}
          />
          <MetricLine
            label="활성 거래처·지역 확장"
            value="P2 예정"
            hint="공식 거래처와 지역별 검증 판매 데이터 필요"
            tone="neutral"
          />
          <MetricLine
            label="재구매율"
            value="P2 예정"
            hint="소비자 주문 이력 연결 후 산출"
            tone="neutral"
          />
        </DashboardCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <DashboardCard
          title="공급 건전성"
          subtitle="Kolmar China 출고부터 AP China 검증 입고까지의 P1 지표"
        >
          <ProgressLine
            label="제조 진행률"
            value={metrics.productionProgress}
            detail={`${formatNumber(metrics.producedTotal)} / ${formatNumber(metrics.targetTotal)} 생산`}
            tone={supplySignal(metrics.productionProgress)}
          />
          <ProgressLine
            label="콜마 출고 진행률"
            value={metrics.kolmarShipProgress}
            detail={`${formatNumber(metrics.shippedTotal)} / ${formatNumber(metrics.targetTotal)} 출고`}
            tone={supplySignal(metrics.kolmarShipProgress)}
          />
          <ProgressLine
            label="AP China 입고 달성"
            value={metrics.inboundAchievement}
            detail={`${formatNumber(metrics.receivedTotal)} / ${formatNumber(metrics.targetTotal)} 검증 입고`}
            tone={supplyTone}
          />
          <MetricLine
            label="입고 보류 수량"
            value={formatNumber(metrics.inboundHoldQty)}
            hint="콜마 출고 수량과 AP China 입고 수량 차이"
            tone={metrics.inboundHoldQty > 0 ? "yellow" : "green"}
          />
          <MetricLine
            label="60일 내 유통기한 주의 재고"
            value={formatNumber(metrics.expiringSoonQty)}
            hint={`BOM 산출 기준량 ${formatNumber(metrics.grantTotal)} 대비 별도 점검`}
            tone={metrics.expiringSoonQty > 0 ? "yellow" : "green"}
          />
        </DashboardCard>

        <DashboardCard
          title="채널 무결성 / 리스크"
          subtitle="검증 판매와 채널 이탈 감시는 2차 주문·QR·외부몰 데이터가 필요"
        >
          <div className="grid gap-x-5 md:grid-cols-2">
            <MetricLine
              label="검증 판매율"
              value="P2 예정"
              hint="검증 판매 ÷ 공식 채널 출고"
              tone="neutral"
            />
            <MetricLine
              label="채널 재고 적체"
              value="P2 예정"
              hint="거래처 매입과 실제 소비자 판매 차이"
              tone="neutral"
            />
            <MetricLine
              label="정품 QR 지역 이탈"
              value="P2 예정"
              hint="시리얼 스캔 위치와 배정 채널 비교"
              tone="neutral"
            />
            <MetricLine
              label="정산 보류·반품"
              value="P2 예정"
              hint="검증 판매 전 정산 확정 방지"
              tone="neutral"
            />
            <MetricLine
              label="매출 집중도"
              value="P2 예정"
              hint="상위 거래처 매출 비중"
              tone="neutral"
            />
          </div>
        </DashboardCard>
      </div>

      <DashboardCard
        title="컴플라이언스 신호"
      >
        <div className="grid gap-x-6 lg:grid-cols-2">
          <MetricLine
            label="정산 기준"
            value="설계 필요"
            hint="소비자 결제, 수령 확인, 반품기간 통과 후 확정"
            tone="yellow"
          />
          <MetricLine
            label="용어 표기"
            value="운영 용어"
            hint="거래처, 검증 판매, 정산, 채널 무결성 중심"
            tone="green"
          />
          <MetricLine
            label="단일 제조처 의존"
            value="Kolmar China"
            hint="대체 제조처나 백업 플랜은 별도 관리 필요"
            tone="yellow"
          />
          <MetricLine
            label="미해결 분쟁·클레임"
            value="P2 예정"
            hint="입고 차이, 외부몰 적발, 정산 보류를 통합"
            tone="neutral"
          />
        </div>
      </DashboardCard>
    </div>
  );
}
