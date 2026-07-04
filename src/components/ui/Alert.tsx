export function Alert({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-red-900/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      {children}
    </p>
  );
}
