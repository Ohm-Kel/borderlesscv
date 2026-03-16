import type { ReactNode } from "react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserNav } from "@/components/layout/user-nav";

export function AppShell({
  user,
  children,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
  children: ReactNode;
}) {
  const firstName = user.name?.split(" ")[0] ?? null;

  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1540px] gap-4 px-3 py-3 lg:px-4 lg:py-4">
        <div className="hidden w-[248px] shrink-0 lg:block xl:w-[256px]">
          <SidebarNav />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="surface-card relative flex items-center justify-between rounded-[26px] border border-white/75 px-5 py-3 lg:px-6">
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/70 to-transparent" />
            <div>
              <p className="section-label">Your hiring workspace</p>
              <h2 className="mt-0.5 text-[0.92rem] font-semibold text-slate-950">
                {firstName ? `Welcome back, ${firstName}` : "BorderlessCV"}
              </h2>
            </div>
            <UserNav name={user.name} email={user.email} image={user.image} />
          </header>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
