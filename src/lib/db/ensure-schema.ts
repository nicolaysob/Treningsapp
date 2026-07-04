import { prisma } from "@/lib/db";

let ensurePromise: Promise<void> | null = null;

/**
 * Applies pending schema changes on production when Prisma migrations
 * were not run against Neon (common with pooled DATABASE_URL on Vercel).
 */
export async function ensureProductionSchema(): Promise<void> {
  if (ensurePromise) return ensurePromise;

  ensurePromise = (async () => {
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "hrMaxBpm" INTEGER;
        ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "zoneS1Sec" INTEGER;
        ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "zoneS2Sec" INTEGER;
        ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "zoneS3Sec" INTEGER;
        ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "zoneS4Sec" INTEGER;
        ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "zoneS5Sec" INTEGER;
        ALTER TABLE "Activity" DROP COLUMN IF EXISTS "zoneEasySec";
        ALTER TABLE "Activity" DROP COLUMN IF EXISTS "zoneModerateSec";
        ALTER TABLE "Activity" DROP COLUMN IF EXISTS "zoneHardSec";
      `);
    } catch (err) {
      console.error("ensureProductionSchema failed", err);
    }
  })();

  return ensurePromise;
}
