"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useRole } from "@/components/providers/role-provider";
import { useChinaSupplyStore } from "@/components/providers/china-supply-store-provider";
import { canApproveMfgRequest, canCreateMfgRequest } from "@/lib/role-access";
import {
  MC_STATUS_META,
  sumRequestQty,
  type ManufacturingRequest,
} from "@/lib/mock/china-supply/manufacturing-requests";

const TONE_VARIANT = {
  neutral: "outline",
  amber: "warning",
  green: "success",
  red: "danger",
} as const;

function statusBadge(status: ManufacturingRequest["status"]) {
  const meta = MC_STATUS_META[status];
  return <Badge variant={TONE_VARIANT[meta.tone]}>{meta.label}</Badge>;
}

function productSummary(req: ManufacturingRequest) {
  if (req.lines.length === 0) return "—";
  const [first, ...rest] = req.lines;
  return rest.length > 0 ? `${first.productName} 외 ${rest.length}건` : first.productName;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function ManufacturingRequestsPage() {
  const { role } = useRole();
  const canCreate = canCreateMfgRequest(role);
  const canApprove = canApproveMfgRequest(role);
  const { requests, submitRequest, approveRequest, cancelRequest } =
    useChinaSupplyStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-scm-primary">
              제조 요청 (발주)
            </h1>
            <Badge variant="outline" className="bg-white">
              Kolmar China
            </Badge>
          </div>
          <p className="mt-1 text-sm text-scm-on-surface-variant">
            완제품 수량으로 콜마에 발주(PO)합니다. 작성·제출(실무)과 확정(최고관리자)은
            서로 다른 담당이 맡습니다.
          </p>
        </div>
        {canCreate ? (
          <Link
            href="/operations-2/requests/new"
            className="inline-flex h-9 items-center gap-1 rounded-md bg-scm-secondary px-3 text-sm font-semibold text-white hover:bg-scm-secondary/90"
          >
            <MaterialIcon name="add_circle" className="text-[18px]" />
            새 제조 요청
          </Link>
        ) : null}
      </div>

      <DashboardCard
        title="제조 요청 목록"
        subtitle="상태별로 다음 단계(제출·확정)를 진행합니다"
        action={
          <Link
            href="/operations-2/requests/history"
            className="inline-flex h-8 items-center gap-1 rounded-md border border-scm-outline-variant bg-white px-2.5 text-xs font-medium text-scm-primary hover:bg-scm-surface-container"
          >
            <MaterialIcon name="history" className="text-[16px]" />
            변경 이력
          </Link>
        }
      >
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-scm-outline-variant/60 bg-[#F8F9FA] text-left text-[11px] font-semibold uppercase text-scm-on-surface-variant">
                <th className="px-3 py-2.5">발주번호</th>
                <th className="px-3 py-2.5">제품</th>
                <th className="px-3 py-2.5 text-right">총수량</th>
                <th className="px-3 py-2.5">납기</th>
                <th className="px-3 py-2.5">상태</th>
                <th className="px-3 py-2.5">작성</th>
                <th className="px-3 py-2.5 text-right">처리</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const isDraft = req.status === "draft";
                const isSubmitted = req.status === "submitted";
                return (
                  <tr
                    key={req.id}
                    className="border-b border-scm-outline-variant/40 last:border-0"
                  >
                    <td className="px-3 py-3 align-top font-semibold text-scm-primary">
                      {req.number}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <p className="font-medium text-scm-primary">{productSummary(req)}</p>
                      <p className="mt-0.5 text-xs text-scm-on-surface-variant">
                        {req.lines.map((l) => `${l.productCode} ${l.qty.toLocaleString()}`).join(" · ")}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-right align-top tabular-nums">
                      {sumRequestQty(req).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 align-top tabular-nums text-scm-on-surface-variant">
                      {formatDate(req.dueDate)}
                    </td>
                    <td className="px-3 py-3 align-top">{statusBadge(req.status)}</td>
                    <td className="px-3 py-3 align-top text-xs text-scm-on-surface-variant">
                      {req.audit[0]?.actorLabel ?? "—"}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="flex items-center justify-end gap-1.5">
                        {isDraft && canCreate ? (
                          <button
                            type="button"
                            onClick={() => submitRequest(req.id, role)}
                            className="inline-flex h-8 items-center gap-1 rounded-md border border-scm-outline-variant bg-white px-2.5 text-xs font-medium text-scm-primary hover:bg-scm-surface-container"
                          >
                            <MaterialIcon name="send" className="text-[15px]" />
                            제출
                          </button>
                        ) : null}
                        {isSubmitted && canApprove ? (
                          <button
                            type="button"
                            onClick={() => approveRequest(req.id, role)}
                            className="inline-flex h-8 items-center gap-1 rounded-md bg-emerald-600 px-2.5 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            <MaterialIcon name="check" className="text-[15px]" />
                            확정
                          </button>
                        ) : null}
                        {isSubmitted && !canApprove ? (
                          <span className="text-xs text-amber-700">승인 대기</span>
                        ) : null}
                        {(isDraft || isSubmitted) && canCreate ? (
                          <button
                            type="button"
                            onClick={() => cancelRequest(req.id, role)}
                            className="inline-flex h-8 items-center gap-1 rounded-md border border-scm-outline-variant bg-white px-2.5 text-xs font-medium text-scm-on-surface-variant hover:bg-scm-surface-container"
                          >
                            취소
                          </button>
                        ) : null}
                        {req.status === "approved" ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                            <MaterialIcon name="lock" className="text-[15px]" />
                            잠금
                          </span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {requests.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-scm-on-surface-variant">
            제조 요청이 없습니다.
          </p>
        ) : null}
      </DashboardCard>
    </div>
  );
}
