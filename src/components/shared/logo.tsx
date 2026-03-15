import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-3", className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-sm">
        BC
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold tracking-[0.24em] text-slate-500">BORDERLESSCV</span>
        <span className="serif-display text-lg leading-none text-slate-950">Hire-ready across borders</span>
      </div>
    </Link>
  );
}
