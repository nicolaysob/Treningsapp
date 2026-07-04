import { requireUserId } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
} from "@/app/(app)/friends/actions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";

const ERROR_MESSAGES: Record<string, string> = {
  notfound: "Fant ingen bruker med det brukernavnet.",
  self: "Du kan ikke legge til deg selv.",
  exists: "Dere er allerede venner, eller det finnes allerede en forespørsel.",
};

export default async function FriendsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { userId } = await requireUserId();

  const { error } = await searchParams;

  const [incoming, outgoing, accepted] = await Promise.all([
    prisma.friendship.findMany({
      where: { addresseeId: userId, status: "PENDING" },
      include: { requester: { select: { id: true, name: true, username: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.friendship.findMany({
      where: { requesterId: userId, status: "PENDING" },
      include: { addressee: { select: { id: true, name: true, username: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.friendship.findMany({
      where: { status: "ACCEPTED", OR: [{ requesterId: userId }, { addresseeId: userId }] },
      include: {
        requester: { select: { id: true, name: true, username: true } },
        addressee: { select: { id: true, name: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const friends = accepted.map((f) => ({
    friendshipId: f.id,
    user: f.requesterId === userId ? f.addressee : f.requester,
  }));

  return (
    <>
      <PageHeader title="Venner" subtitle="Legg til venner for å konkurrere på leaderboard" />

      {error && ERROR_MESSAGES[error] && <Alert>{ERROR_MESSAGES[error]}</Alert>}

      <div className="flex flex-col gap-5">
        <Card>
          <form action={sendFriendRequest} className="flex items-end gap-3">
            <Field label="Legg til venn (brukernavn)" className="flex-1">
              <Input type="text" name="username" required autoCapitalize="off" />
            </Field>
            <Button type="submit" size="sm">
              Send
            </Button>
          </form>
        </Card>

        {incoming.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Innkommende forespørsler
            </h2>
            <Card padding="none">
              {incoming.map((f, i) => (
                <div
                  key={f.id}
                  className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-zinc-800/80" : ""}`}
                >
                  <span className="font-medium text-zinc-100">
                    {f.requester.name ?? f.requester.username}
                  </span>
                  <div className="flex gap-2">
                    <form action={acceptFriendRequest}>
                      <input type="hidden" name="id" value={f.id} />
                      <Button type="submit" size="sm">
                        Godta
                      </Button>
                    </form>
                    <form action={declineFriendRequest}>
                      <input type="hidden" name="id" value={f.id} />
                      <Button type="submit" variant="secondary" size="sm">
                        Avslå
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </Card>
          </section>
        )}

        {outgoing.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Sendte forespørsler
            </h2>
            <Card padding="none">
              {outgoing.map((f, i) => (
                <div
                  key={f.id}
                  className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-zinc-800/80" : ""}`}
                >
                  <span className="font-medium text-zinc-100">
                    {f.addressee.name ?? f.addressee.username}
                  </span>
                  <span className="text-sm text-zinc-500">Venter…</span>
                </div>
              ))}
            </Card>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Venner ({friends.length})
          </h2>
          {friends.length === 0 ? (
            <Card>
              <p className="text-sm text-zinc-500">
                Ingen venner ennå. Legg til noen ovenfor for å se dem på leaderboard.
              </p>
            </Card>
          ) : (
            <Card padding="none">
              {friends.map(({ friendshipId, user }, i) => (
                <div
                  key={friendshipId}
                  className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-zinc-800/80" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-sm font-medium text-zinc-300">
                      {(user.name ?? user.username ?? "?")[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-zinc-100">{user.name ?? user.username}</span>
                  </div>
                  <form action={removeFriend}>
                    <input type="hidden" name="id" value={friendshipId} />
                    <button
                      type="submit"
                      className="text-sm text-zinc-500 transition-colors hover:text-red-400"
                    >
                      Fjern
                    </button>
                  </form>
                </div>
              ))}
            </Card>
          )}
        </section>
      </div>
    </>
  );
}
