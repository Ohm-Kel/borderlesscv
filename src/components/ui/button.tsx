import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary)] text-white shadow-[0_1px_2px_rgba(255,126,95,0.14),0_8px_16px_rgba(255,126,95,0.18)] ring-1 ring-white/10 hover:bg-[var(--accent-dark)]",
        secondary:
          "bg-[var(--secondary)] text-[var(--secondary-foreground)] ring-1 ring-[var(--border)] shadow-[0_4px_12px_rgba(61,52,54,0.04)] hover:bg-[var(--muted)]",
        ghost:
          "text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)] hover:underline decoration-2 underline-offset-4",
        navy:
          "bg-[var(--navy)] text-white shadow-[0_1px_2px_rgba(61,52,54,0.14),0_8px_16px_rgba(61,52,54,0.10)] ring-1 ring-white/10 hover:brightness-110",
        outline:
          "bg-transparent text-[var(--foreground)] ring-1 ring-[var(--border)] hover:bg-[var(--muted)]",
        danger:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90",
        // backward-compatible alias
        accent:
          "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[0_1px_2px_rgba(254,180,123,0.14),0_8px_16px_rgba(254,180,123,0.14)] ring-1 ring-white/10 hover:brightness-105",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-sm",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
