import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const getSession = cache(auth);

export async function requireUserId(): Promise<{ userId: string; userName: string | null | undefined }> {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");
  return { userId: session.user.id, userName: session.user.name };
}
