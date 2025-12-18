"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { SvgMoon, SvgSun } from "@/components/svgs";

/**
 * Props for the ThemeSwitch component.
 */
type ThemeSwitchProps = {
  /**
   * Optional CSS class name to apply to the sun and moon icons.
   */
  iconClassName?: string;
};

/**
 * A component that provides a toggle switch to change the theme between
 * light and dark modes. It also handles hydration mismatch between server
 * and client by showing a placeholder.
 * @param {ThemeSwitchProps} props - The props for the component.
 * @returns {JSX.Element} The rendered theme switch component or a placeholder during mounting.
 */
export default function ThemeSwitch({ iconClassName }: ThemeSwitchProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className="w-14 h-8 bg-gray-200 rounded-full animate-pulse" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <label className="flex cursor-pointer gap-2 items-center">
      {/* Sun Icon */}
      <SvgSun className={`${iconClassName} animate-spin-slow`}/>

      {/* DaisyUI Toggle */}
      <input
        type="checkbox"
        className="toggle toggle-primary theme-controller"
        // We handle state manually via next-themes
        checked={isDark}
        onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
        aria-label="Toggle Dark Mode"
      />

      {/* Moon Icon */}
      <SvgMoon className={`${iconClassName} animate-spin-slow`}/>
    </label>
  );
}