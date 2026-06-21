"use client";

import { MaterialIcon } from "@/components/ui/material-icon";
import { cn } from "@/lib/utils";

/** 운영 구조 2 공용 검색 입력 — 아이콘 + 지우기 버튼 */
export function SearchBox({
  value,
  onChange,
  placeholder = "검색",
  className,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className={cn("relative", className)}>
      <MaterialIcon
        name="search"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-scm-on-surface-variant"
      />
      <input
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-scm-outline-variant bg-white pl-10 pr-9 text-sm text-scm-primary placeholder:text-scm-on-surface-variant focus:border-scm-secondary focus:outline-none focus:ring-2 focus:ring-scm-secondary/20"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="검색어 지우기"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-scm-on-surface-variant hover:bg-scm-surface-container-low"
        >
          <MaterialIcon name="close" className="text-[18px]" />
        </button>
      ) : null}
    </div>
  );
}
