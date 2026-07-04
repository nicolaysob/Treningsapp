"use client";

import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface PmcPoint {
  date: string;
  ctl: number;
  atl: number;
  tsb: number;
}

const SERIES_LABELS: Record<string, string> = {
  ctl: "CTL (fitness)",
  atl: "ATL (fatigue)",
  tsb: "TSB (form)",
};

export function PmcChart({ data }: { data: PmcPoint[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) =>
              new Date(value).toLocaleDateString("nb-NO", { day: "numeric", month: "short" })
            }
            minTickGap={30}
            tick={{ fontSize: 10, fill: "#45454f" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#45454f" }}
            axisLine={false}
            tickLine={false}
          />
          <ReferenceLine y={0} stroke="#27272a" strokeDasharray="4 4" />
          <Tooltip
            contentStyle={{
              background: "#111113",
              border: "1px solid #27272a",
              borderRadius: 12,
              color: "#e4e4e7",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
            labelStyle={{ color: "#a1a1aa" }}
            labelFormatter={(value) =>
              typeof value === "string" ? new Date(value).toLocaleDateString("nb-NO") : value
            }
            formatter={(value, name) => [
              typeof value === "number" ? value.toFixed(1) : String(value),
              SERIES_LABELS[String(name)] ?? String(name),
            ]}
          />
          <Line
            type="monotone"
            dataKey="ctl"
            name="ctl"
            stroke="#4d9fff"
            strokeWidth={2.5}
            filter="drop-shadow(0 0 4px rgba(77,159,255,0.4))"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="atl"
            name="atl"
            stroke="#ff6b2b"
            strokeWidth={2}
            filter="drop-shadow(0 0 4px rgba(255,107,43,0.35))"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="tsb"
            name="tsb"
            stroke="#3dd68c"
            strokeWidth={2}
            filter="drop-shadow(0 0 4px rgba(61,214,140,0.35))"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
