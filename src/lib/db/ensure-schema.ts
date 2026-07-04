import { prisma } from "@/lib/db";

let ensurePromise: Promise<void> | null = null;
let schemaReady = false;

async function probeSchema(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT "hrMaxBpm" FROM "User" LIMIT 0`;
    return true;
  } catch {
    return false;
  }
}

async function applySchemaPatches(): Promise<void> {
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
}

/**
 * One-time schema check per server instance. Skips heavy ALTER when already applied.
 */
export async function ensureProductionSchema(): Promise<void> {
  if (schemaReady) return;
  if (ensurePromise) return ensurePromise;

  ensurePromise = (async () => {
    try {
      if (await probeSchema()) {
        schemaReady = true;
        return;
      }
      await applySchemaPatches();
      schemaReady = true;
    } catch (err) {
      ensurePromise = null;
      console.error("ensureProductionSchema failed", err);
    }
  })();

  return ensurePromise;
}
