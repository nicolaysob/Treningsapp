import { NextResponse } from "next/server";
import { authenticateUser, signMobileToken } from "@/lib/auth-mobile";

export async function POST(request: Request) {
  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 });
  }

  const username = body.username?.toString() ?? "";
  const password = body.password?.toString() ?? "";

  const user = await authenticateUser(username, password);
  if (!user) {
    return NextResponse.json({ error: "Feil brukernavn eller passord" }, { status: 401 });
  }

  const token = await signMobileToken(user.id);

  return NextResponse.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
    },
  });
}
