"use client";

import { LogOut, UserCircle2 } from "lucide-react";
import { signOut } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
      <button type="button" className="relative text-slate-500 hover:text-[var(--navy)] transition-colors">
        <Bell className="h-5 w-5" />
        <span className="absolute right-0 top-0 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]">
          <Avatar className="h-10 w-10 ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)]">
            <AvatarImage src={image ?? undefined} alt={name ?? "User avatar"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <div className="px-3 py-2">
          <p className="font-semibold text-slate-950">{name || "BorderlessCV user"}</p>
          <p className="text-sm text-slate-500">{email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/settings">
            <UserCircle2 className="mr-2 h-4 w-4" />
            Settings
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-rose-600 focus:bg-rose-50 focus:text-rose-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  );
}
