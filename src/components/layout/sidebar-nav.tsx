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
    <aside className="flex h-full flex-col gap-8 rounded-[32px] border border-white/70 bg-white/90 px-5 py-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      <Logo href="/dashboard" />
      <nav className="space-y-2">
        {navigation.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                active ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-[28px] bg-[linear-gradient(180deg,#0f172a,#1e293b)] p-5 text-white">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Country-aware guidance</p>
        <h3 className="mt-2 text-lg font-semibold">Built for graduates applying across markets.</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Keep one trusted profile, tailor versions by country, and track every application from one workspace.
        </p>
      </div>
    </aside>
  );
}
