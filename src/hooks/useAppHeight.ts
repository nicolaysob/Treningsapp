"use client";

import { useEffect } from "react";

function syncAppHeight() {
  const height = window.visualViewport?.height ?? window.innerHeight;
  document.documentElement.style.setProperty("--app-height", `${height}px`);
}

export function useAppHeight() {
  useEffect(() => {
    syncAppHeight();

    window.addEventListener("resize", syncAppHeight);
    window.visualViewport?.addEventListener("resize", syncAppHeight);
    window.visualViewport?.addEventListener("scroll", syncAppHeight);

    return () => {
      window.removeEventListener("resize", syncAppHeight);
      window.visualViewport?.removeEventListener("resize", syncAppHeight);
      window.visualViewport?.removeEventListener("scroll", syncAppHeight);
    };
  }, []);
}
