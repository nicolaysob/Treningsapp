import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-session";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");

  return <AppShell userName={session.user.name}>{children}</AppShell>;
}
