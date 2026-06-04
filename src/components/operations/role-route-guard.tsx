"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "@/components/providers/locale-provider";
import { useRole } from "@/components/providers/role-provider";
import {
  canAccessRoute,
  getDefaultPathForRole,
} from "@/lib/role-access";

export function RoleRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useRole();
  const { t } = useLocale();

  const allowed = canAccessRoute(role, pathname);

  useEffect(() => {
    if (!allowed) {
      router.replace(getDefaultPathForRole(role));
    }
  }, [allowed, role, router]);

  if (!allowed) {
    return (
      <p className="text-sm text-scm-on-surface-variant">{t("role.accessDenied")}</p>
    );
  }

  return <>{children}</>;
}
