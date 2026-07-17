"use client";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "positive" | "negative" | "neutral";
}

export function Badge({ className, variant = "neutral", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
        variant === "positive" && "bg-green-100 text-green-700",
        variant === "negative" && "bg-red-100 text-red-700",
        variant === "neutral" && "bg-gray-100 text-gray-600",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
