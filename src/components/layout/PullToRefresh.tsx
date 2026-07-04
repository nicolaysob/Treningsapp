"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const PULL_THRESHOLD = 72;
const MAX_PULL = 108;
const SCROLL_TOP_TOLERANCE = 2;

type PullState = "idle" | "pulling" | "syncing" | "done" | "error";

function isAtScrollTop(el: HTMLElement): boolean {
  return el.scrollTop <= SCROLL_TOP_TOLERANCE;
}

export function PullToRefresh({ children }: { children: ReactNode }) {
  const router = useRouter();
  const scrollRef = useRef<HTMLElement>(null);
  const startY = useRef(0);
  const isDragging = useRef(false);
  const pullRef = useRef(0);
  const stateRef = useRef<PullState>("idle");

  const [pull, setPull] = useState(0);
  const [state, setState] = useState<PullState>("idle");

  pullRef.current = pull;
  stateRef.current = state;

  const setPullState = useCallback((next: PullState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const triggerSync = useCallback(async () => {
    setPullState("syncing");
    setPull(PULL_THRESHOLD * 0.7);

    try {
      const res = await fetch("/api/sync/run", { method: "POST", credentials: "same-origin" });
      if (!res.ok) throw new Error("sync failed");

      await new Promise((resolve) => setTimeout(resolve, 4500));
      router.refresh();
      setPullState("done");
      setTimeout(() => {
        setPullState("idle");
        setPull(0);
      }, 1200);

      setTimeout(() => router.refresh(), 8000);
    } catch {
      setPullState("error");
      setTimeout(() => {
        setPullState("idle");
        setPull(0);
      }, 2000);
    }
  }, [router, setPullState]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (stateRef.current === "syncing") return;
      if (!isAtScrollTop(el)) return;
      if (e.touches.length !== 1) return;

      startY.current = e.touches[0].clientY;
      isDragging.current = true;
      setPullState("pulling");
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || stateRef.current === "syncing") return;
      if (!isAtScrollTop(el)) {
        setPull(0);
        return;
      }
      if (e.touches.length !== 1) return;

      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0) {
        e.preventDefault();
        setPull(Math.min(dy * 0.5, MAX_PULL));
      } else {
        setPull(0);
      }
    };

    const onTouchEnd = () => {
      if (!isDragging.current) return;
      isDragging.current = false;

      if (pullRef.current >= PULL_THRESHOLD) {
        void triggerSync();
        return;
      }

      setPull(0);
      if (stateRef.current === "pulling") setPullState("idle");
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [triggerSync, setPullState]);

  const indicatorHeight =
    state === "syncing" || state === "done" || state === "error" ? 52 : pull;

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
      className="ptr-scroll mx-auto min-h-0 w-full max-w-3xl flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-4 sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))] sm:pt-5 [-webkit-overflow-scrolling:touch]"
    >
      <div className="ptr-indicator" style={{ height: indicatorHeight }} aria-live="polite">
        <div
          className={`ptr-indicator__content ${pull >= PULL_THRESHOLD || state !== "idle" ? "ptr-indicator__content--active" : ""}`}
        >
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
