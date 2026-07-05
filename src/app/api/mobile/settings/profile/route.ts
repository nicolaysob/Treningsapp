import { NextResponse } from "next/server";
import { getUserIdFromBearer } from "@/lib/auth-mobile";
import { updateUserProfile } from "@/lib/settings/profile-update";

export async function PATCH(request: Request) {
  const userId = await getUserIdFromBearer(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    name?: string;
    username?: string;
    image?: string | null;
  };

  if (!body.name || !body.username) {
    return NextResponse.json({ error: "Navn og brukernavn er påkrevd" }, { status: 400 });
  }

  const result = await updateUserProfile(userId, {
    name: body.name,
    username: body.username,
    image: body.image,
  });

  if (!result.ok) {
    const messages: Record<string, string> = {
      invalid: "Ugyldig navn eller bilde",
      invalid_username: "Brukernavn må være 3–30 tegn (a-z, 0-9, _)",
      username_taken: "Brukernavnet er allerede tatt",
    };
    return NextResponse.json({ error: messages[result.error] }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
