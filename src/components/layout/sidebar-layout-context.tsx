"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const RAIL_PX = 64;
const DETAIL_EXPANDED_PX = 256;
const DETAIL_COLLAPSED_PX = 64;
const STORAGE_KEY = "sidebar-detail-collapsed";
const NAV_THEME_KEY = "sidebar-nav-dark";

type SidebarLayoutContextValue = {
  detailCollapsed: boolean;
  setDetailCollapsed: (collapsed: boolean) => void;
  toggleDetailCollapsed: () => void;
  navDark: boolean;
  toggleNavDark: () => void;
  sidebarWidthPx: number;
};

const SidebarLayoutContext = createContext<SidebarLayoutContextValue | null>(
  null,
);

export function SidebarLayoutProvider({ children }: { children: ReactNode }) {
  const [detailCollapsed, setDetailCollapsedState] = useState(false);
  const [navDark, setNavDarkState] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setDetailCollapsedState(true);
    const themeStored = localStorage.getItem(NAV_THEME_KEY);
    if (themeStored === "true") setNavDarkState(true);
  }, []);

  const setDetailCollapsed = useCallback((collapsed: boolean) => {
    setDetailCollapsedState(collapsed);
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, []);

  const toggleDetailCollapsed = useCallback(() => {
    setDetailCollapsedState((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const toggleNavDark = useCallback(() => {
    setNavDarkState((prev) => {
      const next = !prev;
      localStorage.setItem(NAV_THEME_KEY, String(next));
      return next;
    });
  }, []);

  const sidebarWidthPx =
    RAIL_PX + (detailCollapsed ? DETAIL_COLLAPSED_PX : DETAIL_EXPANDED_PX);

  const value = useMemo(
    () => ({
      detailCollapsed,
      setDetailCollapsed,
      toggleDetailCollapsed,
      navDark,
      toggleNavDark,
      sidebarWidthPx,
    }),
    [
      detailCollapsed,
      setDetailCollapsed,
      toggleDetailCollapsed,
      navDark,
      toggleNavDark,
      sidebarWidthPx,
    ],
  );

  return (
    <SidebarLayoutContext.Provider value={value}>
      {children}
    </SidebarLayoutContext.Provider>
  );
}

export function useSidebarLayout() {
  const ctx = useContext(SidebarLayoutContext);
  if (!ctx) {
    throw new Error("useSidebarLayout must be used within SidebarLayoutProvider");
  }
  return ctx;
}
