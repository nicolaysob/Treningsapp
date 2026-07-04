import {
  DISTANCE_LABELS,
  formatPace,
  formatRaceTime,
  formatSpeedKmh,
} from "@/lib/peak-efforts/format";
import { formatDateNb } from "@/lib/date";

export interface BestTimeRow {
  distanceM: number;
  label: string;
  timeSec: number | null;
  achievedAt: Date | null;
}

export function BestTimesList({
  data,
  sport,
}: {
  data: BestTimeRow[];
  sport: "RUN" | "RIDE";
}) {
  return (
    <ul className="divide-y divide-white/[0.06]">
      {data.map((row) => (
        <li key={row.distanceM} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-100">{row.label}</p>
            {row.timeSec !== null && row.achievedAt && (
              <p className="mt-0.5 text-xs text-zinc-600">
                {formatDateNb(row.achievedAt, { day: "numeric", month: "short", year: "numeric" })}
                {" · "}
                {sport === "RUN"
                  ? formatPace(row.timeSec / (row.distanceM / 1000))
                  : formatSpeedKmh(row.distanceM, row.timeSec)}
              </p>
            )}
          </div>
          <p
            className={`shrink-0 text-right text-lg font-bold tabular-nums tracking-tight ${
              row.timeSec !== null ? "text-zinc-50" : "text-zinc-700"
            }`}
          >
            {row.timeSec !== null ? formatRaceTime(row.timeSec) : "—"}
          </p>
        </li>
      ))}
    </ul>
  );
}
