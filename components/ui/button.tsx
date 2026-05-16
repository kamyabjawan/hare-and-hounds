"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
  isLoading?: boolean;
  icon?: ReactNode;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading,
  icon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "tap-target inline-flex items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55",
        variant === "primary" &&
          "border-mint/50 bg-mint px-4 py-3 text-ink shadow-glow hover:bg-mint/90",
        variant === "secondary" &&
          "border-white/15 bg-white/10 px-4 py-3 text-white hover:bg-white/15",
        variant === "ghost" && "border-transparent bg-transparent px-3 py-2 text-slate-200 hover:bg-white/10",
        variant === "danger" &&
          "border-coral/50 bg-coral/15 px-4 py-3 text-coral hover:bg-coral/20",
        size === "sm" && "min-h-9 px-3 py-2 text-xs",
        size === "icon" && "h-11 w-11 p-0",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {size !== "icon" ? children : <span className="sr-only">{children}</span>}
    </button>
  );
}
