"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
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
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function syncHeight() {
      const el = shellRef.current;
      if (!el) return;
      const height = window.visualViewport?.height ?? window.innerHeight;
      el.style.height = `${height}px`;
      el.style.maxHeight = `${height}px`;
    }

    syncHeight();
    window.addEventListener("resize", syncHeight);
    window.addEventListener("orientationchange", syncHeight);
    window.visualViewport?.addEventListener("resize", syncHeight);

    return () => {
      window.removeEventListener("resize", syncHeight);
      window.removeEventListener("orientationchange", syncHeight);
      window.visualViewport?.removeEventListener("resize", syncHeight);
    };
  }, []);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data: { user?: { name?: string | null } }) => {
        setUserName(data.user?.name ?? null);
      })
      .catch(() => {});
  }, []);

  return (
    <div ref={shellRef} className="app-bg flex h-dvh max-h-dvh flex-col overflow-hidden">
      <header className="shrink-0 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 glass-header">
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

      <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain mx-auto w-full max-w-3xl px-4 pt-4 sm:px-6 sm:pt-5 [-webkit-overflow-scrolling:touch]">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
