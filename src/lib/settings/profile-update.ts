import { prisma } from "@/lib/db";
import { invalidateUserCache } from "@/lib/cache/user-data";

const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

export function parseAvatarUpdate(raw: string | null | undefined): string | null | undefined {
  if (!raw || raw === "keep") return undefined;
  if (raw === "clear") return null;
  if (
    !raw.startsWith("data:image/jpeg;base64,") &&
    !raw.startsWith("data:image/png;base64,") &&
    !raw.startsWith("data:image/webp;base64,")
  ) {
    return undefined;
  }
  if (raw.length > 150_000) return undefined;
  return raw;
}

export type ProfileUpdateError = "invalid" | "invalid_username" | "username_taken";

export async function updateUserProfile(
  userId: string,
  input: { name: string; username: string; image?: string | null },
): Promise<{ ok: true } | { ok: false; error: ProfileUpdateError }> {
  const name = input.name.trim();
  const username = input.username.trim().toLowerCase();
  const avatar = input.image === undefined ? undefined : parseAvatarUpdate(input.image);

  if (!name || name.length > 80) {
    return { ok: false, error: "invalid" };
  }
  if (!username || !USERNAME_RE.test(username)) {
    return { ok: false, error: "invalid_username" };
  }
  if (input.image !== undefined && input.image !== "keep" && input.image !== "clear" && avatar === undefined) {
    return { ok: false, error: "invalid" };
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing && existing.id !== userId) {
    return { ok: false, error: "username_taken" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      username,
      ...(avatar !== undefined ? { image: avatar } : {}),
    },
  });

  invalidateUserCache(userId);
  return { ok: true };
}
