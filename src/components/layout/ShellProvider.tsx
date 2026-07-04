"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ShellData } from "@/lib/shell-data";

const ShellContext = createContext<ShellData | null>(null);

export function ShellProvider({
  value,
  children,
}: {
  value: ShellData | null;
  children: ReactNode;
}) {
  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShellData(): ShellData | null {
  return useContext(ShellContext);
}
