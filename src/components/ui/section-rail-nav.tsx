"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type RefObject,
} from "react";
import { cn } from "@/lib/utils";

export type SectionRailItem = {
  /** Must match `id` on the target `<section>` (scroll anchor). */
  id: string;
  label: string;
};

export type SectionRailNavProps = {
  sections: SectionRailItem[];
  /**
   * Scroll container. Omit to use the document viewport.
   * Pass the scrolling `<main>` ref when content scrolls inside a panel.
   */
  scrollRootRef?: RefObject<HTMLElement | null>;
  /** Extra offset when scrolling (e.g. fixed header height). */
  scrollOffsetPx?: number;
  className?: string;
};

function scrollSectionIntoView(
  sectionId: string,
  scrollRoot: HTMLElement | null,
  offsetPx: number,
) {
  const el = document.getElementById(sectionId);
  if (!el) return;

  if (scrollRoot) {
    const rootRect = scrollRoot.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const top =
      scrollRoot.scrollTop + (elRect.top - rootRect.top) - offsetPx;
    scrollRoot.scrollTo({ top, behavior: "smooth" });
    return;
  }

  const top = el.getBoundingClientRect().top + window.scrollY - offsetPx;
  window.scrollTo({ top, behavior: "smooth" });
}

function useActiveSection(
  sectionIds: string[],
  scrollRootRef?: RefObject<HTMLElement | null>,
) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const root = scrollRootRef?.current ?? null;
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el != null);

    if (elements.length === 0) return;

    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.intersectionRatio);
        }
        let bestId = sectionIds[0];
        let bestRatio = -1;
        for (const id of sectionIds) {
          const r = ratios.get(id) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            bestId = id;
          }
        }
        if (bestRatio > 0) setActiveId(bestId);
      },
      {
        root,
        rootMargin: "-72px 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [sectionIds, scrollRootRef]);

  return activeId;
}

/**
 * ChatGPT-style section rail: thin ticks on the right; hover reveals labels;
 * click scrolls to the section top. For long management / detail pages.
 */
export function SectionRailNav({
  sections,
  scrollRootRef,
  scrollOffsetPx = 72,
  className,
}: SectionRailNavProps) {
  const listboxId = useId();
  const railRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const activeId = useActiveSection(
    sections.map((s) => s.id),
    scrollRootRef,
  );

  const openMenu = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setMenuOpen(true);
  }, []);

  const scheduleClose = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setMenuOpen(false);
      setHoveredId(null);
    }, 120);
  }, []);

  const goTo = useCallback(
    (id: string) => {
      scrollSectionIntoView(id, scrollRootRef?.current ?? null, scrollOffsetPx);
      setMenuOpen(false);
    },
    [scrollOffsetPx, scrollRootRef],
  );

  if (sections.length === 0) return null;

  return (
    <div
      ref={railRef}
      className={cn(
        "pointer-events-none fixed right-3 top-1/2 z-30 flex -translate-y-1/2 flex-col items-end",
        className,
      )}
      aria-hidden={!menuOpen}
    >
      <div
        className="pointer-events-auto flex items-stretch gap-0"
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
      >
        <div
          className={cn(
            "mr-2 min-w-[200px] max-w-[280px] origin-right rounded-xl border border-scm-outline-variant bg-scm-surface-lowest py-1.5 shadow-lg transition-all duration-150",
            menuOpen
              ? "pointer-events-auto scale-100 opacity-100"
              : "pointer-events-none scale-95 opacity-0",
          )}
          role="listbox"
          id={listboxId}
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
        >
          <ul className="max-h-[min(70vh,320px)] overflow-y-auto">
            {sections.map((section) => {
              const isActive = activeId === section.id;
              const isHovered = hoveredId === section.id;
              return (
                <li key={section.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    title={section.label}
                    onMouseEnter={() => setHoveredId(section.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => goTo(section.id)}
                    className={cn(
                      "block w-full truncate px-3 py-2 text-left text-sm transition-colors",
                      isActive || isHovered
                        ? "bg-scm-surface-container-high text-scm-primary"
                        : "text-scm-on-surface-variant hover:bg-scm-surface-container-high hover:text-scm-primary",
                    )}
                  >
                    {section.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div
          className="flex flex-col items-end justify-center gap-[10px] py-2 pr-0.5"
          aria-label="Section navigation"
        >
          {sections.map((section) => {
            const isActive = activeId === section.id;
            const isHovered = hoveredId === section.id;
            return (
              <button
                key={section.id}
                type="button"
                aria-label={section.label}
                title={section.label}
                onMouseEnter={() => {
                  openMenu();
                  setHoveredId(section.id);
                }}
                onClick={() => goTo(section.id)}
                className="group flex h-3 w-6 items-center justify-end rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-scm-secondary"
              >
                <span
                  className={cn(
                    "block h-[2px] rounded-full transition-all duration-150",
                    isActive || isHovered
                      ? "w-5 bg-scm-primary"
                      : "w-3 bg-scm-outline-variant group-hover:w-4 group-hover:bg-scm-on-surface-variant",
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
