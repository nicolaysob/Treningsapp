import { tsbColor, type TsbStatus } from "@/lib/training-load/pmc";

const COLOR_CLASSES: Record<TsbStatus, string> = {
  fresh: "border-emerald-800/50 bg-emerald-500/10 text-emerald-400",
  neutral: "border-zinc-700/80 bg-zinc-800/60 text-zinc-300",
  fatigued: "border-red-900/50 bg-red-500/10 text-red-400",
};

const DOT_CLASSES: Record<TsbStatus, string> = {
  fresh: "bg-emerald-400",
  neutral: "bg-zinc-400",
  fatigued: "bg-red-400",
};

const LABELS: Record<TsbStatus, string> = {
  fresh: "Frisk",
  neutral: "Nøytral",
  fatigued: "Sliten",
};

export function TsbBadge({ tsb }: { tsb: number | null }) {
  if (tsb === null) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-800/60 px-3.5 py-1.5 text-sm text-zinc-500">
        <span className="h-2 w-2 rounded-full bg-zinc-600" />
        TSB —
      </span>
    );
  }

  const status = tsbColor(tsb);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium ${COLOR_CLASSES[status]}`}
    >
      <span className={`h-2 w-2 rounded-full ${DOT_CLASSES[status]}`} />
      TSB {tsb > 0 ? "+" : ""}
      {tsb.toFixed(1)} · {LABELS[status]}
    </span>
  );
}
