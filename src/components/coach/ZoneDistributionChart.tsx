import { formatDateNb, parseCalendarDateKey } from "@/lib/date";
import { getOltZoneDef, formatOltZoneRange } from "@/lib/training-load/olt-zones";
import {
  formatDurationShort,
  type WeeklyZoneDistribution,
} from "@/lib/training-load/intensity-zones";
import { Card, CardHeader } from "@/components/ui/Card";

const ZONE_COLORS: Record<string, string> = {
  z1: "zone-bar__seg--z1",
  z2: "zone-bar__seg--z2",
  z3: "zone-bar__seg--z3",
  z4: "zone-bar__seg--z4",
  z5: "zone-bar__seg--z5",
};

export function ZoneDistributionChart({
  distribution,
  hrMaxBpm,
}: {
  distribution: WeeklyZoneDistribution;
  hrMaxBpm: number;
}) {
  const visibleZones = distribution.zones.filter((z) => z.durationSec > 0);
  const weekLabel = `${formatDateNb(parseCalendarDateKey(distribution.weekStart), { day: "numeric", month: "short" })} – ${distribution.weekEnd}`;
  const hasData = distribution.classifiedDurationSec > 0;
  const easyPct = Math.round(distribution.easyPercent);
  const hardPct = Math.round(distribution.hardPercent);
  const easyOk = easyPct >= distribution.targetEasyPercent - 10;
  const hardOk = hardPct <= distribution.targetHardPercent + 10;

  return (
    <Card className="zone-chart-card">
      <CardHeader
        title="Pulssoner"
        subtitle={`${hrMaxBpm} maks · ${weekLabel}`}
      />

      {!hasData ? (
        <div className="zone-chart__empty">Ingen pulsdata denne uken</div>
      ) : (
        <>
          <div className="zone-bar" role="img" aria-label="Pulssonefordeling denne uken">
            {visibleZones.map((z) => (
              <div
                key={z.zone}
                className={`zone-bar__seg ${ZONE_COLORS[z.zone]}`}
                style={{ width: `${z.percent}%` }}
                title={`${z.label} ${Math.round(z.percent)}%`}
              />
            ))}
          </div>

          <div className="zone-chart__summary">
            <div className={`zone-chart__summary-item ${easyOk ? "zone-chart__summary-item--ok" : "zone-chart__summary-item--off"}`}>
              <p className="zone-chart__summary-label">Lett · sone 1–2</p>
              <p className="zone-chart__summary-value">{easyPct}%</p>
              <p className="zone-chart__summary-goal">Mål 80%</p>
            </div>
            <div className={`zone-chart__summary-item ${hardOk ? "zone-chart__summary-item--ok" : "zone-chart__summary-item--off"}`}>
              <p className="zone-chart__summary-label">Hard · sone 4–5</p>
              <p className="zone-chart__summary-value">{hardPct}%</p>
              <p className="zone-chart__summary-goal">Mål 20%</p>
            </div>
          </div>

          <ul className="zone-chart__legend">
            {visibleZones.map((z) => {
              const def = getOltZoneDef(z.zone);
              return (
                <li key={z.zone} className="zone-chart__legend-item">
                  <span className={`zone-chart__dot ${ZONE_COLORS[z.zone]}`} />
                  <div className="zone-chart__legend-text">
                    <span className="zone-chart__legend-label">{z.label}</span>
                    {def && <span className="zone-chart__legend-range">{formatOltZoneRange(def)}</span>}
                  </div>
                  <span className="zone-chart__legend-value">{Math.round(z.percent)}%</span>
                  <span className="zone-chart__legend-time">{formatDurationShort(z.durationSec)}</span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Card>
  );
}
