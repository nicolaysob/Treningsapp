import { NextResponse } from "next/server";
import { getUserIdFromBearer } from "@/lib/auth-mobile";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const userId = await getUserIdFromBearer(_request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.friendship.updateMany({
    where: { id, addresseeId: userId, status: "PENDING" },
    data: { status: "ACCEPTED" },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const userId = await getUserIdFromBearer(_request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.friendship.deleteMany({
    where: {
      id,
      OR: [{ addresseeId: userId }, { requesterId: userId }],
    },
  });

  return NextResponse.json({ ok: true });
}
