"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useLocale } from "@/components/providers/locale-provider";
import { ALL_ROLES, useRole } from "@/components/providers/role-provider";
import type { UserRole } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

const ROLE_KEYS: Record<UserRole, string> = {
  executive: "role.executive",
  super_admin: "role.super_admin",
  a_admin: "role.a_admin",
  b_admin: "role.b_admin",
  b_staff: "role.b_staff",
  warehouse: "role.warehouse",
};

const ROLE_LEVEL_KEYS: Record<UserRole, string> = {
  executive: "role.level.executive",
  super_admin: "role.level.4",
  a_admin: "role.level.a_admin",
  b_admin: "role.level.3",
  b_staff: "role.level.2",
  warehouse: "role.level.mobile",
};

const CHINA_SUPPLY_ROLE_LABELS: Partial<Record<UserRole, string>> = {
  executive: "Executive",
  super_admin: "APPLICELL Korea Super Admin",
  a_admin: "APPLICELL Korea Manufacturing Admin",
  b_admin: "APPLICELL China Admin",
  b_staff: "APPLICELL China Logistics",
};

export const CHINA_SUPPLY_ROLE_OPTIONS: UserRole[] = [
  "executive",
  "super_admin",
  "a_admin",
  "b_admin",
  "b_staff",
];

export const CHINA_SUPPLY_ROLE_LEVEL_LABELS: Partial<Record<UserRole, string>> = {
  executive: "Executive Overview",
  super_admin: "Korea Full Control",
  a_admin: "Korea Manufacturing Ops",
  b_admin: "China Operating Company",
  b_staff: "China Logistics Ops",
};

export function getRoleLevelKey(role: UserRole) {
  return ROLE_LEVEL_KEYS[role];
}

export function RoleMenu({
  variant = "header",
  dark = false,
}: {
  variant?: "header" | "sidebar";
  dark?: boolean;
}) {
  const { role, setRole } = useRole();
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const isChinaSupplyMode =
    pathname === "/operations-2" || pathname.startsWith("/operations-2/");
  const roleOptions = isChinaSupplyMode ? CHINA_SUPPLY_ROLE_OPTIONS : ALL_ROLES;
  const currentRoleLabel =
    isChinaSupplyMode && CHINA_SUPPLY_ROLE_LABELS[role]
      ? CHINA_SUPPLY_ROLE_LABELS[role]
      : t(ROLE_KEYS[role]);

  function switchRole(next: UserRole) {
    if (next === role) return;
    setRole(next);

    if (isChinaSupplyMode) {
      if (next === "executive") {
        if (pathname !== "/operations-2/executive") {
          router.push("/operations-2/executive");
        }
        return;
      }

      if (next === "super_admin" || next === "a_admin") {
        if (pathname === "/operations-2/executive") {
          router.push("/operations-2");
        }
        return;
      }

      if (
        (next === "b_admin" || next === "b_staff") &&
        !pathname.startsWith("/operations-2/inbound")
      ) {
        router.push("/operations-2/inbound/inspection");
      }
      return;
    }

    if (next === "warehouse" && !pathname.startsWith("/m")) {
      router.push("/m");
      return;
    }
    if (next !== "warehouse" && pathname.startsWith("/m")) {
      router.push("/dashboard");
    }
  }

  const triggerClass =
    variant === "header"
      ? "ml-2 flex cursor-pointer items-center gap-1 border-l border-scm-outline-variant pl-4 text-sm text-scm-on-surface-variant transition-colors hover:text-scm-primary"
      : cn(
          "flex w-full cursor-pointer items-center gap-1 text-left transition-opacity hover:opacity-80",
          dark ? "text-nav-dark-text" : undefined,
        );

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={triggerClass}
          aria-label={t("role.switch")}
        >
          <span className={variant === "sidebar" ? "text-xs font-bold leading-none" : undefined}>
            {currentRoleLabel}
          </span>
          <MaterialIcon
            name="expand_more"
            className={cn(
              "text-base",
              variant === "sidebar" &&
                (dark ? "text-nav-dark-muted" : "text-scm-on-surface-variant"),
            )}
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[12rem] rounded-lg border border-scm-outline-variant bg-scm-surface-lowest p-1 shadow-md"
        >
          <DropdownMenu.Label className="px-3 py-2 text-xs font-medium text-scm-on-surface-variant">
            {t("role.switch")}
          </DropdownMenu.Label>
          <DropdownMenu.Separator className="my-1 h-px bg-scm-outline-variant" />
          {roleOptions.map((r) => (
            <DropdownMenu.Item
              key={r}
              onSelect={() => switchRole(r)}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm outline-none",
                "text-scm-on-surface hover:bg-scm-surface-container focus:bg-scm-surface-container",
                role === r && "bg-scm-surface-container-low font-medium",
              )}
            >
              <span>
                {isChinaSupplyMode && CHINA_SUPPLY_ROLE_LABELS[r]
                  ? CHINA_SUPPLY_ROLE_LABELS[r]
                  : t(ROLE_KEYS[r])}
              </span>
              {role === r ? (
                <MaterialIcon name="check" className="text-scm-secondary text-base" />
              ) : null}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
