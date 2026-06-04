"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useLocale } from "@/components/providers/locale-provider";
import { ALL_ROLES, useRole } from "@/components/providers/role-provider";
import type { UserRole } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

const ROLE_KEYS = {
  super_admin: "role.super_admin",
  b_admin: "role.b_admin",
  b_staff: "role.b_staff",
  warehouse: "role.warehouse",
} as const;

const ROLE_LEVEL_KEYS = {
  super_admin: "role.level.4",
  b_admin: "role.level.3",
  b_staff: "role.level.2",
  warehouse: "role.level.mobile",
} as const;

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

  function switchRole(next: UserRole) {
    if (next === role) return;
    setRole(next);
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
            {t(ROLE_KEYS[role])}
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
          {ALL_ROLES.map((r) => (
            <DropdownMenu.Item
              key={r}
              onSelect={() => switchRole(r)}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm outline-none",
                "text-scm-on-surface hover:bg-scm-surface-container focus:bg-scm-surface-container",
                role === r && "bg-scm-surface-container-low font-medium",
              )}
            >
              <span>{t(ROLE_KEYS[r])}</span>
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
