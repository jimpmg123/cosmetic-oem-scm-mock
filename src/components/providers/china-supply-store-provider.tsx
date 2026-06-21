"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { UserRole } from "@/lib/mock/data";
import { KOLMAR_CHINA } from "@/lib/mock/china-supply/applicell-catalog";
import {
  INITIAL_MANUFACTURING_REQUESTS,
  MC_ROLE_LABEL,
  nextRequestNumber,
  type ManufacturingRequest,
  type McAuditAction,
  type McAuditEvent,
  type McRequestLine,
} from "@/lib/mock/china-supply/manufacturing-requests";

type CreateInput = {
  lines: McRequestLine[];
  dueDate: string;
  comment?: string;
  actorRole: UserRole;
  /** true면 생성과 동시에 제출(승인 대기) */
  submit?: boolean;
};

type ChinaSupplyStoreValue = {
  requests: ManufacturingRequest[];
  createRequest: (input: CreateInput) => string;
  submitRequest: (id: string, actorRole: UserRole) => void;
  approveRequest: (id: string, actorRole: UserRole) => void;
  cancelRequest: (id: string, actorRole: UserRole) => void;
};

const ChinaSupplyStoreContext = createContext<ChinaSupplyStoreValue | null>(null);

function event(actorRole: UserRole, action: McAuditAction, detail?: string): McAuditEvent {
  return {
    at: new Date().toISOString(),
    actorRole,
    actorLabel: MC_ROLE_LABEL[actorRole],
    action,
    detail,
  };
}

export function ChinaSupplyStoreProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<ManufacturingRequest[]>(
    INITIAL_MANUFACTURING_REQUESTS,
  );

  const createRequest = useCallback((input: CreateInput): string => {
    const id = `mfg-${Date.now()}`;
    setRequests((prev) => {
      const number = nextRequestNumber(prev);
      const now = new Date().toISOString();
      const audit: McAuditEvent[] = [event(input.actorRole, "작성")];
      if (input.submit) audit.push(event(input.actorRole, "제출"));
      const next: ManufacturingRequest = {
        id,
        number,
        status: input.submit ? "submitted" : "draft",
        manufacturerId: KOLMAR_CHINA.id,
        manufacturerName: KOLMAR_CHINA.name,
        lines: input.lines,
        dueDate: input.dueDate,
        comment: input.comment,
        createdAt: now,
        createdByRole: input.actorRole,
        audit,
      };
      return [next, ...prev];
    });
    return id;
  }, []);

  const submitRequest = useCallback((id: string, actorRole: UserRole) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id && r.status === "draft"
          ? { ...r, status: "submitted", audit: [...r.audit, event(actorRole, "제출")] }
          : r,
      ),
    );
  }, []);

  const approveRequest = useCallback((id: string, actorRole: UserRole) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id && r.status === "submitted"
          ? {
              ...r,
              status: "approved",
              approvedAt: new Date().toISOString(),
              approvedByRole: actorRole,
              audit: [...r.audit, event(actorRole, "확정", "BOM·수량 스냅샷 고정")],
            }
          : r,
      ),
    );
  }, []);

  const cancelRequest = useCallback((id: string, actorRole: UserRole) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id && (r.status === "draft" || r.status === "submitted")
          ? { ...r, status: "cancelled", audit: [...r.audit, event(actorRole, "취소")] }
          : r,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({ requests, createRequest, submitRequest, approveRequest, cancelRequest }),
    [requests, createRequest, submitRequest, approveRequest, cancelRequest],
  );

  return (
    <ChinaSupplyStoreContext.Provider value={value}>
      {children}
    </ChinaSupplyStoreContext.Provider>
  );
}

export function useChinaSupplyStore() {
  const ctx = useContext(ChinaSupplyStoreContext);
  if (!ctx) {
    throw new Error("useChinaSupplyStore must be used within ChinaSupplyStoreProvider");
  }
  return ctx;
}
