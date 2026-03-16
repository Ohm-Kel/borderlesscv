import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
  compact = false,
}: {
  className?: string;
  href?: string;
  compact?: boolean;
}) {
  return (
    <Link href={href} className={cn("inline-flex min-w-0 items-center gap-3", className)}>
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center bg-slate-950 bg-gradient-to-br from-slate-800 via-slate-950 to-slate-950 font-bold tracking-widest text-white shadow-[0_1px_2px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.14),inset_0_1px_0_rgba(255,255,255,0.12)]",
          compact ? "h-9 w-9 rounded-[13px] text-[0.66rem]" : "h-10 w-10 rounded-[14px] text-[0.7rem]",
        )}
      >
        <span
          className={cn(
            "absolute border border-white/[0.09]",
            compact ? "inset-[1.5px] rounded-[11px]" : "inset-[1.5px] rounded-[12px]",
          )}
        />
        BC
      </div>
      <div className="flex min-w-0 flex-col gap-[3px]">
        <span
          className={cn(
            "truncate font-semibold tracking-[0.28em] text-slate-400",
            compact ? "text-[0.56rem] sm:text-[0.58rem]" : "text-[0.6rem] sm:text-[0.63rem]",
          )}
        >
          BORDERLESSCV
        </span>
        <span
          className={cn(
            "serif-display leading-none text-slate-950",
            compact ? "text-[0.82rem] sm:text-[0.88rem]" : "text-[0.9rem] sm:text-[0.98rem]",
          )}
        >
          Hire-ready across borders
        </span>
      </div>
    </Link>
  );
}
