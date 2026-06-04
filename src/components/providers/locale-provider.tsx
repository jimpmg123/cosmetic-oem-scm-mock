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
  type Locale,
  t as translate,
  LOCALE_LABELS,
} from "@/lib/i18n/translations";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  localeLabels: typeof LOCALE_LABELS;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ko");

  const t = useCallback((key: string) => translate(locale, key), [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, t, localeLabels: LOCALE_LABELS }),
    [locale, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export const ALL_LOCALES: Locale[] = ["ko", "zh", "en"];
