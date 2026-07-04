import { NextResponse } from "next/server";
import { getUserIdFromBearer } from "@/lib/auth-mobile";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const userId = await getUserIdFromBearer(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [incoming, outgoing, accepted] = await Promise.all([
    prisma.friendship.findMany({
      where: { addresseeId: userId, status: "PENDING" },
      include: { requester: { select: { id: true, name: true, username: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.friendship.findMany({
      where: { requesterId: userId, status: "PENDING" },
      include: { addressee: { select: { id: true, name: true, username: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.friendship.findMany({
      where: { status: "ACCEPTED", OR: [{ requesterId: userId }, { addresseeId: userId }] },
      include: {
        requester: { select: { id: true, name: true, username: true } },
        addressee: { select: { id: true, name: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const friends = accepted.map((f) => ({
    friendshipId: f.id,
    user: f.requesterId === userId ? f.addressee : f.requester,
  }));

  return NextResponse.json({
    incoming: incoming.map((r) => ({
      id: r.id,
      user: r.requester,
    })),
    outgoing: outgoing.map((r) => ({
      id: r.id,
      user: r.addressee,
    })),
    friends,
    stats: {
      friendCount: friends.length,
      pendingCount: incoming.length,
    },
  });
}
