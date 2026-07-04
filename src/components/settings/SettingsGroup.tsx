import type { ReactNode } from "react";

export function SettingsGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="section-label px-1">{title}</h2>
      {children}
    </section>
  );
}

export function SettingsRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="min-w-0">
        <p className="font-semibold text-zinc-100">{title}</p>
        {description && <p className="text-sm text-zinc-500">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function SettingsDivider() {
  return <div className="border-t border-white/6" />;
}
