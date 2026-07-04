import type { WeeklyLeaderboardRow } from "@/lib/leaderboard/weekly";

const PODIUM_ORDER = [1, 0, 2] as const;
const PODIUM_HEIGHTS = ["h-20", "h-28", "h-14"] as const;
const PODIUM_CLASSES = ["podium-2", "podium-1", "podium-3"] as const;
const MEDALS = ["🥈", "🥇", "🥉"] as const;

export function Podium({
  rows,
  currentUserId,
  valueKey = "totalTss",
  formatValue,
}: {
  rows: WeeklyLeaderboardRow[];
  currentUserId: string;
  valueKey?: keyof Pick<
    WeeklyLeaderboardRow,
    "totalTss" | "totalDurationSec" | "longestDurationSec" | "totalElevationM"
  >;
  formatValue?: (row: WeeklyLeaderboardRow) => string;
}) {
  const top3 = rows.slice(0, 3);
  if (top3.length === 0) return null;

  const defaultFormat = (row: WeeklyLeaderboardRow) => {
    const val = row[valueKey];
    if (valueKey === "totalTss") return `${(val as number).toFixed(0)} TSS`;
    if (valueKey === "totalElevationM") return `${(val as number).toFixed(0)} m`;
    const sec = val as number;
    const h = Math.floor(sec / 3600);
    const m = Math.round((sec % 3600) / 60);
    return h > 0 ? `${h}t ${m}m` : `${m}m`;
  };

  const fmt = formatValue ?? defaultFormat;

  return (
    <div className="flex items-end justify-center gap-3 px-4 pb-2 pt-4">
      {PODIUM_ORDER.map((rankIndex, displayIndex) => {
        const row = top3[rankIndex];
        if (!row) {
          return <div key={displayIndex} className="w-24" />;
        }
        const isMe = row.userId === currentUserId;
        return (
          <div key={row.userId} className="flex w-24 flex-col items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl leading-none">{MEDALS[rankIndex]}</span>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                  isMe
                    ? "bg-orange-500/20 text-orange-300 ring-2 ring-orange-500/40"
                    : "bg-white/8 text-zinc-300"
                }`}
              >
                {row.userName?.[0]?.toUpperCase() ?? "?"}
              </div>
              <p
                className={`max-w-full truncate text-center text-xs font-semibold ${
                  isMe ? "text-orange-300" : "text-zinc-300"
                }`}
              >
                {row.userName?.split(" ")[0] ?? "Ukjent"}
              </p>
              <p className="font-mono text-[11px] font-bold text-zinc-500">{fmt(row)}</p>
            </div>
            <div
              className={`podium-bar ${PODIUM_CLASSES[rankIndex]} w-full ${PODIUM_HEIGHTS[displayIndex]}`}
            />
          </div>
        );
      })}
    </div>
  );
}
