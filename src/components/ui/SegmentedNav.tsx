import Link from "next/link";

export function SegmentedNav({
  items,
  activeValue,
  paramName,
  basePath,
}: {
  items: { value: string; label: string }[];
  activeValue: string;
  paramName: string;
  basePath: string;
}) {
  return (
    <div className="inline-flex gap-0.5 rounded-full border border-white/8 bg-black/30 p-1 text-xs backdrop-blur-sm">
      {items.map((item) => {
        const isActive = item.value === activeValue;
        return (
          <Link
            key={item.value}
            href={`${basePath}?${paramName}=${item.value}`}
            className={
              isActive
                ? "rounded-full bg-[#ff6b2b] px-3 py-1.5 font-bold text-white shadow-sm shadow-orange-950/40"
                : "rounded-full px-3 py-1.5 font-semibold text-zinc-500 transition-colors hover:text-zinc-300"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export function WeekNav({
  prevHref,
  nextHref,
  label,
}: {
  prevHref: string;
  nextHref: string;
  label: string;
}) {
  return (
    <div className="surface-card flex items-center justify-between px-4 py-3">
      <Link
        href={prevHref}
        className="flex items-center gap-1 text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-200"
      >
        ←
      </Link>
      <span className="text-sm font-bold text-zinc-200">{label}</span>
      <Link
        href={nextHref}
        className="flex items-center gap-1 text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-200"
      >
        →
      </Link>
    </div>
  );
}
