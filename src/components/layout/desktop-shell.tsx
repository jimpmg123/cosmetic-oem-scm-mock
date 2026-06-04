"use client";

import { memo } from "react";
import { DesktopSidebar } from "@/components/layout/desktop-sidebar";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { RoleMenu } from "@/components/layout/role-menu";
import {
  SidebarLayoutProvider,
  useSidebarLayout,
} from "@/components/layout/sidebar-layout-context";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useLocale } from "@/components/providers/locale-provider";

const DesktopHeader = memo(function DesktopHeader({
  sidebarWidthPx,
}: {
  sidebarWidthPx: number;
}) {
  const { t } = useLocale();

  return (
    <header
      className="fixed right-0 top-0 z-10 flex h-14 items-center justify-between border-b border-scm-outline-variant bg-scm-surface-lowest px-6 transition-[left] duration-500"
      style={{ left: sidebarWidthPx }}
    >
      <div className="flex items-center gap-6">
        <span className="text-lg font-semibold text-scm-primary">
          {t("app.private")}
        </span>
        <div className="h-4 w-px bg-scm-outline-variant" />
        <LocaleSwitcher variant="header" />
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="cursor-pointer text-scm-on-surface-variant hover:text-scm-primary"
        >
          <MaterialIcon name="search" />
        </button>
        <button
          type="button"
          className="cursor-pointer text-scm-on-surface-variant hover:text-scm-primary"
        >
          <MaterialIcon name="notifications" />
        </button>
        <RoleMenu variant="header" />
      </div>
    </header>
  );
});

function DesktopShellInner({ children }: { children: React.ReactNode }) {
  const { sidebarWidthPx } = useSidebarLayout();

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <DesktopSidebar />
      <DesktopHeader sidebarWidthPx={sidebarWidthPx} />
      <main
        className="min-h-screen pt-14 transition-[padding-left] duration-500"
        style={{ paddingLeft: sidebarWidthPx }}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

export function DesktopShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarLayoutProvider>
      <DesktopShellInner>{children}</DesktopShellInner>
    </SidebarLayoutProvider>
  );
}
