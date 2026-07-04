import { ensureProductionSchema } from "@/lib/db/ensure-schema";
import { getShellData } from "@/lib/shell-data";
import { ShellProvider } from "@/components/layout/ShellProvider";

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  await ensureProductionSchema();
  const shellData = await getShellData();

  return <ShellProvider value={shellData}>{children}</ShellProvider>;
}
