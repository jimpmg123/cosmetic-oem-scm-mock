"use client";

import { MaterialIcon } from "@/components/ui/material-icon";
import { cn } from "@/lib/utils";

export function LineThumbnail({
  name,
  imageUrl,
  className,
  aspect = "video",
  variant = "default",
}: {
  name: string;
  imageUrl?: string;
  className?: string;
  aspect?: "video" | "square";
  /** 카탈로그 라인 카드 — 흰색 둥근 직사각형 로고 영역 */
  variant?: "default" | "brand";
}) {
  const hasImage = Boolean(imageUrl?.trim());

  if (variant === "brand") {
    return (
      <div className={cn("px-1.5 pt-2.5", className)}>
        <div
          className={cn(
            "flex h-[4.25rem] w-full items-center justify-center",
            "rounded-xl border border-scm-outline-variant/30 bg-white",
            "shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
            "transition-all duration-200",
            "group-hover:border-scm-secondary/40 group-hover:shadow-[0_2px_8px_rgba(0,0,0,0.07)]",
          )}
        >
          {hasImage ? (
            <img
              src={imageUrl}
              alt={name}
              className="max-h-[3.25rem] max-w-[calc(100%-1rem)] object-contain px-2"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-scm-on-surface-variant">
              <MaterialIcon name="category" className="text-[22px] opacity-40" />
              <span className="mt-0.5 text-[10px] font-medium">{name.slice(0, 1) || "?"}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (hasImage) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={cn(
          "w-full bg-scm-surface-container-lowest p-2",
          aspect === "square" ? "aspect-square object-contain" : "aspect-video object-contain",
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center border-b border-scm-outline-variant/50 bg-scm-surface-container-low text-scm-on-surface-variant",
        aspect === "square" ? "aspect-square" : "aspect-video",
        className,
      )}
    >
      <MaterialIcon name="category" className="text-[28px] opacity-40" />
      <span className="mt-1 text-xs font-medium">{name.slice(0, 1) || "?"}</span>
    </div>
  );
}
