"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function ThemeToggleItem() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <DropdownMenuItem disabled className="text-slate-500">
        <Moon className="mr-2 h-4 w-4" />
        Toggle theme
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuItem
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="cursor-pointer text-slate-600 focus:text-[var(--navy)] dark:text-slate-400 dark:focus:text-slate-200"
    >
      {theme === "dark" ? (
        <Sun className="mr-2 h-4 w-4" />
      ) : (
        <Moon className="mr-2 h-4 w-4" />
      )}
      {theme === "dark" ? "Light theme" : "Dark theme"}
    </DropdownMenuItem>
  );
}

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        disabled
        className="relative flex size-9 items-center justify-center border border-transparent rounded-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md opacity-50"
      >
        <Moon className="size-[1.2rem] text-slate-500" />
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative flex size-9 items-center justify-center border border-slate-200/50 dark:border-slate-800/50 rounded-full bg-white/50 hover:bg-white/80 dark:bg-slate-900/50 dark:hover:bg-slate-800/80 backdrop-blur-md transition-colors"
    >
      <Sun className="absolute size-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-slate-700" />
      <Moon className="absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-slate-300" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
