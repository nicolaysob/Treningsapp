import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

const LABEL = "text-sm font-medium text-zinc-400";

export function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className={LABEL}>{label}</span>
      {children}
    </label>
  );
}

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`input-field w-full ${className}`} {...props} />;
}

export function Select({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`input-field w-full ${className}`} {...props}>
      {children}
    </select>
  );
}
