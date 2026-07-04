"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { AppLogo } from "@/components/brand/AppLogo";
import { BottomNav } from "@/components/layout/BottomNav";
import { PullToRefresh } from "@/components/layout/PullToRefresh";

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
  const [userImage, setUserImage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data: { user?: { name?: string | null; image?: string | null } }) => {
        setUserName(data.user?.name ?? null);
        setUserImage(data.user?.image ?? null);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="app-bg flex h-[100dvh] min-h-[100dvh] flex-col overflow-hidden">
      <header className="shrink-0 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))] glass-header">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <AppLogo size="sm" />
            <div className="hidden sm:block">
              <p className="text-sm font-bold tracking-tight text-zinc-100">Treningsapp</p>
              <p className="text-[10px] font-medium text-zinc-600">Belastning · Duell · Kalender</p>
            </div>
          </Link>
          {userName && (
            <Link
              href="/settings"
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white/6 text-xs font-bold text-zinc-300 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-white"
            >
              {userImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- session avatar may be data URL
                <img src={userImage} alt="" className="h-full w-full object-cover" />
              ) : (
                getInitials(userName)
              )}
            </Link>
          )}
        </div>
      </header>

      <PullToRefresh>{children}</PullToRefresh>

      <BottomNav />
    </div>
  );
}
