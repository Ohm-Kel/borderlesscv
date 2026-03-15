"use client";

import Link from "next/link";
import { BriefcaseBusiness, FileText, LayoutDashboard, Settings, Sparkles, UserSquare2 } from "lucide-react";
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
    <aside className="flex h-full flex-col gap-7 rounded-[32px] border border-white/75 bg-white/92 px-4 py-6 shadow-[0_20px_56px_rgba(15,23,42,0.08)] backdrop-blur-sm">
      <div className="px-2">
        <Logo href="/dashboard" />
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
                "relative flex items-center gap-3 rounded-[18px] px-4 py-3 text-[0.875rem] font-medium transition-all duration-200",
                active
                  ? "bg-slate-950 text-white shadow-[0_8px_22px_rgba(15,23,42,0.20)]"
                  : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-950",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-white/30" />
              )}
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom promo card */}
      <div className="mt-auto overflow-hidden rounded-[24px] bg-[linear-gradient(150deg,#0c1629_0%,#1e293b_100%)] p-5 text-white shadow-[0_12px_32px_rgba(15,23,42,0.22)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
          Country-aware guidance
        </p>
        <h3 className="mt-2 text-[0.9rem] font-semibold leading-snug">
          Built for graduates applying across markets.
        </h3>
        <p className="mt-2 text-[0.75rem] leading-[1.7] text-slate-400">
          One trusted profile, tailored versions by country, every application tracked in one workspace.
        </p>
      </div>
    </aside>
  );
}
