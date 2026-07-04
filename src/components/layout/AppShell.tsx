"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { AppLogo } from "@/components/brand/AppLogo";
import { BottomNav } from "@/components/layout/BottomNav";

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AppShell({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data: { user?: { name?: string | null } }) => {
        setUserName(data.user?.name ?? null);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="app-bg app-shell">
      <header className="app-shell__header glass-header sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <AppLogo size="sm" />
            <div className="hidden sm:block">
              <p className="text-sm font-bold tracking-tight text-zinc-100">Treningsapp</p>
              <p className="text-[10px] font-medium text-zinc-600">Belastning · Duell · Peak</p>
            </div>
          </Link>
          {userName && (
            <Link
              href="/settings"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/6 text-xs font-bold text-zinc-300 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-white"
            >
              {getInitials(userName)}
            </Link>
          )}
        </div>
      </header>

      <main className="app-shell__main mx-auto w-full max-w-3xl px-4 pt-4 sm:px-6 sm:pt-5">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
