"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/providers/themeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700/70 dark:bg-[#141414] dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-[#1c1c1c] dark:hover:text-white"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
