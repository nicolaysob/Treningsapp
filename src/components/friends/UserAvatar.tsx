import { avatarGradient, displayInitial } from "@/lib/avatar";

const SIZES = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
} as const;

export function UserAvatar({
  name,
  username,
  size = "md",
  highlight,
}: {
  name: string | null;
  username: string | null;
  size?: keyof typeof SIZES;
  highlight?: boolean;
}) {
  const label = name ?? username ?? "?";
  const initial = displayInitial(name, username);

  return (
    <div
      className={`friend-avatar flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-lg ${SIZES[size]} ${
        highlight ? "ring-2 ring-[#ff6b2b]/50 ring-offset-2 ring-offset-[var(--background)]" : ""
      }`}
      style={{ background: avatarGradient(label) }}
      aria-hidden
    >
      {initial}
    </div>
  );
}
