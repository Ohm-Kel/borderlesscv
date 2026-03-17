"use client";

import { LogOut, UserCircle2 } from "lucide-react";
import { signOut } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggleItem } from "@/components/shared/theme-toggle";
import { Bell } from "lucide-react";

export function UserNav({
  name,
  email,
  image,
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}) {
  const initials = (name || email || "BC")
    .split(" ")
    .slice(0, 2)
    .map((value) => value[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex items-center gap-4">
      <button type="button" className="relative text-slate-500 hover:text-[var(--navy)] dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
        <Bell className="h-5 w-5" />
        <span className="absolute right-0 top-0 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#1A1D24]" />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]">
          <Avatar className="h-10 w-10 ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)]">
            <AvatarImage src={image ?? undefined} alt={name ?? "User avatar"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 dark:bg-[#1A1D24] dark:border-[#334155]">
        <div className="px-3 py-2">
          <p className="font-semibold text-slate-950 dark:text-white">{name || "BorderlessCV user"}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{email}</p>
        </div>
        <DropdownMenuSeparator className="dark:bg-[#334155]" />
        <DropdownMenuItem asChild className="dark:focus:bg-[#334155]/50 dark:focus:text-white">
          <a href="/settings">
            <UserCircle2 className="mr-2 h-4 w-4" />
            Settings
          </a>
        </DropdownMenuItem>
        <ThemeToggleItem />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-rose-600 focus:bg-rose-50 focus:text-rose-600 dark:text-rose-500 dark:focus:bg-rose-500/10 dark:focus:text-rose-400"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  );
}
