"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function sendFriendRequest(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const username = formData.get("username")?.toString().trim().toLowerCase();
  if (!username) redirect("/friends?error=notfound");

  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) redirect("/friends?error=notfound");
  if (target.id === session.user.id) redirect("/friends?error=self");

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: session.user.id, addresseeId: target.id },
        { requesterId: target.id, addresseeId: session.user.id },
      ],
    },
  });
  if (existing) redirect("/friends?error=exists");

  await prisma.friendship.create({
    data: { requesterId: session.user.id, addresseeId: target.id, status: "PENDING" },
  });

  redirect("/friends");
}

export async function acceptFriendRequest(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const id = formData.get("id")?.toString();
  if (!id) return;

  await prisma.friendship.updateMany({
    where: { id, addresseeId: session.user.id, status: "PENDING" },
    data: { status: "ACCEPTED" },
  });

  redirect("/friends");
}

export async function declineFriendRequest(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const id = formData.get("id")?.toString();
  if (!id) return;

  await prisma.friendship.deleteMany({
    where: {
      id,
      status: "PENDING",
      OR: [{ addresseeId: session.user.id }, { requesterId: session.user.id }],
    },
  });

  redirect("/friends");
}

export async function removeFriend(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const id = formData.get("id")?.toString();
  if (!id) return;

  await prisma.friendship.deleteMany({
    where: {
      id,
      status: "ACCEPTED",
      OR: [{ addresseeId: session.user.id }, { requesterId: session.user.id }],
    },
  });

  redirect("/friends");
}
