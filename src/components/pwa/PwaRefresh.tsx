"use client";

import { useEffect } from "react";
import { APP_VERSION } from "@/lib/app-version";

async function clearStaleCaches() {
  if ("serviceWorker" in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((reg) => reg.unregister()));
  }

  if ("caches" in window) {
    const names = await caches.keys();
    await Promise.all(names.map((name) => caches.delete(name)));
  }
}

export function PwaRefresh() {
  useEffect(() => {
    const stored = localStorage.getItem("app-version");
    if (stored === APP_VERSION) return;

    void clearStaleCaches().then(() => {
      localStorage.setItem("app-version", APP_VERSION);
      if (!stored) return;

      const url = new URL(window.location.href);
      url.searchParams.set("_v", APP_VERSION);
      window.location.replace(url.toString());
    });
  }, []);

  return null;
}
