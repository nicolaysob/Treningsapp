import Link from "next/link";

export function SettingsLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 rounded-xl px-1 py-2 transition-colors hover:bg-white/4"
    >
      <div>
        <p className="font-semibold text-zinc-100">{title}</p>
        <p className="text-sm text-zinc-500">{description}</p>
      </div>
      <span className="text-zinc-600">→</span>
    </Link>
  );
}
