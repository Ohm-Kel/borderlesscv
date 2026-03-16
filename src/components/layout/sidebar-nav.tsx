"use client";

import Link from "next/link";
import { BriefcaseBusiness, ChevronDown, FileText, LayoutDashboard, Settings, Sparkles, UserSquare2 } from "lucide-react";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Master Profile", icon: UserSquare2 },
  { href: "/resumes", label: "Resumes", icon: FileText },
  { href: "/applications", label: "Applications", icon: BriefcaseBusiness },
  { href: "/cover-letters", label: "Cover Letters", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col gap-5 rounded-[28px] border border-white/75 bg-white/92 px-3 py-4 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-sm">
      <div className="px-1.5">
        <Logo href="/dashboard" compact />
      </div>

      <nav className="space-y-1">
        {navigation.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-[16px] px-3.5 py-2.5 text-[0.845rem] font-medium transition-all duration-200",
                active
                  ? "bg-slate-950 text-white shadow-[0_8px_22px_rgba(15,23,42,0.20)]"
                  : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-950",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-4.5 w-[3px] -translate-y-1/2 rounded-r-full bg-white/30" />
              )}
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <details className="mt-auto overflow-hidden rounded-[22px] bg-[linear-gradient(150deg,#0c1629_0%,#1e293b_100%)] text-white shadow-[0_12px_32px_rgba(15,23,42,0.22)] group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Country-aware guidance
            </p>
            <p className="mt-1 text-[0.82rem] font-semibold leading-snug">
              Built for graduates applying across markets.
            </p>
          </div>
          <span className="rounded-full border border-white/10 p-1.5 text-slate-300 transition-transform duration-200 group-open:rotate-180">
            <ChevronDown className="h-3.5 w-3.5" />
          </span>
        </summary>
        <div className="border-t border-white/8 px-4 pb-4 pt-3">
          <p className="text-[0.72rem] leading-[1.65] text-slate-400">
            One trusted profile, tailored versions by country, every application tracked in one workspace.
          </p>
        </div>
      </details>
    </aside>
  );
}
