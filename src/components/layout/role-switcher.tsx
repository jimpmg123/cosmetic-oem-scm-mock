"use client";

import { ALL_ROLES, useRole } from "@/components/providers/role-provider";
import { useLocale } from "@/components/providers/locale-provider";

const ROLE_KEYS = {
  super_admin: "role.super_admin",
  b_admin: "role.b_admin",
  b_staff: "role.b_staff",
  warehouse: "role.warehouse",
} as const;

export function RoleSwitcher() {
  const { role, setRole } = useRole();
  const { t } = useLocale();

  return (
    <select
      value={role}
      onChange={(e) => setRole(e.target.value as typeof role)}
      className="h-9 min-w-[10rem] rounded-md border border-input bg-background px-2 text-base"
      aria-label="Role"
    >
      {ALL_ROLES.map((r) => (
        <option key={r} value={r}>
          {t(ROLE_KEYS[r])}
        </option>
      ))}
    </select>
  );
}
