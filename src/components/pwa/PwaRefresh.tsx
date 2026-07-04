"use client";

import { useEffect } from "react";

/** Reload when a new service worker takes over so PWA users get fresh UI. */
export function PwaRefresh() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const onControllerChange = () => {
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    return () => navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
  }, []);

  return null;
}
