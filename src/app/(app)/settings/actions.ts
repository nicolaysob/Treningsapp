"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { syncUserFully } from "@/lib/sync-user";
import { invalidateUserCache } from "@/lib/cache/user-data";

const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

function parseAvatarUpdate(raw: string | null): string | null | undefined {
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

export async function updateAccount(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const name = formData.get("name")?.toString().trim();
  const username = formData.get("username")?.toString().trim().toLowerCase();
  const avatarRaw = formData.get("avatar")?.toString() ?? "keep";
  const avatar = parseAvatarUpdate(avatarRaw);

  if (!name || name.length > 80) {
    redirect("/settings?profile=invalid");
  }
  if (!username || !USERNAME_RE.test(username)) {
    redirect("/settings?profile=invalid_username");
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing && existing.id !== session.user.id) {
    redirect("/settings?profile=username_taken");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      username,
      ...(avatar !== undefined ? { image: avatar } : {}),
    },
  });

  invalidateUserCache(session.user.id);
  redirect("/settings?profile=saved");
}

export async function syncStrava() {
  const session = await auth();
  if (!session?.user?.id) return;
  const userId = session.user.id;

  after(async () => {
    try {
      await syncUserFully(userId);
    } catch (err) {
      console.error("Background Strava sync failed", err);
    }
  });

  redirect("/settings?sync=started");
}

export async function disconnectStrava() {
  const session = await auth();
  if (!session?.user?.id) return;
  await prisma.account.deleteMany({
    where: { userId: session.user.id, provider: "strava" },
  });
  redirect("/settings");
}
