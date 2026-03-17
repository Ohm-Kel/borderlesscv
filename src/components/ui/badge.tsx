import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[var(--accent-soft)] text-[var(--accent-dark)] hover:bg-[var(--accent)]/20",
        secondary: "border-transparent bg-slate-100 text-[var(--navy)] hover:bg-slate-200",
        destructive: "border-transparent bg-rose-100 text-rose-800 hover:bg-rose-200/80",
        outline: "text-[var(--foreground)]",
        // Backward-compatible variants for existing components
        accent: "border-transparent bg-[var(--accent-soft)] text-[var(--accent-dark)] hover:bg-[var(--accent)]/20",
        success: "border-transparent bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80",
        danger: "border-transparent bg-rose-50 text-rose-700 hover:bg-rose-100/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
