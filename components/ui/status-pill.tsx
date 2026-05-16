import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

type StatusPillProps = {
  tone?: "mint" | "amber" | "coral" | "sky" | "muted";
  children: ReactNode;
};

export function StatusPill({ tone = "muted", children }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase",
        tone === "mint" && "border-mint/30 bg-mint/10 text-mint",
        tone === "amber" && "border-amber/30 bg-amber/10 text-amber",
        tone === "coral" && "border-coral/30 bg-coral/10 text-coral",
        tone === "sky" && "border-skyglow/30 bg-skyglow/10 text-skyglow",
        tone === "muted" && "border-white/10 bg-white/5 text-slate-300"
      )}
    >
      {children}
    </span>
  );
}
