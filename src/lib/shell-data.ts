import { cache } from "react";
import { getSession } from "@/lib/auth-session";
import { prisma } from "@/lib/db";

export type ShellData = {
  userName: string | null;
  userImage: string | null;
  pendingFriends: number;
};

export const getShellData = cache(async (): Promise<ShellData | null> => {
  const session = await getSession();
  if (!session?.user?.id) return null;

  const pendingFriends = await prisma.friendship.count({
    where: { addresseeId: session.user.id, status: "PENDING" },
  });

  return {
    userName: session.user.name ?? null,
    userImage: session.user.image ?? null,
    pendingFriends,
  };
});
