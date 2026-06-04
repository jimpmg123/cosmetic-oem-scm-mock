"use client";

import { useState, type ReactNode } from "react";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { MaterialIcon } from "@/components/ui/material-icon";
import { cn } from "@/lib/utils";

export function CollapsibleSection({
  id,
  title,
  summary,
  actions,
  defaultOpen = true,
  insetCard = true,
  children,
}: {
  id: string;
  title: string;
  summary?: string;
  actions?: ReactNode;
  defaultOpen?: boolean;
  /** false when children are already card components */
  insetCard?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section id={id} className="scroll-mt-[4.5rem] border-t border-scm-outline-variant pt-6 first:border-t-0 first:pt-0">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="group flex min-w-0 flex-1 items-start gap-2 text-left"
        >
          <MaterialIcon
            name={open ? "expand_more" : "chevron_right"}
            className="mt-0.5 shrink-0 text-[20px] text-scm-on-surface-variant"
          />
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-scm-primary">{title}</h3>
            {!open && summary ? (
              <p className="mt-0.5 truncate text-sm text-scm-on-surface-variant">
                {summary}
              </p>
            ) : null}
          </div>
        </button>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {open ? (
        <div className="mt-4">
          {insetCard ? (
            <DashboardCard bodyClassName="p-5">{children}</DashboardCard>
          ) : (
            children
          )}
        </div>
      ) : null}
    </section>
  );
}

export function DetailGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid gap-x-6 gap-y-4 sm:grid-cols-2",
        className,
      )}
    >
      {children}
    </dl>
  );
}

export function DetailField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-scm-on-surface-variant">{label}</dt>
      <dd className="mt-1 text-sm text-scm-primary">{value}</dd>
    </div>
  );
}

export function TabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-1 border-b border-scm-outline-variant">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
            active === tab.id
              ? "border-scm-secondary text-scm-secondary"
              : "border-transparent text-scm-on-surface-variant hover:text-scm-primary",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function EmptyTabState({
  message,
  linkHref,
  linkLabel,
}: {
  message: string;
  linkHref?: string;
  linkLabel?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-scm-outline-variant bg-scm-surface-container-low px-6 py-10 text-center">
      <p className="text-sm font-medium text-scm-primary">{message}</p>
      {linkHref && linkLabel ? (
        <a
          href={linkHref}
          className="mt-3 inline-block text-sm font-medium text-scm-link hover:underline"
        >
          {linkLabel}
        </a>
      ) : null}
    </div>
  );
}
