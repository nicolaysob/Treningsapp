"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type TouchEvent as ReactTouchEvent,
} from "react";

const PULL_THRESHOLD = 72;
const MAX_PULL = 108;

type PullState = "idle" | "pulling" | "syncing" | "done" | "error";

export function PullToRefresh({ children }: { children: ReactNode }) {
  const router = useRouter();
  const scrollRef = useRef<HTMLElement>(null);
  const startY = useRef(0);
  const isDragging = useRef(false);
  const pullRef = useRef(0);

  const [pull, setPull] = useState(0);
  const [state, setState] = useState<PullState>("idle");

  pullRef.current = pull;

  const triggerSync = useCallback(async () => {
    setState("syncing");
    setPull(PULL_THRESHOLD * 0.7);

    try {
      const res = await fetch("/api/sync/run", { method: "POST", credentials: "same-origin" });
      if (!res.ok) throw new Error("sync failed");

      // Synk kjører i bakgrunnen — vent litt før vi henter oppdaterte data.
      await new Promise((resolve) => setTimeout(resolve, 4500));
      router.refresh();
      setState("done");
      setTimeout(() => {
        setState("idle");
        setPull(0);
      }, 1200);

      // Ekstra refresh for tregere synk uten å blokkere UI.
      setTimeout(() => router.refresh(), 8000);
    } catch {
      setState("error");
      setTimeout(() => {
        setState("idle");
        setPull(0);
      }, 2000);
    }
  }, [router]);

  const handleTouchStart = useCallback(
    (e: ReactTouchEvent<HTMLElement>) => {
      if (state === "syncing") return;
      const el = scrollRef.current;
      if (!el || el.scrollTop > 0) return;

      startY.current = e.touches[0].clientY;
      isDragging.current = true;
      setState("pulling");
    },
    [state],
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (pullRef.current >= PULL_THRESHOLD) {
      void triggerSync();
      return;
    }

    setPull(0);
    if (state === "pulling") setState("idle");
  }, [state, triggerSync]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || state === "syncing") return;
      if (el.scrollTop > 0) {
        setPull(0);
        return;
      }

      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0) {
        e.preventDefault();
        setPull(Math.min(dy * 0.5, MAX_PULL));
      } else {
        setPull(0);
      }
    };

    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  }, [state]);

  const indicatorHeight = state === "syncing" || state === "done" || state === "error"
    ? 52
    : pull;

  const label =
    state === "syncing"
      ? "Synker…"
      : state === "done"
        ? "Oppdatert"
        : state === "error"
          ? "Kunne ikke synke"
          : pull >= PULL_THRESHOLD
            ? "Slipp for å synke"
            : "Dra ned for å synke";

  return (
    <main
      ref={scrollRef}
      className="ptr-scroll mx-auto min-h-0 w-full max-w-3xl flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-4 pt-4 sm:px-6 sm:pt-5 [-webkit-overflow-scrolling:touch]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div
        className="ptr-indicator"
        style={{ height: indicatorHeight }}
        aria-live="polite"
      >
        <div className={`ptr-indicator__content ${pull >= PULL_THRESHOLD || state !== "idle" ? "ptr-indicator__content--active" : ""}`}>
          <span
            className={`ptr-spinner ${state === "syncing" ? "ptr-spinner--active" : ""}`}
            style={{ transform: state === "pulling" ? `rotate(${pull * 3}deg)` : undefined }}
          />
          <span className="ptr-label">{label}</span>
        </div>
      </div>

      {children}
    </main>
  );
}
