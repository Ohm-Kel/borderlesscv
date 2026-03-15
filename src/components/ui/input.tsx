import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, type, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-12 w-full rounded-[20px] border border-slate-200 bg-white/92 px-4 py-3 text-sm text-slate-900 shadow-[0_10px_22px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] placeholder:text-slate-400 focus-visible:border-slate-300 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-950/8 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
