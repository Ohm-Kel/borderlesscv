"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserNav } from "@/components/layout/user-nav";
import { cn } from "@/lib/utils";

export function AppShell({
  user,
  children,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
  children: ReactNode;
}) {
  const firstName = user.name?.split(" ")[0] ?? null;
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem("borderlesscv-sidebar-expanded") === "true";
  });

  function toggleSidebar() {
    setSidebarExpanded((current) => {
      const next = !current;
      window.localStorage.setItem("borderlesscv-sidebar-expanded", String(next));
      return next;
    });
  }

  return (
    <div className="mesh-bg h-screen overflow-hidden">
      <div className="mx-auto flex h-screen max-w-[1540px] gap-3 px-3 py-3 lg:px-4 lg:py-4">
        <div
          className={cn(
            "hidden shrink-0 transition-[width] duration-200 lg:block",
            sidebarExpanded ? "w-[248px] xl:w-[256px]" : "w-[84px]",
          )}
        >
          <SidebarNav expanded={sidebarExpanded} onToggle={toggleSidebar} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden">
          <header className="surface-card relative flex h-[58px] items-center justify-between rounded-[24px] border border-white/75 px-4 lg:px-5">
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/70 to-transparent" />
            <p className="text-sm font-medium text-slate-600">
              {firstName ? `${firstName}'s workspace` : "BorderlessCV workspace"}
            </p>
            <UserNav name={user.name} email={user.email} image={user.image} />
          </header>
          <main className="min-h-0 min-w-0 flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
    </div>
  );
}
