import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex min-w-0 items-center gap-3", className)}>
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-slate-950 text-[0.7rem] font-bold tracking-widest text-white shadow-[0_6px_20px_rgba(15,23,42,0.26),inset_0_1px_0_rgba(255,255,255,0.12)]">
        <span className="absolute inset-[1.5px] rounded-[12px] border border-white/[0.09]" />
        BC
      </div>
      <div className="flex min-w-0 flex-col gap-[3px]">
        <span className="truncate text-[0.6rem] font-semibold tracking-[0.28em] text-slate-400 sm:text-[0.63rem]">
          BORDERLESSCV
        </span>
        <span className="serif-display text-[0.9rem] leading-none text-slate-950 sm:text-[0.98rem]">
          Hire-ready across borders
        </span>
      </div>
    </Link>
  );
}
