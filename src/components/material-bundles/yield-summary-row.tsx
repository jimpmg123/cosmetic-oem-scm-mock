"use client";

import { YieldDonut } from "@/components/material-bundles/yield-donut";

export function YieldSummaryRow({
  items,
}: {
  items: {
    pct: number | null;
    numerator: number;
    denominator: number;
    caption: string;
  }[];
}) {
  return (
    <div className="flex w-full flex-wrap justify-center gap-8 rounded-lg border border-scm-outline-variant bg-scm-surface-lowest px-6 py-6 sm:justify-start sm:gap-12">
      {items.map((item) => (
        <YieldDonut
          key={item.caption}
          pct={item.pct}
          numerator={item.numerator}
          denominator={item.denominator}
          caption={item.caption}
          size={112}
        />
      ))}
    </div>
  );
}
