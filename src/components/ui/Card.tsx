import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  padding = "default",
}: {
  children: ReactNode;
  className?: string;
  padding?: "none" | "default" | "lg";
}) {
  const paddingClass =
    padding === "none" ? "" : padding === "lg" ? "p-5 sm:p-6" : "p-4 sm:p-5";

  return (
    <section className={`surface-card ${paddingClass} ${className}`}>{children}</section>
  );
}

export function CardHeader({
  title,
  action,
  subtitle,
}: {
  title: string;
  action?: ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-bold tracking-tight text-zinc-50">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-xs font-medium text-zinc-600">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
