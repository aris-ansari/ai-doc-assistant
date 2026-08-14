"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem("ai-doc-theme");
    const nextTheme: Theme = stored === "light" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.classList.toggle("light", nextTheme === "light");
  }, []);

  const toggleTheme = () => {
    setTheme((current) => {
      const nextTheme = current === "dark" ? "light" : "dark";
      window.localStorage.setItem("ai-doc-theme", nextTheme);
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
      document.documentElement.classList.toggle("light", nextTheme === "light");
      document.documentElement.classList.toggle("light", nextTheme === "light");
      return nextTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
