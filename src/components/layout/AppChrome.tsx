"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";

const PUBLIC_PATHS = ["/login", "/signup"];

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  useEffect(() => {
    if (isPublic) {
      document.documentElement.classList.remove("app-locked");
      document.body.classList.remove("app-locked");
      return;
    }

    document.documentElement.classList.add("app-locked");
    document.body.classList.add("app-locked");
  }, [isPublic]);

  if (isPublic) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
