"use client";

import Link from "next/link";
import { BriefcaseBusiness, ChevronDown, FileText, LayoutDashboard, Menu, Sparkles, UserSquare2 } from "lucide-react";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Master Profile", icon: UserSquare2 },
  { href: "/resumes", label: "Resumes", icon: FileText },
  { href: "/applications", label: "Applications", icon: BriefcaseBusiness },
  { href: "/cover-letters", label: "Cover Letters", icon: Sparkles },
];

export function SidebarNav({
  expanded,
  onToggle,
  mode = "desktop",
  onNavigate,
}: {
  expanded: boolean;
  onToggle: () => void;
  mode?: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isMobile = mode === "mobile";

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-white/92 py-4 backdrop-blur-sm transition-all duration-200",
        isMobile
          ? "gap-5 rounded-r-[28px] border-r border-slate-200/80 px-4 shadow-[0_18px_48px_rgba(15,23,42,0.08)]"
          : "rounded-[28px] border border-white/75 shadow-[0_18px_48px_rgba(15,23,42,0.08)]",
        !isMobile && (expanded ? "gap-5 px-3" : "items-center gap-4 px-2.5"),
      )}
    >
      <div
        className={cn(
          "flex w-full items-center",
          isMobile ? "justify-between px-1.5" : expanded ? "justify-between px-1.5" : "justify-center",
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-label={isMobile ? "Close navigation" : expanded ? "Collapse sidebar" : "Expand sidebar"}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-[0_8px_22px_rgba(15,23,42,0.08)] transition hover:border-slate-300 hover:text-slate-950"
        >
          <Menu className="h-5 w-5" />
        </button>
        {expanded || isMobile ? <Logo href="/dashboard" compact className="min-w-0 flex-1 overflow-hidden pl-3" /> : null}
      </div>

      <nav className={cn("w-full space-y-1", expanded || isMobile ? "" : "px-0.5")}>
        {navigation.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center text-[0.845rem] font-medium transition-all duration-200",
                expanded || isMobile ? "gap-3 rounded-[16px] px-3.5 py-2.5" : "justify-center rounded-[18px] px-0 py-3",
                active
                  ? "bg-slate-950 text-white shadow-[0_8px_22px_rgba(15,23,42,0.20)]"
                  : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-950",
              )}
            >
              {active && (
                <span
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 bg-white/30",
                    expanded || isMobile
                      ? "left-0 h-4.5 w-[3px] rounded-r-full"
                      : "left-1/2 top-0 h-[3px] w-5 -translate-x-1/2 translate-y-0 rounded-b-full",
                  )}
                />
              )}
              <Icon className="h-4 w-4 shrink-0" />
              {expanded || isMobile ? <span className="truncate">{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      {expanded && !isMobile ? (
        <details className="mt-auto overflow-hidden rounded-[22px] bg-[linear-gradient(150deg,#0c1629_0%,#1e293b_100%)] text-white shadow-[0_12px_32px_rgba(15,23,42,0.22)] group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Guidance
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
      ) : null}
    </aside>
  );
}
