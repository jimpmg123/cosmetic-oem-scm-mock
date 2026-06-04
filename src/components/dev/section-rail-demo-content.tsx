"use client";

import { CollapsibleSection } from "@/components/material-bundles/bundle-sections";

const DEMO_SECTIONS = [
  { id: "demo-summary", title: "요약 · 도넛 KPI", summary: "E2E · Production 수율" },
  { id: "demo-basic", title: "기본 정보", summary: "SKU · 목표 · 사용 기간" },
  { id: "demo-shipment", title: "원자재 출하", summary: "환산 출하량 · 출하일" },
  { id: "demo-timeline", title: "타임라인", summary: "생성 · 출하 · 착수 · 지시" },
  { id: "demo-reconciliation", title: "대사", summary: "수율 카드 · B↔C 차이" },
  { id: "demo-directives", title: "기간 지시", summary: "지시 목록 embedded" },
  { id: "demo-daily", title: "일별 생산", summary: "B 일지 read-only" },
] as const;

function LoremBlock({ paragraphs = 4 }: { paragraphs?: number }) {
  const text =
    "이 블록은 스크롤과 섹션 앵커를 테스트하기 위한 placeholder입니다. 관리 페이지처럼 섹션이 길어질 때 우측 레일로 점프할 수 있는지 확인합니다.";
  return (
    <div className="space-y-3 text-sm leading-relaxed text-scm-on-surface-variant">
      {Array.from({ length: paragraphs }, (_, i) => (
        <p key={i}>{text}</p>
      ))}
    </div>
  );
}

export function SectionRailDemoContent() {
  return (
    <div className="mx-auto max-w-3xl space-y-0 pb-32 pr-10">
      <header className="mb-8 border-b border-scm-outline-variant pb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-scm-on-surface-variant">
          Dev · UI test
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-scm-primary">
          Section rail navigation
        </h1>
        <p className="mt-2 text-sm text-scm-on-surface-variant">
          화면 <strong className="text-scm-primary">우측 가장자리</strong>에 마우스를
          올리면 섹션 목록이 나타납니다. 항목을 클릭하면 해당 섹션 맨 위로
          스크롤됩니다. (ChatGPT 문서 우측 바와 유사)
        </p>
      </header>

      {DEMO_SECTIONS.map((section, index) => (
        <CollapsibleSection
          key={section.id}
          id={section.id}
          title={section.title}
          summary={section.summary}
          defaultOpen={index < 2}
        >
          <LoremBlock paragraphs={index % 2 === 0 ? 5 : 3} />
        </CollapsibleSection>
      ))}
    </div>
  );
}

export const SECTION_RAIL_DEMO_ITEMS = DEMO_SECTIONS.map((s) => ({
  id: s.id,
  label: s.title,
}));
