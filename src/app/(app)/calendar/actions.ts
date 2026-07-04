"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseCalendarDateKey } from "@/lib/date";
import type { Sport } from "@prisma/client";

export async function createPlannedWorkout(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Ikke innlogget");

  const date = formData.get("date")?.toString();
  const sport = formData.get("sport")?.toString() as Sport | undefined;
  const description = formData.get("description")?.toString().trim();
  const durationMin = parseInt(formData.get("durationMin")?.toString() ?? "", 10);

  if (!date || !sport || !description || !Number.isFinite(durationMin) || durationMin < 1) {
    throw new Error("Ugyldig data");
  }

  await prisma.plannedWorkout.create({
    data: {
      userId: session.user.id,
      date: parseCalendarDateKey(date),
      sport,
      description,
      durationMin,
    },
  });

  revalidatePath("/calendar");
}

export async function deletePlannedWorkout(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Ikke innlogget");

  const id = formData.get("id")?.toString();
  if (!id) throw new Error("Mangler id");

  await prisma.plannedWorkout.deleteMany({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/calendar");
}
