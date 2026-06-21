"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useChinaSupplyStore } from "@/components/providers/china-supply-store-provider";
import type { McAuditAction } from "@/lib/mock/china-supply/manufacturing-requests";

const ACTION_META: Record<McAuditAction, { icon: string; className: string }> = {
  작성: { icon: "edit_note", className: "text-scm-on-surface-variant" },
  수정: { icon: "edit", className: "text-scm-on-surface-variant" },
  제출: { icon: "send", className: "text-amber-700" },
  확정: { icon: "check_circle", className: "text-emerald-700" },
  취소: { icon: "cancel", className: "text-red-700" },
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ManufacturingRequestHistoryPage() {
  const { requests } = useChinaSupplyStore();

  const events = useMemo(() => {
    return requests
      .flatMap((req) =>
        req.audit.map((e) => ({ ...e, number: req.number, requestId: req.id })),
      )
      .sort((a, b) => (a.at < b.at ? 1 : -1));
  }, [requests]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-scm-on-surface-variant">
          <Link href="/operations-2/requests" className="font-medium text-scm-link">
            제조 요청
          </Link>
          <MaterialIcon name="chevron_right" className="text-[18px]" />
          <span>변경 이력</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-scm-primary">
            요청 변경 이력
          </h1>
          <Badge variant="outline" className="bg-white">
            감사 로그 · 추가 전용
          </Badge>
        </div>
        <p className="mt-1 text-sm text-scm-on-surface-variant">
          모든 작성·제출·확정·취소가 시간순으로 남습니다. 수정·삭제되지 않습니다.
        </p>
      </div>

      <DashboardCard title="감사 이벤트" subtitle={`${events.length}건`}>
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-scm-outline-variant/60 bg-[#F8F9FA] text-left text-[11px] font-semibold uppercase text-scm-on-surface-variant">
                <th className="px-3 py-2.5">시각</th>
                <th className="px-3 py-2.5">발주번호</th>
                <th className="px-3 py-2.5">동작</th>
                <th className="px-3 py-2.5">담당</th>
                <th className="px-3 py-2.5">비고</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => {
                const meta = ACTION_META[e.action];
                return (
                  <tr
                    key={`${e.requestId}-${i}`}
                    className="border-b border-scm-outline-variant/40 last:border-0"
                  >
                    <td className="px-3 py-2.5 align-top tabular-nums text-scm-on-surface-variant">
                      {formatDateTime(e.at)}
                    </td>
                    <td className="px-3 py-2.5 align-top font-medium text-scm-primary">
                      {e.number}
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <span className="inline-flex items-center gap-1.5 font-medium text-scm-primary">
                        <MaterialIcon name={meta.icon} className={`text-[17px] ${meta.className}`} />
                        {e.action}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 align-top text-scm-on-surface-variant">
                      {e.actorLabel}
                    </td>
                    <td className="px-3 py-2.5 align-top text-xs text-scm-on-surface-variant">
                      {e.detail ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {events.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-scm-on-surface-variant">
            이력이 없습니다.
          </p>
        ) : null}
      </DashboardCard>
    </div>
  );
}
