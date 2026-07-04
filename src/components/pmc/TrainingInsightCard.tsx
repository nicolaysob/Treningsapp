import { getTrainingInsight, type InsightTone, type TrainingInsightContext } from "@/lib/training-load/insight";

const TONE_STYLES: Record<
  InsightTone,
  { border: string; bg: string; headline: string; icon: string; readiness: string }
> = {
  fresh: {
    border: "border-emerald-500/20",
    bg: "bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent",
    headline: "text-emerald-300",
    icon: "✓",
    readiness: "text-emerald-400",
  },
  balanced: {
    border: "border-white/8",
    bg: "bg-gradient-to-r from-white/4 via-transparent to-transparent",
    headline: "text-zinc-100",
    icon: "◎",
    readiness: "text-zinc-300",
  },
  building: {
    border: "border-amber-500/20",
    bg: "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent",
    headline: "text-amber-300",
    icon: "↗",
    readiness: "text-amber-400",
  },
  risk: {
    border: "border-red-500/20",
    bg: "bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent",
    headline: "text-red-300",
    icon: "⚠",
    readiness: "text-red-400",
  },
};

const SIGNAL_STYLES = {
  positive: "insight-signal--positive",
  neutral: "insight-signal--neutral",
  caution: "insight-signal--caution",
  warning: "insight-signal--warning",
} as const;

export function TrainingInsightCard({ context }: { context: TrainingInsightContext }) {
  const insight = getTrainingInsight(context);
  const style = TONE_STYLES[insight.tone];

  return (
    <div className={`insight-card flex flex-col gap-3 rounded-2xl border p-4 ${style.border} ${style.bg}`}>
      <div className="flex gap-3.5">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/30 text-base font-bold ${style.headline}`}
        >
          {style.icon}
        </div>
            <div className="min-w-0 flex-1">
          <div className="insight-card__headline-row">
            <p className={`font-bold tracking-tight ${style.headline}`}>{insight.headline}</p>
            <div className="insight-card__readiness">
              <p className={`font-mono text-lg font-extrabold tabular-nums leading-none ${style.readiness}`}>
                {insight.readiness}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">dagsform</p>
            </div>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-zinc-500">{insight.detail}</p>
        </div>
      </div>

      {insight.signals.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {insight.signals.map((signal) => (
            <span
              key={signal.label}
              className={`insight-signal ${SIGNAL_STYLES[signal.severity]}`}
            >
              {signal.label}
            </span>
          ))}
        </div>
      )}

      {insight.tips.length > 0 && (
        <ul className="insight-tips flex flex-col gap-1.5 border-t border-white/6 pt-3">
          {insight.tips.map((tip) => (
            <li key={tip} className="insight-tip">
              {tip}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
