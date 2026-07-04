export default function Loading() {
  return (
    <div className="flex flex-col gap-5 animate-in" aria-busy="true" aria-label="Laster">
      <div className="h-28 animate-pulse rounded-3xl bg-white/5" />
      <div className="grid grid-cols-3 gap-2.5">
        <div className="h-20 animate-pulse rounded-2xl bg-white/5" />
        <div className="h-20 animate-pulse rounded-2xl bg-white/5" />
        <div className="h-20 animate-pulse rounded-2xl bg-white/5" />
      </div>
      <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
      <div className="h-24 animate-pulse rounded-2xl bg-white/5" />
    </div>
  );
}
