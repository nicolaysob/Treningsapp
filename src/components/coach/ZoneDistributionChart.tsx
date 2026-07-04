import Link from "next/link";
import { formatDateNb, parseCalendarDateKey } from "@/lib/date";
import {
  formatDurationShort,
  type WeeklyZoneDistribution,
} from "@/lib/training-load/intensity-zones";

const ZONE_COLORS: Record<string, string> = {
  z1: "zone-bar__seg--z1",
  z2: "zone-bar__seg--z2",
  z3: "zone-bar__seg--z3",
  z4: "zone-bar__seg--z4",
  z5: "zone-bar__seg--z5",
};

export function ZoneDistributionChart({
  distribution,
}: {
  distribution: WeeklyZoneDistribution;
}) {
  const visibleZones = distribution.zones.filter((z) => z.durationSec > 0);
  const weekLabel = `${formatDateNb(parseCalendarDateKey(distribution.weekStart), { day: "numeric", month: "short" })} – ${distribution.weekEnd}`;
  const hasData = distribution.classifiedDurationSec > 0;
  const easyOk =
    distribution.easyPercent >= distribution.targetEasyPercent - 10 &&
    distribution.hardPercent <= distribution.targetHardPercent + 10;

  return (
    <section className="coach-section zone-chart">
      <div className="zone-chart__header">
        <h2 className="section-label">OLT denne uken</h2>
        <p className="zone-chart__range">{weekLabel}</p>
      </div>

      {!hasData ? (
        <div className="zone-chart__empty">
          <Link href="/settings/training" className="zone-chart__empty-link">
            Sett makspuls →
          </Link>
        </div>
      ) : (
        <>
          <div className="zone-bar" role="img" aria-label="Olympiatoppen sonefordeling">
            {visibleZones.map((z) => (
              <div
                key={z.zone}
                className={`zone-bar__seg ${ZONE_COLORS[z.zone]}`}
                style={{ width: `${z.percent}%` }}
                title={`${z.label} ${Math.round(z.percent)}%`}
              />
            ))}
          </div>

          <div className="zone-chart__targets">
            <span>Mål 80% sone 1–2 · 20% sone 4–5</span>
            <span className={easyOk ? "zone-chart__status--ok" : "zone-chart__status--off"}>
              {Math.round(distribution.easyPercent)}/{Math.round(distribution.hardPercent)}
            </span>
          </div>

          <ul className="zone-chart__legend">
            {visibleZones.map((z) => (
              <li key={z.zone} className="zone-chart__legend-item">
                <span className={`zone-chart__dot ${ZONE_COLORS[z.zone]}`} />
                <span className="zone-chart__legend-label">{z.label}</span>
                <span className="zone-chart__legend-value">{Math.round(z.percent)}%</span>
                <span className="zone-chart__legend-time">{formatDurationShort(z.durationSec)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
