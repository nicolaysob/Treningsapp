export function AnimatedProgress({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className="progress-bar">
      <div
        className="progress-bar-fill progress-bar-animate"
        style={{ "--target": `${clamped}%` } as React.CSSProperties}
      />
    </div>
  );
}
