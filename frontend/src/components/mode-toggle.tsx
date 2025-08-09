import React from "react";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { Toggle } from "./ui/toggle";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark = React.useMemo(() => {
    if (theme === "dark") return true;
    if (theme === "light") return false;

    return window.document.documentElement.classList.contains("dark");
  }, [theme]);

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Toggle size="sm" variant="outline" onClick={toggleTheme}>
      {isDark ? <Sun /> : <Moon />}
    </Toggle>
  );
}
