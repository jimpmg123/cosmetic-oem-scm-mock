"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_A_ADMIN_POLICY,
  type AAdminPolicy,
} from "@/lib/mock/a-admin-policy";

type AAdminPolicyContextValue = {
  policy: AAdminPolicy;
  updatePolicy: (patch: Partial<AAdminPolicy>) => void;
};

const AAdminPolicyContext = createContext<AAdminPolicyContextValue | null>(null);

export function AAdminPolicyProvider({ children }: { children: ReactNode }) {
  const [policy, setPolicy] = useState<AAdminPolicy>(DEFAULT_A_ADMIN_POLICY);

  const updatePolicy = useCallback((patch: Partial<AAdminPolicy>) => {
    setPolicy((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo(
    () => ({ policy, updatePolicy }),
    [policy, updatePolicy],
  );

  return (
    <AAdminPolicyContext.Provider value={value}>
      {children}
    </AAdminPolicyContext.Provider>
  );
}

export function useAAdminPolicy() {
  const ctx = useContext(AAdminPolicyContext);
  if (!ctx) {
    throw new Error("useAAdminPolicy must be used within AAdminPolicyProvider");
  }
  return ctx;
}
