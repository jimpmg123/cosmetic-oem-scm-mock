"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { MaterialIcon } from "@/components/ui/material-icon";
import { getCosmeticTypeLabel } from "@/lib/i18n/catalog-labels";
import type { CosmeticType } from "@/lib/mock/product-catalog";
import { cn } from "@/lib/utils";

export function ProductThumbnail({
  name,
  imageUrl,
  cosmeticType,
  size = "md",
  className,
}: {
  name: string;
  imageUrl?: string;
  cosmeticType?: CosmeticType;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { locale } = useLocale();
  const dim =
    size === "lg" ? "h-24 w-24" : size === "sm" ? "h-10 w-10" : "h-16 w-16";
  const hasImage = imageUrl && imageUrl.trim().length > 0;

  if (hasImage) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={cn(dim, "rounded-lg object-cover", className)}
      />
    );
  }

  const label = cosmeticType ? getCosmeticTypeLabel(locale, cosmeticType) : name;
  const initial = name.slice(0, 1) || "?";

  return (
    <div
      className={cn(
        dim,
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-scm-outline-variant bg-scm-surface-container-low text-scm-on-surface-variant",
        className,
      )}
      title={name}
    >
      <MaterialIcon name="image" className="text-[20px] opacity-50" />
      <span className="mt-0.5 text-[9px] font-medium">{initial}</span>
      {cosmeticType ? (
        <span className="text-[8px] opacity-70">{label}</span>
      ) : null}
    </div>
  );
}
