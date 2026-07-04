import { prisma } from "@/lib/db";

/** Accepted friend user ids (relationship is symmetric — either direction). */
export async function getFriendIds(userId: string): Promise<string[]> {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    select: { requesterId: true, addresseeId: true },
  });

  return friendships.map((f) => (f.requesterId === userId ? f.addresseeId : f.requesterId));
}
