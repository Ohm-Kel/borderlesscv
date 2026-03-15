import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[120px] w-full rounded-[24px] border border-slate-200 bg-white/92 px-4 py-3 text-sm text-slate-900 shadow-[0_10px_22px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] placeholder:text-slate-400 focus-visible:border-slate-300 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-950/8 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
