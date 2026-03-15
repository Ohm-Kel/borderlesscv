import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex min-w-0 items-center gap-3", className)}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-sm">
        BC
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-[0.68rem] font-semibold tracking-[0.24em] text-slate-500 sm:text-sm">BORDERLESSCV</span>
        <span className="serif-display text-base leading-none text-slate-950 sm:text-lg">Hire-ready across borders</span>
      </div>
    </Link>
  );
}
