import Link from "next/link";
import { requireUserId } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { startOfIsoWeek } from "@/lib/date";
import { getWeeklyLeaderboard } from "@/lib/leaderboard/weekly";
import { AddFriendForm } from "@/components/friends/AddFriendForm";
import { FriendCard, FriendsEmpty } from "@/components/friends/FriendCard";
import { FriendsWeekPreview } from "@/components/friends/FriendsWeekPreview";
import { IncomingRequests } from "@/components/friends/IncomingRequests";
import { OutgoingRequests } from "@/components/friends/OutgoingRequests";
import { Alert } from "@/components/ui/Alert";
import { BentoStat } from "@/components/ui/BentoStat";

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

  const friendIds = friends.map((f) => f.user.id);
  const weekRows =
    friendIds.length > 0
      ? await getWeeklyLeaderboard(startOfIsoWeek(new Date()), [userId, ...friendIds])
      : [];
  const tssByUserId = new Map(weekRows.map((r) => [r.userId, r.totalTss]));

  const myWeekTss = tssByUserId.get(userId) ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="hero-card animate-in p-5 sm:p-6">
        <div className="relative z-10">
          <p className="section-label text-orange-400/80">Treningsgjengen</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Venner
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {friends.length > 0
              ? `${friends.length} ${friends.length === 1 ? "venn" : "venner"} · konkurrer på duell`
              : "Legg til venner og konkurrer på ukentlig duell"}
          </p>
          <AddFriendForm />
        </div>
      </div>

      {error && ERROR_MESSAGES[error] && <Alert>{ERROR_MESSAGES[error]}</Alert>}

      <div className="grid grid-cols-3 gap-2">
        <BentoStat label="Venner" value={String(friends.length)} variant="orange" />
        <BentoStat
          label="Ventende"
          value={String(incoming.length)}
          variant="blue"
        />
        <BentoStat
          label="Din TSS"
          value={myWeekTss > 0 ? myWeekTss.toFixed(0) : "—"}
          unit={myWeekTss > 0 ? "uke" : undefined}
          variant="green"
        />
      </div>

      <IncomingRequests requests={incoming} />

      {friends.length > 0 && (
        <FriendsWeekPreview rows={weekRows} currentUserId={userId} />
      )}

      <OutgoingRequests requests={outgoing} />

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="section-label">Gjengen</h2>
          {friends.length > 0 && (
            <Link
              href="/leaderboard"
              className="text-xs font-semibold text-zinc-500 transition-colors hover:text-[#ff8f4c]"
            >
              Duell →
            </Link>
          )}
        </div>

        {friends.length === 0 ? (
          <FriendsEmpty />
        ) : (
          <div className="flex flex-col gap-2">
            {friends.map(({ friendshipId, user }) => (
              <FriendCard
                key={friendshipId}
                friendshipId={friendshipId}
                name={user.name}
                username={user.username}
                weekTss={tssByUserId.get(user.id) ?? 0}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
