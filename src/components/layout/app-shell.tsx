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
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:px-6 lg:py-6">
        <div className="hidden w-[290px] shrink-0 lg:block">
          <SidebarNav />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="surface-card relative flex items-center justify-between rounded-[30px] border border-white/75 px-6 py-4 lg:px-8">
            <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/70 to-transparent" />
            <div>
              <p className="section-label">Your hiring workspace</p>
              <h2 className="mt-0.5 text-[0.95rem] font-semibold text-slate-950">
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
