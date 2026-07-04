import { NextResponse } from "next/server";
import { getUserIdFromBearer } from "@/lib/auth-mobile";
import { prisma } from "@/lib/db";
import { parseCalendarDateKey } from "@/lib/date";
import type { Sport } from "@prisma/client";

const SPORTS: Sport[] = ["RIDE", "RUN", "SWIM", "STRENGTH", "OTHER"];

export async function POST(request: Request) {
  const userId = await getUserIdFromBearer(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { date?: string; sport?: string; description?: string; durationMin?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 });
  }

  const date = body.date?.toString();
  const sport = body.sport?.toString() as Sport | undefined;
  const description = body.description?.toString().trim();
  const durationMin = Number(body.durationMin);

  if (!date || !sport || !SPORTS.includes(sport) || !description || !Number.isFinite(durationMin) || durationMin < 1) {
    return NextResponse.json({ error: "Ugyldig data" }, { status: 400 });
  }

  const workout = await prisma.plannedWorkout.create({
    data: {
      userId,
      date: parseCalendarDateKey(date),
      sport,
      description,
      durationMin,
    },
    select: { id: true, date: true, sport: true, description: true, durationMin: true },
  });

  return NextResponse.json({
    ...workout,
    date: workout.date.toISOString(),
  });
}

export async function DELETE(request: Request) {
  const userId = await getUserIdFromBearer(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Mangler id" }, { status: 400 });
  }

  await prisma.plannedWorkout.deleteMany({
    where: { id, userId },
  });

  return NextResponse.json({ ok: true });
}
