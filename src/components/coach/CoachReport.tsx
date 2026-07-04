import Link from "next/link";
import type { CoachReport } from "@/lib/training-load/coach-report";
import type { InsightTone } from "@/lib/training-load/insight";
import type { WeeklyZoneDistribution } from "@/lib/training-load/intensity-zones";
import { ZoneDistributionChart } from "@/components/coach/ZoneDistributionChart";

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

const INTENSITY_STYLES: Record<string, string> = {
  rest: "coach-day--rest",
  easy: "coach-day--easy",
  moderate: "coach-day--moderate",
  hard: "coach-day--hard",
};

const METRIC_STATUS: Record<string, string> = {
  positive: "coach-metric--positive",
  neutral: "coach-metric--neutral",
  caution: "coach-metric--caution",
  warning: "coach-metric--warning",
};

const TREND_ARROW = { up: "↑", down: "↓", flat: "→" } as const;

export function CoachReportView({
  report,
  zoneDistribution,
  hrMaxBpm,
}: {
  report: CoachReport;
  zoneDistribution?: WeeklyZoneDistribution | null;
  hrMaxBpm?: number | null;
}) {
  const style = TONE_STYLES[report.summary.tone];

  return (
    <div className="flex flex-col gap-5">
      <div
        className={`coach-hero insight-card insight-card--${report.summary.tone} flex flex-col gap-3 rounded-2xl border p-4 sm:p-5 ${style.border}`}
      >
        <div className="flex gap-3.5">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/30 text-lg font-bold ${style.headline}`}
          >
            {style.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="insight-card__headline-row">
              <div>
                <p className="section-label text-orange-400/70">Dagens vurdering</p>
                <p className={`text-lg font-bold tracking-tight ${style.headline}`}>
                  {report.summary.headline}
                </p>
              </div>
              <div className="insight-card__readiness">
                <p className={`font-mono text-3xl font-extrabold tabular-nums leading-none ${style.readiness}`}>
                  {report.summary.readiness}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">dagsform</p>
              </div>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">{report.summary.detail}</p>
          </div>
        </div>
        {report.summary.signals.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {report.summary.signals.map((s) => (
              <span key={s.label} className={`insight-signal insight-signal--${s.severity}`}>
                {s.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {zoneDistribution && hrMaxBpm && (
        <ZoneDistributionChart distribution={zoneDistribution} hrMaxBpm={hrMaxBpm} />
      )}

      <section className="coach-section">
        <h2 className="section-label">Nøkkeltall</h2>
        <div className="coach-metrics-grid">
          {report.metrics.map((m) => (
            <div key={m.label} className={`coach-metric ${METRIC_STATUS[m.status]}`}>
              <p className="coach-metric__label">{m.label}</p>
              <p className="coach-metric__value">{m.value}</p>
              <p className="coach-metric__hint">{m.hint}</p>
            </div>
          ))}
        </div>
      </section>

      {report.trends.length > 0 && (
        <section className="coach-section">
          <h2 className="section-label">Trender</h2>
          <div className="coach-trends">
            {report.trends.map((t) => (
              <div key={t.label} className="coach-trend">
                <span className="coach-trend__arrow">{TREND_ARROW[t.direction]}</span>
                <div>
                  <p className="coach-trend__label">{t.label}</p>
                  <p className="coach-trend__value">{t.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="coach-section">
        <h2 className="section-label">Denne uken</h2>
        <div className="coach-week-grid">
          <div className="coach-week-stat">
            <p className="coach-week-stat__value">{report.weekly.sessions}</p>
            <p className="coach-week-stat__label">Treningsdager</p>
          </div>
          <div className="coach-week-stat">
            <p className="coach-week-stat__value">{report.weekly.hardSessions}</p>
            <p className="coach-week-stat__label">Harde økter</p>
          </div>
          <div className="coach-week-stat">
            <p className="coach-week-stat__value">{report.weekly.totalTss}</p>
            <p className="coach-week-stat__label">TSS uke</p>
          </div>
          <div className="coach-week-stat">
            <p className="coach-week-stat__value">{report.weekly.trainingDaysStreak}</p>
            <p className="coach-week-stat__label">Streak</p>
          </div>
        </div>
      </section>

      {report.sports.length > 0 && (
        <section className="coach-section surface-card p-4">
          <h2 className="section-label mb-3">Sportfordeling (14d)</h2>
          <div className="flex flex-col gap-2">
            {report.sports.map((s) => (
              <div key={s.sport} className="coach-sport-row">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-zinc-200">{s.label}</p>
                  <p className="text-xs text-zinc-500">
                    {s.sessions} økter · {s.tss} TSS
                  </p>
                </div>
                <div className="coach-sport-bar">
                  <div className="coach-sport-bar__fill" style={{ width: `${s.sharePct}%` }} />
                </div>
                <span className="coach-sport-pct">{s.sharePct}%</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="coach-section">
        <h2 className="section-label">De neste dagene</h2>
        <div className="flex flex-col gap-2">
          {report.dayPlan.map((day) => (
            <div key={day.label} className={`coach-day ${INTENSITY_STYLES[day.intensity]}`}>
              <p className="coach-day__label">{day.label}</p>
              <p className="coach-day__text">{day.recommendation}</p>
            </div>
          ))}
        </div>
      </section>

      {report.tips.length > 0 && (
        <section className="coach-section surface-card p-4">
          <h2 className="section-label mb-3">Anbefalte tiltak</h2>
          <ul className="insight-tips flex flex-col gap-2">
            {report.tips.map((tip) => (
              <li key={tip} className="insight-tip">
                {tip}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="coach-section">
        <h2 className="section-label">Full analyse ({report.findings.length})</h2>
        <div className="flex flex-col gap-2">
          {report.findings.map((f) => (
            <div key={`${f.category}-${f.title}`} className={`coach-finding coach-finding--${f.tone}`}>
              <div className="flex items-center gap-2">
                <span className="coach-finding__category">{f.category}</span>
                {f.signal && <span className="insight-signal insight-signal--neutral">{f.signal}</span>}
              </div>
              <p className="coach-finding__title">{f.title}</p>
              <p className="coach-finding__body">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function CoachTeaser({
  readiness,
  headline,
}: {
  readiness: number | null;
  headline: string | null;
}) {
  return (
    <Link href="/coach" className="coach-teaser animate-in animate-in-delay-2">
      <div className="coach-teaser__icon" aria-hidden>
        ✦
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-zinc-100">Treningscoach</p>
        <p className="truncate text-sm text-zinc-500">{headline ?? "Åpne coach"}</p>
      </div>
      {readiness !== null && (
        <div className="coach-teaser__score">
          <span className="font-mono text-xl font-extrabold tabular-nums text-[#ff8f4c]">
            {readiness}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            form
          </span>
        </div>
      )}
      <span className="coach-teaser__arrow">→</span>
    </Link>
  );
}
