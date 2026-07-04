const SYNC_INTERVAL_MS = 20 * 60 * 1000;
const INITIAL_DELAY_MS = 10_000;

/**
 * Background auto-sync for all users, running as long as the Node.js
 * server process is alive. Guarded against multiple registrations (Next.js
 * dev mode can call register() more than once on reload).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const globalForAutoSync = globalThis as unknown as { __autoSyncStarted?: boolean };
  if (globalForAutoSync.__autoSyncStarted) return;
  globalForAutoSync.__autoSyncStarted = true;

  const { prisma } = await import("@/lib/db");
  const { syncUserFully } = await import("@/lib/sync-user");

  async function syncAllUsers() {
    const users = await prisma.user.findMany({ select: { id: true } });
    for (const user of users) {
      try {
        await syncUserFully(user.id);
      } catch (err) {
        console.error(`Auto-sync failed for user ${user.id}`, err);
      }
    }
  }

  setTimeout(syncAllUsers, INITIAL_DELAY_MS);
  setInterval(syncAllUsers, SYNC_INTERVAL_MS);
}
