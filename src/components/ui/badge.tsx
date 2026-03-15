import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", {
  variants: {
    variant: {
      default: "bg-slate-100 text-slate-700",
      accent: "bg-[var(--accent-soft)] text-[var(--accent)]",
      outline: "border border-slate-200 bg-white text-slate-700",
      success: "bg-emerald-50 text-emerald-700",
      danger: "bg-rose-50 text-rose-700",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
