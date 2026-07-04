import { avatarGradient, displayInitial } from "@/lib/avatar";

const SIZES = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
} as const;

export function UserAvatar({
  name,
  username,
  image,
  size = "md",
  highlight,
}: {
  name: string | null;
  username: string | null;
  image?: string | null;
  size?: keyof typeof SIZES;
  highlight?: boolean;
}) {
  const label = name ?? username ?? "?";
  const initial = displayInitial(name, username);
  const ringClass = highlight
    ? "ring-2 ring-[#ff6b2b]/50 ring-offset-2 ring-offset-[var(--background)]"
    : "";

  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- profile avatars may be data URLs
      <img
        src={image}
        alt=""
        className={`friend-avatar shrink-0 rounded-full object-cover ${SIZES[size]} ${ringClass}`}
      />
    );
  }

  return (
    <div
      className={`friend-avatar flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-lg ${SIZES[size]} ${ringClass}`}
      style={{ background: avatarGradient(label) }}
      aria-hidden
    >
      {initial}
    </div>
  );
}
