"use client";

import { LocaleProvider } from "@/components/providers/locale-provider";
import { CatalogStoreProvider } from "@/components/providers/catalog-store-provider";
import { AAdminPolicyProvider } from "@/components/providers/a-admin-policy-provider";
import { MockStoreProvider } from "@/components/providers/mock-store-provider";
import { RoleProvider } from "@/components/providers/role-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <MockStoreProvider>
        <CatalogStoreProvider>
          <AAdminPolicyProvider>
            <RoleProvider>{children}</RoleProvider>
          </AAdminPolicyProvider>
        </CatalogStoreProvider>
      </MockStoreProvider>
    </LocaleProvider>
  );
}
