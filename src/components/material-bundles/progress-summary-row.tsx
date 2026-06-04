"use client";

export function ProgressSummaryRow({
  items,
}: {
  items: {
    pct: number | null;
    numerator: number;
    denominator: number;
    caption: string;
    subcaption?: string;
  }[];
}) {
  return (
    <div className="grid gap-4 rounded-lg border border-scm-outline-variant bg-scm-surface-lowest p-5 sm:grid-cols-2">
      {items.map((item) => {
        const pct = item.pct ?? 0;
        const clamped = Math.min(100, Math.max(0, pct));
        return (
          <div key={item.caption}>
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-scm-primary">{item.caption}</p>
                {item.subcaption ? (
                  <p className="text-xs text-scm-on-surface-variant">{item.subcaption}</p>
                ) : null}
              </div>
              <p className="tabular-nums text-sm font-semibold text-scm-primary">
                {item.pct == null ? "—" : `${clamped.toFixed(1)}%`}
              </p>
            </div>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-scm-surface-container"
              role="progressbar"
              aria-valuenow={clamped}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-emerald-600 transition-[width]"
                style={{ width: `${clamped}%` }}
              />
            </div>
            <p className="mt-1 text-xs tabular-nums text-scm-on-surface-variant">
              {item.numerator.toLocaleString()} / {item.denominator.toLocaleString()}
            </p>
          </div>
        );
      })}
    </div>
  );
}
