import type { CSSProperties } from "react";

export function MaterialIcon({
  name,
  filled,
  className = "",
  style,
}: {
  name: string;
  filled?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`material-symbols-outlined text-[20px] ${filled ? "filled" : ""} ${className}`}
      style={style}
      aria-hidden
    >
      {name}
    </span>
  );
}
