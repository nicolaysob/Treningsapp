import { tsbColor, type TsbStatus } from "@/lib/training-load/pmc";

const STATUS_COLORS: Record<TsbStatus, { stroke: string; glow: string; label: string }> = {
  fresh: { stroke: "#3dd68c", glow: "rgba(61,214,140,0.5)", label: "Frisk" },
  neutral: { stroke: "#8b8b96", glow: "rgba(139,139,150,0.3)", label: "Nøytral" },
  fatigued: { stroke: "#ff5c5c", glow: "rgba(255,92,92,0.5)", label: "Sliten" },
};

function tsbToProgress(tsb: number): number {
  const clamped = Math.max(-45, Math.min(45, tsb));
  return ((clamped + 45) / 90) * 100;
}

export function TsbGauge({ tsb }: { tsb: number | null }) {
  if (tsb === null) {
    return (
      <div className="flex h-28 w-28 items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-2xl font-bold text-zinc-600">—</p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">TSB</p>
        </div>
      </div>
    );
  }

  const status = tsbColor(tsb);
  const { stroke, glow, label } = STATUS_COLORS[status];
  const progress = tsbToProgress(tsb);
  const circumference = 2 * Math.PI * 42;
  const arcLength = circumference * 0.75;
  const endOffset = circumference - (progress / 100) * arcLength;
  const startOffset = circumference;

  return (
    <div
      className="relative flex h-28 w-28 items-center justify-center"
      style={{ "--gauge-glow": glow } as React.CSSProperties}
    >
      <svg
        className="gauge-glow -rotate-[135deg] absolute"
        width="112"
        height="112"
        viewBox="0 0 112 112"
      >
        <circle
          cx="56"
          cy="56"
          r="42"
          fill="none"
          stroke="var(--ring-track)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
        />
        <circle
          cx="56"
          cy="56"
          r="42"
          fill="none"
          stroke={stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          className="gauge-arc"
          style={
            {
              "--gauge-start": `${startOffset}`,
              "--gauge-end": `${endOffset}`,
              filter: `drop-shadow(0 0 6px ${glow})`,
            } as React.CSSProperties
          }
        />
      </svg>
      <div className="gauge-value-in relative text-center">
        <p className="font-mono text-2xl font-bold leading-none tracking-tight" style={{ color: stroke }}>
          {tsb > 0 ? "+" : ""}
          {tsb.toFixed(0)}
        </p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</p>
      </div>
    </div>
  );
}
