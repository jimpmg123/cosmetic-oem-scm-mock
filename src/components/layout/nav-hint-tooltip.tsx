"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const SHOW_DELAY_MS = 550;

export function NavHintTooltip({
  hint,
  children,
  side = "right",
  className,
}: {
  hint?: string;
  children: ReactNode;
  side?: "right" | "bottom";
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const updateCoords = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (side === "bottom") {
      setCoords({ top: rect.bottom + 4, left: rect.left });
      return;
    }
    setCoords({
      top: rect.top + rect.height / 2,
      left: rect.right + 8,
    });
  }, [side]);

  const onEnter = useCallback(() => {
    if (!hint?.trim()) return;
    clearTimer();
    timerRef.current = setTimeout(() => {
      updateCoords();
      setVisible(true);
    }, SHOW_DELAY_MS);
  }, [hint, clearTimer, updateCoords]);

  const onLeave = useCallback(() => {
    clearTimer();
    setVisible(false);
  }, [clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  if (!hint?.trim()) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        ref={triggerRef}
        className={cn("relative min-w-0", className)}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={onEnter}
        onBlur={onLeave}
      >
        {children}
      </div>
      {visible && typeof document !== "undefined"
        ? createPortal(
            <div
              role="tooltip"
              className={cn(
                "pointer-events-none fixed z-[100] max-w-[220px] rounded-lg border px-2.5 py-2 text-xs leading-snug shadow-md",
                "border-scm-outline-variant bg-scm-surface-lowest text-scm-on-surface-variant",
              )}
              style={{
                top: coords.top,
                left: coords.left,
                transform:
                  side === "right" ? "translateY(-50%)" : undefined,
              }}
            >
              {hint}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
