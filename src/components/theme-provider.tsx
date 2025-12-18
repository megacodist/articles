// Make this component a Client Component because it uses the local 
// storage to remember the user's theme preference.
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // attribute="class" is CRITICAL for Tailwind dark mode to work
  return (
    <NextThemesProvider
      attribute="data-theme"           // <--- write data-theme="dark" / "light" etc
      defaultTheme="light"
      enableSystem={true}
      storageKey="theme"
    >
      {children}
    </NextThemesProvider>
  );
}