import * as React from "react";
import { cn } from "@/lib/utils";

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        variant === "default" && "bg-primary text-primary-foreground",
        variant === "secondary" && "bg-secondary text-secondary-foreground",
        variant === "outline" && "border border-border text-foreground",
        variant === "success" && "bg-emerald-100 text-emerald-800",
        variant === "warning" && "bg-amber-100 text-amber-800",
        variant === "danger" && "bg-red-100 text-red-800",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
