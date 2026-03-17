"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Menu } from "lucide-react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserNav } from "@/components/layout/user-nav";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function AppShell({
  user,
  children,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
  children: ReactNode;
}) {
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem("borderlesscv-sidebar-expanded") === "true";
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function toggleSidebar() {
    setSidebarExpanded((current) => {
      const next = !current;
      window.localStorage.setItem("borderlesscv-sidebar-expanded", String(next));
      return next;
    });
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex h-full w-full gap-3 px-3 py-3 lg:px-4 lg:py-4">
        <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <DialogContent
            className="left-0 top-0 h-full max-w-[296px] translate-x-0 translate-y-0 gap-0 rounded-none rounded-r-[30px] border-l-0 p-0 sm:max-w-[320px]"
            showClose={false}
          >
            <DialogTitle className="sr-only">Navigation menu</DialogTitle>
            <SidebarNav
              expanded
              mode="mobile"
              onToggle={() => setMobileNavOpen(false)}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </DialogContent>
        </Dialog>
        <div
          className={cn(
            "hidden shrink-0 transition-[width] duration-200 lg:block",
            sidebarExpanded ? "w-[248px] xl:w-[256px]" : "w-[84px]",
          )}
        >
          <SidebarNav expanded={sidebarExpanded} onToggle={toggleSidebar} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-1 pb-2 lg:hidden">
            <Button variant="secondary" size="icon" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </Button>
            <UserNav name={user.name} email={user.email} image={user.image} />
          </div>
          <div className="hidden items-center justify-end px-1 pb-2 lg:flex">
            <UserNav name={user.name} email={user.email} image={user.image} />
          </div>
          <main className="min-h-0 min-w-0 flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
    </div>
  );
}
