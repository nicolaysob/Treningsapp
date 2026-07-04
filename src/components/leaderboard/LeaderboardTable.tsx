"use client";

import { useState } from "react";
import type { WeeklyLeaderboardRow } from "@/lib/leaderboard/weekly";
import { Podium } from "./Podium";

type SortKey = "totalTss" | "totalDurationSec" | "longestDurationSec" | "totalElevationM";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "totalTss", label: "TSS" },
  { key: "totalDurationSec", label: "Tid" },
  { key: "longestDurationSec", label: "Lengste" },
  { key: "totalElevationM", label: "Høyde" },
];

function formatDuration(sec: number): string {
  const hours = Math.floor(sec / 3600);
  const minutes = Math.round((sec % 3600) / 60);
  return hours > 0 ? `${hours}t ${minutes}m` : `${minutes}m`;
}

function formatValue(row: WeeklyLeaderboardRow, key: SortKey): string {
  if (key === "totalTss") return row.totalTss.toFixed(0);
  if (key === "totalElevationM") return `${row.totalElevationM.toFixed(0)} m`;
  return formatDuration(row[key]);
}

export function LeaderboardTable({
  rows,
  currentUserId,
}: {
  rows: WeeklyLeaderboardRow[];
  currentUserId: string;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("totalTss");

  if (rows.length === 0) {
    return (
      <div className="surface-card flex flex-col items-center gap-3 p-12 text-center">
        <span className="text-3xl">🏆</span>
        <p className="font-semibold text-zinc-400">Ingen aktiviteter denne uken</p>
        <p className="text-sm text-zinc-600">Synk Strava og kom i gang!</p>
      </div>
    );
  }

  const sorted = [...rows].sort((a, b) => b[sortKey] - a[sortKey]);

  return (
    <div className="surface-card overflow-hidden">
      <Podium rows={sorted} currentUserId={currentUserId} valueKey={sortKey} />

      <div className="flex gap-1 overflow-x-auto border-t border-white/5 p-2">
        {COLUMNS.map((col) => (
          <button
            key={col.key}
            onClick={() => setSortKey(col.key)}
            className={
              sortKey === col.key
                ? "shrink-0 rounded-full bg-[#ff6b2b] px-3.5 py-1.5 text-xs font-bold text-white"
                : "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-white/6 hover:text-zinc-300"
            }
          >
            {col.label}
          </button>
        ))}
      </div>

      <div className="divide-y divide-white/4">
        {sorted.map((row, i) => {
          const isMe = row.userId === currentUserId;
          return (
            <div
              key={row.userId}
              className={`flex items-center gap-3 px-4 py-3.5 ${isMe ? "bg-[#ff6b2b]/8" : ""}`}
            >
              <span className="w-5 shrink-0 text-center font-mono text-sm font-bold text-zinc-600">
                {i + 1}
              </span>
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isMe
                    ? "bg-[#ff6b2b]/20 text-[#ff8f4c] ring-2 ring-[#ff6b2b]/30"
                    : "bg-white/6 text-zinc-400"
                }`}
              >
                {row.userName?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate font-semibold ${isMe ? "text-[#ff8f4c]" : "text-zinc-200"}`}>
                  {row.userName ?? "Ukjent"}
                </p>
              </div>
              <p className="shrink-0 font-mono text-sm font-bold tabular-nums text-zinc-300">
                {formatValue(row, sortKey)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
