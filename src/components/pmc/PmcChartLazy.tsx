"use client";

import dynamic from "next/dynamic";
import type { PmcPoint } from "./PmcChart";

const PmcChart = dynamic(
  () => import("./PmcChart").then((mod) => mod.PmcChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-80 items-center justify-center rounded-xl bg-white/3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-[#ff6b2b]" />
      </div>
    ),
  },
);

export function PmcChartLazy({ data }: { data: PmcPoint[] }) {
  return <PmcChart data={data} />;
}
