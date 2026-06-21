import Link from "next/link";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { MaterialIcon } from "@/components/ui/material-icon";
import {
  CHINA_SUPPLY_NAV_GROUPS,
  CHINA_SUPPLY_NAV_ITEMS,
  getChinaSupplyNavItemByHref,
} from "@/lib/navigation";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

function findGroupLabel(href: string) {
  const item = getChinaSupplyNavItemByHref(href);
  if (!item?.groupId) return "제조·공급";
  return (
    CHINA_SUPPLY_NAV_GROUPS.find((group) => group.id === item.groupId)?.labelKey ??
    "제조·공급"
  );
}

function relatedItems(href: string) {
  const item = getChinaSupplyNavItemByHref(href);
  if (!item?.groupId) return CHINA_SUPPLY_NAV_ITEMS.slice(0, 4);
  return CHINA_SUPPLY_NAV_ITEMS.filter(
    (candidate) => candidate.groupId === item.groupId,
  );
}

export default async function ChinaSupplyMockPage({ params }: PageProps) {
  const { slug } = await params;
  const href = `/operations-2/${slug.join("/")}`;
  const item = getChinaSupplyNavItemByHref(href);
  const title = item?.labelKey ?? "제조·공급 Mockup";
  const groupLabel = findGroupLabel(href);
  const siblings = relatedItems(href);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-scm-on-surface-variant">
            <Link href="/operations-2" className="font-medium text-scm-link">
              중국 제조·공급 관리
            </Link>
            <MaterialIcon name="chevron_right" className="text-[18px]" />
            <span>{groupLabel}</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-scm-primary">
            {title}
          </h1>
          <p className="mt-1 text-sm text-scm-on-surface-variant">
            현재는 새 운영 구조의 메뉴와 화면 범위를 잡기 위한 mockup입니다.
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

      <DashboardCard
        title={`${title} 화면 초안`}
        subtitle="실제 입력 폼과 테이블은 다음 단계에서 도메인 확정 후 연결"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-scm-outline-variant bg-scm-surface-container-low p-4">
            <p className="text-xs font-semibold uppercase text-scm-on-surface-variant">
              목적
            </p>
            <p className="mt-2 text-sm text-scm-primary">
              APPLICELL Korea, Kolmar China, APPLICELL China 사이의 제조·공급
              데이터를 같은 기준으로 확인합니다.
            </p>
          </div>
          <div className="rounded-lg border border-scm-outline-variant bg-scm-surface-container-low p-4">
            <p className="text-xs font-semibold uppercase text-scm-on-surface-variant">
              주요 데이터
            </p>
            <p className="mt-2 text-sm text-scm-primary">
              제품, BOM, 제조 요청, 생산 결과, LOT/QC, 완제품 출고, 입고 검수,
              수율/E2E를 단계별로 연결합니다.
            </p>
          </div>
          <div className="rounded-lg border border-scm-outline-variant bg-scm-surface-container-low p-4">
            <p className="text-xs font-semibold uppercase text-scm-on-surface-variant">
              운영 규칙
            </p>
            <p className="mt-2 text-sm text-scm-primary">
              AP China 입고 검수가 끝나기 전까지 판매 가능 재고와 확정 지표로
              넘기지 않습니다.
            </p>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard title={`${groupLabel} 관련 메뉴`}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {siblings.map((sibling) => (
            <Link
              key={sibling.href}
              href={sibling.href}
              className="flex items-center gap-3 rounded-lg border border-scm-outline-variant bg-white p-4 text-sm hover:bg-scm-surface-container-low"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-scm-surface-container text-scm-secondary">
                <MaterialIcon name={sibling.icon} className="text-[20px]" />
              </span>
              <span className="font-medium text-scm-primary">
                {sibling.labelKey}
              </span>
            </Link>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}
