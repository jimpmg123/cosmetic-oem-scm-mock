import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1.5 text-base text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function DataTable({
  columns,
  rows,
  emptyMessage = "데이터가 없습니다.",
}: {
  columns: {
    key: string;
    label: React.ReactNode;
    className?: string;
    align?: "left" | "right";
  }[];
  rows: Record<string, React.ReactNode>[];
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-border bg-card p-10 text-center text-base text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border bg-card">
      <table className="w-full min-w-[720px] border-collapse text-base">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3.5 text-left text-base font-semibold text-muted-foreground",
                  col.align === "right" && "text-right",
                  col.className,
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-border last:border-0 hover:bg-muted/30"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-4 py-3.5",
                    col.align === "right" && "text-right tabular-nums",
                    col.className,
                  )}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatCell({
  label,
  value,
  sub,
}: {
  label: React.ReactNode;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card px-5 py-4">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="mt-1.5 text-2xl font-semibold tabular-nums">{value}</div>
      {sub ? (
        <div className="mt-1 text-sm text-muted-foreground">{sub}</div>
      ) : null}
    </div>
  );
}

export function FormField({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-base">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}

export const inputClassName =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-base";
