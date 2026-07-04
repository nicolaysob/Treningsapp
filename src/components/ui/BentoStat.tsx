type Variant = "blue" | "orange" | "green";

const ICONS: Record<Variant, React.ReactNode> = {
  blue: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  orange: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
    </svg>
  ),
  green: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  ),
};

const VALUE_COLORS: Record<Variant, string> = {
  blue: "text-[#4d9fff]",
  orange: "text-[#ff8f4c]",
  green: "text-[#3dd68c]",
};

const ICON_COLORS: Record<Variant, string> = {
  blue: "text-[#4d9fff]/70",
  orange: "text-[#ff8f4c]/70",
  green: "text-[#3dd68c]/70",
};

export function BentoStat({
  label,
  value,
  unit,
  variant,
}: {
  label: string;
  value: string;
  unit?: string;
  variant: Variant;
}) {
  return (
    <div className={`bento-stat bento-stat-${variant} relative`}>
      <div className="relative flex items-start justify-between">
        <span className="section-label">{label}</span>
        <span className={ICON_COLORS[variant]}>{ICONS[variant]}</span>
      </div>
      <div className="relative mt-2 flex items-baseline gap-1">
        <span className={`font-mono text-2xl font-bold tabular-nums tracking-tight ${VALUE_COLORS[variant]}`}>
          {value}
        </span>
        {unit && <span className="text-xs font-medium text-zinc-600">{unit}</span>}
      </div>
    </div>
  );
}
