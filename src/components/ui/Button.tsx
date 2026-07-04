import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "btn-primary bg-gradient-to-r from-[#ff6b2b] to-[#ff8f4c] text-white shadow-lg shadow-orange-950/40 hover:brightness-110 active:scale-[0.98]",
  secondary:
    "border border-white/10 bg-white/4 text-zinc-200 hover:border-white/15 hover:bg-white/8",
  ghost: "text-zinc-500 hover:text-zinc-200",
  danger:
    "border border-red-900/40 bg-red-500/10 text-red-300 hover:border-red-700 hover:bg-red-500/15",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all disabled:opacity-50";

const SIZES = {
  sm: "px-3.5 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: keyof typeof SIZES;
}) {
  return (
    <button
      className={`${BASE} ${SIZES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  size?: keyof typeof SIZES;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`${BASE} ${SIZES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
