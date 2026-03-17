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
