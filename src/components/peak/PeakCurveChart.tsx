"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatPace } from "@/lib/peak-efforts/format";

export interface PeakCurvePoint {
  durationSec: number;
  label: string;
  value: number | null;
}

export function PeakCurveChart({
  data,
  metric,
}: {
  data: PeakCurvePoint[];
  metric: "power" | "pace";
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#52525b" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#52525b" }}
            axisLine={false}
            tickLine={false}
            reversed={metric === "pace"}
          />
          <Tooltip
            contentStyle={{
              background: "#111113",
              border: "1px solid #27272a",
              borderRadius: 12,
              color: "#e4e4e7",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
            labelStyle={{ color: "#a1a1aa" }}
            formatter={(value) => {
              if (typeof value !== "number") return "—";
              return metric === "power" ? `${value.toFixed(0)} W` : formatPace(value);
            }}
          />
          <Bar
            dataKey="value"
            fill={metric === "power" ? "#4d9fff" : "#3dd68c"}
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
