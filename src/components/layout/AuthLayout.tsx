import type { ReactNode } from "react";
import { AppLogo } from "@/components/brand/AppLogo";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="auth-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(128,128,128,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,0.4) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative flex w-full max-w-sm flex-col gap-7">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="logo-float">
            <AppLogo size="lg" showGlow />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">{title}</h1>
            {subtitle && (
              <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-zinc-500">{subtitle}</p>
            )}
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}
