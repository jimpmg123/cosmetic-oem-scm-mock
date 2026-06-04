"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "@/components/providers/locale-provider";
import type { TermKey } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

const TERM_SHORT: Record<TermKey, string> = {
  wo: "WO",
  sku: "SKU",
  po: "PO",
  shipment: "Shipment",
  yield: "Yield",
  reconciliation: "Reconciliation",
  expected: "Expected",
  located: "Located",
  discrepancy: "Discrepancy",
  bom: "BOM",
  vendor: "Vendor",
  theoreticalOutput: "Theo. Output",
};

type TooltipPlacement = "top" | "bottom";

export function TermLabel({
  term,
  children,
  className,
}: {
  term: TermKey;
  children?: React.ReactNode;
  className?: string;
}) {
  const { t } = useLocale();
  const label = children ?? TERM_SHORT[term];
  const tooltipId = useId();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<TooltipPlacement>("top");
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const tooltipHeight = tooltipRef.current?.offsetHeight ?? 80;
    const gap = 8;
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const nextPlacement: TooltipPlacement =
      spaceAbove >= tooltipHeight + gap || spaceAbove >= spaceBelow
        ? "top"
        : "bottom";

    setPlacement(nextPlacement);
    setCoords({
      top:
        nextPlacement === "top"
          ? rect.top - gap
          : rect.bottom + gap,
      left: rect.left + rect.width / 2,
    });
  }, []);

  const show = useCallback(() => {
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, updatePosition, t, term]);

  useEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  return (
    <>
      <span
        ref={anchorRef}
        className={cn(
          "inline cursor-help border-b border-dotted border-scm-on-surface-variant/50",
          className,
        )}
        tabIndex={0}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {label}
      </span>

      {open && typeof document !== "undefined"
        ? createPortal(
            <span
              ref={tooltipRef}
              id={tooltipId}
              role="tooltip"
              style={{
                position: "fixed",
                top: coords.top,
                left: coords.left,
                transform:
                  placement === "top"
                    ? "translate(-50%, -100%)"
                    : "translate(-50%, 0)",
                zIndex: 9999,
              }}
              className="pointer-events-none w-72 max-w-[min(90vw,18rem)] rounded-md border border-scm-outline-variant bg-scm-surface-lowest px-3 py-2 text-left text-sm font-normal normal-case leading-snug text-scm-on-surface shadow-lg"
            >
              {t(`term.${term}`)}
            </span>,
            document.body,
          )
        : null}
    </>
  );
}
