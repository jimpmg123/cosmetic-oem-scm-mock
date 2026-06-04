"use client";

import { ALL_LOCALES, useLocale } from "@/components/providers/locale-provider";
import type { Locale } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ variant = "header" }: { variant?: "header" | "select" }) {
  const { locale, setLocale, t, localeLabels } = useLocale();

  if (variant === "select") {
    return (
      <label className="flex items-center gap-2 text-base">
        <span className="text-scm-on-surface-variant">{t("locale.label")}</span>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="h-9 min-w-[7rem] rounded-lg border border-scm-outline-variant bg-scm-surface-lowest px-2 text-sm"
        >
          {ALL_LOCALES.map((loc) => (
            <option key={loc} value={loc}>
              {localeLabels[loc]}
            </option>
          ))}
        </select>
      </label>
    );
  }

  const labels: Record<Locale, string> = {
    ko: "한국어",
    zh: "中文",
    en: "English",
  };

  return (
    <nav className="flex gap-4">
      {ALL_LOCALES.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => setLocale(loc)}
          className={cn(
            "cursor-pointer text-sm transition-colors",
            locale === loc
              ? "font-bold text-scm-primary"
              : "text-scm-on-surface-variant hover:text-scm-secondary",
          )}
        >
          {labels[loc]}
        </button>
      ))}
    </nav>
  );
}
