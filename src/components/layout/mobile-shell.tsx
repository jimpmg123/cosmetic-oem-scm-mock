"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Monitor } from "lucide-react";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { useLocale } from "@/components/providers/locale-provider";
import { MOBILE_NAV } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      <header className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-b border-border bg-card px-4 py-2">
        <div>
          <div className="text-base font-semibold">{t("app.mobileTitle")}</div>
          <div className="text-sm text-muted-foreground">{t("app.mobileSubtitle")}</div>
        </div>
        <div className="flex items-center gap-2">
          <LocaleSwitcher variant="select" />
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <Monitor className="h-4 w-4" />
            {t("nav.linkDesktop")}
          </Link>
        </div>
      </header>
      <main className="flex-1 p-4 text-base">{children}</main>
      <nav className="sticky bottom-0 flex border-t border-border bg-card">
        {MOBILE_NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/m" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 items-center justify-center py-3.5 text-base font-medium",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
