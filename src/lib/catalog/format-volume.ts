import type { ProductBomLine, VolumeAmount } from "@/lib/mock/product-catalog";

function trimTrailingZeros(n: number, maxFraction = 3): string {
  const s = n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFraction,
  });
  return s;
}

export function formatVolumeAmount(vol: VolumeAmount): string {
  return `${trimTrailingZeros(vol.value)} ${vol.unit}`;
}

export function formatBomPercent(percent?: number): string {
  if (percent == null || Number.isNaN(percent)) return "—";
  return `${trimTrailingZeros(percent, 2)}%`;
}

export function formatBomQtyPerUnit(line: ProductBomLine): string {
  return `${trimTrailingZeros(line.qtyPerUnit)} ${line.unit}`;
}
