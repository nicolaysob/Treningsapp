import { ensureProductionSchema } from "@/lib/db/ensure-schema";

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  await ensureProductionSchema();
  return children;
}
