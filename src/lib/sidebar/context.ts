// src/lib/sidebar/context.ts

"use client";

import { createContext, useContext } from "react";
import type { SidebarContextValue } from "@/types/m3a-sidebar";

const SidebarContext = createContext<SidebarContextValue | null>(null);

export const SidebarProvider = SidebarContext.Provider;

export function useSidebarContext<T = unknown>(): SidebarContextValue<T> {
  const context = useContext(SidebarContext);

  if (context === null) {
    throw new Error(
      "useSidebarContext must be used within a SidebarProvider"
    );
  }

  return context as SidebarContextValue<T>;
}