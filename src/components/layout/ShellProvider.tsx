"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ShellData = {
  userName: string | null;
  userImage: string | null;
};

const ShellContext = createContext<ShellData | null>(null);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ShellData | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((session) => {
        if (cancelled) return;
        setData({
          userName: session?.user?.name ?? null,
          userImage: session?.user?.image ?? null,
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return <ShellContext.Provider value={data}>{children}</ShellContext.Provider>;
}

export function useShellData(): ShellData | null {
  return useContext(ShellContext);
}
