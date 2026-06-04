"use client";

import { cn } from "@/lib/utils";

export type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

export function DonutChartCard({
  title,
  subtitle,
  centerValue,
  centerLabel,
  segments,
  size = 132,
  className,
}: {
  title: string;
  subtitle?: string;
  centerValue: string;
  centerLabel?: string;
  segments: DonutSegment[];
  size?: number;
  className?: string;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-scm-outline-variant/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]",
        className,
      )}
    >
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-scm-primary">{title}</h4>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-scm-on-surface-variant">{subtitle}</p>
        ) : null}
      </div>

      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
        <div
          className="relative shrink-0"
          style={{ width: size, height: size }}
        >
          <svg
            width={size}
            height={size}
            className="-rotate-90"
            aria-hidden
          >
            {total <= 0 ? (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="#E5E7EB"
                strokeWidth={stroke}
              />
            ) : (
              segments.map((seg, i) => {
                const ratio = seg.value / total;
                const dash = ratio * c;
                const gap = c - dash;
                const el = (
                  <circle
                    key={i}
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={stroke}
                    strokeDasharray={`${dash} ${gap}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="butt"
                  />
                );
                offset += dash;
                return el;
              })
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold tabular-nums leading-none text-scm-primary">
              {centerValue}
            </span>
            {centerLabel ? (
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-scm-on-surface-variant">
                {centerLabel}
              </span>
            ) : null}
          </div>
        </div>

        <ul className="min-w-0 flex-1 space-y-3">
          {segments.map((seg) => {
            const pct = total > 0 ? (seg.value / total) * 100 : 0;
            return (
              <li key={seg.label} className="flex items-center gap-2 text-sm">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="min-w-0 truncate text-scm-on-surface-variant">
                  {seg.label}
                </span>
                <span
                  className="mx-1 min-w-[2rem] flex-1 border-b border-dotted border-scm-outline-variant"
                  aria-hidden
                />
                <span className="shrink-0 tabular-nums font-medium text-scm-primary">
                  {seg.value.toLocaleString()}
                </span>
                <span className="w-12 shrink-0 text-right tabular-nums text-scm-on-surface-variant">
                  {pct.toFixed(1)}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

const COLORS = {
  e2e: "#0D9488",
  production: "#085AC0",
  remaining: "#E5E7EB",
  gap: "#F59E0B",
};

export function buildYieldDonutSegments(
  numerator: number,
  denominator: number,
  achievedLabel: string,
  remainingLabel: string,
  achievedColor: string,
): DonutSegment[] {
  const achieved = Math.min(Math.max(numerator, 0), denominator);
  const remaining = Math.max(denominator - achieved, 0);
  if (denominator <= 0) {
    return [{ label: achievedLabel, value: 1, color: COLORS.remaining }];
  }
  return [
    { label: achievedLabel, value: achieved, color: achievedColor },
    { label: remainingLabel, value: remaining, color: COLORS.remaining },
  ];
}

export { COLORS as DONUT_COLORS };

/** @deprecated use DonutChartCard — kept for compact inline use */
export function YieldDonut({
  pct,
  numerator,
  denominator,
  caption,
  size = 120,
  className,
}: {
  pct: number | null;
  numerator: number;
  denominator: number;
  caption: string;
  size?: number;
  className?: string;
}) {
  const segments = buildYieldDonutSegments(
    numerator,
    denominator,
    caption,
    "—",
    COLORS.production,
  );
  return (
    <DonutChartCard
      title={caption}
      centerValue={pct != null && denominator > 0 ? `${pct.toFixed(1)}%` : "—"}
      centerLabel="TOTAL"
      segments={segments}
      size={size}
      className={className}
    />
  );
}
