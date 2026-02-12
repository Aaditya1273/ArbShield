"use client";

import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

interface LiquidCardProps extends HTMLAttributes<HTMLDivElement> {}

export function LiquidCard({
  className,
  children,
  ...props
}: PropsWithChildren<LiquidCardProps>) {
  return (
    <div
      className={cn(
        "relative rounded-3xl border border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-xl",
        "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)] overflow-hidden",
        "before:absolute before:inset-0 before:rounded-3xl before:pointer-events-none",
        "before:bg-[radial-gradient(1200px_400px_at_-10%_-10%,rgba(255,255,255,0.06),transparent_60%)]",
        "after:absolute after:-inset-px after:rounded-3xl after:pointer-events-none",
        "after:bg-[linear-gradient(135deg,rgba(255,255,255,0.2),rgba(255,255,255,0.05)_40%,transparent_60%)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
