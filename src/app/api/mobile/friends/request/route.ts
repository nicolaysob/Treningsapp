import { NextResponse } from "next/server";
import { getUserIdFromBearer } from "@/lib/auth-mobile";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const userId = await getUserIdFromBearer(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { username?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 });
  }

  const username = body.username?.toString().trim().toLowerCase();
  if (!username) {
    return NextResponse.json({ error: "notfound" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) return NextResponse.json({ error: "notfound" }, { status: 400 });
  if (target.id === userId) return NextResponse.json({ error: "self" }, { status: 400 });

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: userId, addresseeId: target.id },
        { requesterId: target.id, addresseeId: userId },
      ],
    },
  });
  if (existing) return NextResponse.json({ error: "exists" }, { status: 400 });

  await prisma.friendship.create({
    data: { requesterId: userId, addresseeId: target.id, status: "PENDING" },
  });

  return NextResponse.json({ ok: true });
}
