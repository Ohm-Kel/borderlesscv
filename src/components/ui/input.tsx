import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-input bg-transparent px-4 py-2 text-[0.875rem] shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--foreground)] placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-[var(--accent)] focus-visible:ring-4 focus-visible:ring-[var(--accent)]/15 disabled:cursor-not-allowed disabled:opacity-50 data-[error=true]:border-rose-500 data-[error=true]:focus-visible:ring-rose-500/20",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input };
