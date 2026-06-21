/**
 * 운영 구조 2 — 제조 요청(발주 / PO) 모델 (mock)
 *
 * 콜마 turnkey 일괄구매 모델: APPLICELL은 완제품 수량으로 발주(PO)하고 대금만 결제.
 * 원료 지급/소요량 없음. 추적 단위 = 발주 ↔ 콜마 출고 ↔ 입고 수량 일치.
 *
 * SoD: 작성/제출(a_admin) ≠ 확정(super_admin). 모든 상태 변화는 감사 이벤트로 남는다.
 */

import type { UserRole } from "@/lib/mock/data";
import { APPLICELL_PRODUCTS, KOLMAR_CHINA } from "@/lib/mock/china-supply/applicell-catalog";

export type McRequestStatus = "draft" | "submitted" | "approved" | "cancelled";

export type McRequestLine = {
  productId: string;
  productName: string;
  productCode: string;
  qty: number;
};

export type McAuditAction = "작성" | "수정" | "제출" | "확정" | "취소";

export type McAuditEvent = {
  at: string;
  actorRole: UserRole;
  actorLabel: string;
  action: McAuditAction;
  detail?: string;
};

export type ManufacturingRequest = {
  id: string;
  number: string;
  status: McRequestStatus;
  manufacturerId: string;
  manufacturerName: string;
  lines: McRequestLine[];
  /** 납기 (YYYY-MM-DD) */
  dueDate: string;
  comment?: string;
  createdAt: string;
  createdByRole: UserRole;
  approvedAt?: string;
  approvedByRole?: UserRole;
  /** append-only */
  audit: McAuditEvent[];
};

export const MC_ROLE_LABEL: Record<UserRole, string> = {
  executive: "경영진",
  super_admin: "Korea Super Admin",
  a_admin: "Korea Admin",
  b_admin: "China Admin",
  b_staff: "China 물류",
  warehouse: "창고",
};

export const MC_STATUS_META: Record<
  McRequestStatus,
  { label: string; tone: "neutral" | "amber" | "green" | "red" }
> = {
  draft: { label: "작성중", tone: "neutral" },
  submitted: { label: "승인 대기", tone: "amber" },
  approved: { label: "확정(발주)", tone: "green" },
  cancelled: { label: "취소", tone: "red" },
};

export function sumRequestQty(req: ManufacturingRequest): number {
  return req.lines.reduce((sum, l) => sum + l.qty, 0);
}

export function nextRequestNumber(list: ManufacturingRequest[]): string {
  const year = new Date().getFullYear();
  const prefix = `MFG-${year}-`;
  const nums = list
    .map((r) => r.number)
    .filter((n) => n.startsWith(prefix))
    .map((n) => parseInt(n.slice(prefix.length), 10))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

function lineFor(productId: string, qty: number): McRequestLine {
  const p = APPLICELL_PRODUCTS.find((x) => x.id === productId)!;
  return { productId, productName: p.name, productCode: p.code, qty };
}

export const INITIAL_MANUFACTURING_REQUESTS: ManufacturingRequest[] = [
  {
    id: "mfg-001",
    number: "MFG-2026-001",
    status: "approved",
    manufacturerId: KOLMAR_CHINA.id,
    manufacturerName: KOLMAR_CHINA.name,
    lines: [
      lineFor("prod-applicell-lotion", 10000),
      lineFor("prod-applicell-serum", 5000),
    ],
    dueDate: "2026-07-15",
    comment: "6월 1차 발주",
    createdAt: "2026-06-10T09:00:00Z",
    createdByRole: "a_admin",
    approvedAt: "2026-06-11T02:00:00Z",
    approvedByRole: "super_admin",
    audit: [
      {
        at: "2026-06-10T09:00:00Z",
        actorRole: "a_admin",
        actorLabel: MC_ROLE_LABEL.a_admin,
        action: "작성",
      },
      {
        at: "2026-06-10T09:30:00Z",
        actorRole: "a_admin",
        actorLabel: MC_ROLE_LABEL.a_admin,
        action: "제출",
      },
      {
        at: "2026-06-11T02:00:00Z",
        actorRole: "super_admin",
        actorLabel: MC_ROLE_LABEL.super_admin,
        action: "확정",
        detail: "BOM·수량 스냅샷 고정",
      },
    ],
  },
  {
    id: "mfg-002",
    number: "MFG-2026-002",
    status: "submitted",
    manufacturerId: KOLMAR_CHINA.id,
    manufacturerName: KOLMAR_CHINA.name,
    lines: [lineFor("prod-applicell-cream", 3000)],
    dueDate: "2026-07-20",
    comment: "Miracle Cream 보충",
    createdAt: "2026-06-18T08:00:00Z",
    createdByRole: "a_admin",
    audit: [
      {
        at: "2026-06-18T08:00:00Z",
        actorRole: "a_admin",
        actorLabel: MC_ROLE_LABEL.a_admin,
        action: "작성",
      },
      {
        at: "2026-06-18T08:20:00Z",
        actorRole: "a_admin",
        actorLabel: MC_ROLE_LABEL.a_admin,
        action: "제출",
      },
    ],
  },
  {
    id: "mfg-003",
    number: "MFG-2026-003",
    status: "draft",
    manufacturerId: KOLMAR_CHINA.id,
    manufacturerName: KOLMAR_CHINA.name,
    lines: [lineFor("prod-applicell-eye-cream", 2000)],
    dueDate: "2026-08-01",
    createdAt: "2026-06-20T06:00:00Z",
    createdByRole: "a_admin",
    audit: [
      {
        at: "2026-06-20T06:00:00Z",
        actorRole: "a_admin",
        actorLabel: MC_ROLE_LABEL.a_admin,
        action: "작성",
      },
    ],
  },
];
