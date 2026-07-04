import { getTrainingInsight, type InsightTone } from "@/lib/training-load/insight";

const TONE_STYLES: Record<
  InsightTone,
  { border: string; bg: string; headline: string; icon: string }
> = {
  fresh: {
    border: "border-emerald-500/20",
    bg: "bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent",
    headline: "text-emerald-300",
    icon: "✓",
  },
  balanced: {
    border: "border-white/8",
    bg: "bg-gradient-to-r from-white/4 via-transparent to-transparent",
    headline: "text-zinc-100",
    icon: "◎",
  },
  building: {
    border: "border-amber-500/20",
    bg: "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent",
    headline: "text-amber-300",
    icon: "↗",
  },
  risk: {
    border: "border-red-500/20",
    bg: "bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent",
    headline: "text-red-300",
    icon: "⚠",
  },
};

export function TrainingInsightCard({
  ctl,
  atl,
  tsb,
}: {
  ctl: number;
  atl: number;
  tsb: number;
}) {
  const insight = getTrainingInsight({ ctl, atl, tsb });
  const style = TONE_STYLES[insight.tone];

  return (
    <div
      className={`flex gap-3.5 rounded-2xl border p-4 ${style.border} ${style.bg}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/30 text-base font-bold ${style.headline}`}
      >
        {style.icon}
      </div>
      <div>
        <p className={`font-bold tracking-tight ${style.headline}`}>{insight.headline}</p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-500">{insight.detail}</p>
      </div>
    </div>
  );
}
