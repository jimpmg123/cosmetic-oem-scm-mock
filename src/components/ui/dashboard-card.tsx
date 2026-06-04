import { cn } from "@/lib/utils";

export function DashboardCard({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-scm-outline-variant/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      {title ? (
        <div className="flex items-start justify-between gap-3 border-b border-scm-outline-variant/60 px-5 py-4">
          <div className="min-w-0">
            <h3 className="text-base font-semibold tracking-tight text-scm-primary">
              {title}
            </h3>
            {subtitle ? (
              <p className="mt-0.5 text-sm text-scm-on-surface-variant">{subtitle}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className={cn(title ? "p-5" : "p-5", bodyClassName)}>{children}</div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  accent,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "blue" | "green" | "teal" | "amber" | "default";
  className?: string;
}) {
  const valueColor = {
    blue: "text-scm-secondary",
    green: "text-emerald-600",
    teal: "text-teal-600",
    amber: "text-amber-600",
    default: "text-scm-primary",
  }[accent ?? "default"];

  return (
    <div
      className={cn(
        "rounded-xl border border-scm-outline-variant/80 bg-white px-4 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]",
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-scm-on-surface-variant">
        {label}
      </p>
      <p className={cn("mt-1.5 text-2xl font-semibold tabular-nums tracking-tight", valueColor)}>
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-scm-on-surface-variant">{hint}</p>
      ) : null}
    </div>
  );
}
