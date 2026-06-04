"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import { cn } from "@/lib/utils";

export function CollapsibleSection({
  title,
  subtitle,
  defaultOpen = true,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className={cn(
        "rounded-lg border border-scm-outline-variant bg-scm-surface-lowest",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-scm-surface-container-low"
      >
        <div>
          <div className="font-medium text-scm-primary">{title}</div>
          {subtitle ? (
            <div className="text-sm text-scm-on-surface-variant">{subtitle}</div>
          ) : null}
        </div>
        <MaterialIcon
          name={open ? "expand_less" : "expand_more"}
          className="text-scm-on-surface-variant"
        />
      </button>
      {open ? <div className="border-t border-scm-outline-variant px-4 py-4">{children}</div> : null}
    </section>
  );
}
