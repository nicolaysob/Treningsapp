import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 });
  }

  const count = await prisma.friendship.count({
    where: { addresseeId: session.user.id, status: "PENDING" },
  });

  return NextResponse.json({ count });
}
