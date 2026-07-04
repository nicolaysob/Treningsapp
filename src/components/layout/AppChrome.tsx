"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

const PUBLIC_PATHS = ["/login", "/signup"];

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (isPublic) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
