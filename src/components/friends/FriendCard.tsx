import { removeFriend } from "@/app/(app)/friends/actions";
import { UserAvatar } from "@/components/friends/UserAvatar";

export function FriendCard({
  friendshipId,
  name,
  username,
}: {
  friendshipId: string;
  name: string | null;
  username: string | null;
}) {
  const displayName = name ?? username ?? "Ukjent";

  return (
    <div className="friend-card surface-card-interactive">
      <UserAvatar name={name} username={username} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-zinc-100">{displayName}</p>
        {username && (
          <p className="truncate text-xs text-zinc-500">@{username}</p>
        )}
      </div>
      <form action={removeFriend} className="shrink-0">
        <input type="hidden" name="id" value={friendshipId} />
        <button
          type="submit"
          className="friend-remove-btn"
          aria-label={`Fjern ${displayName}`}
          title="Fjern venn"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </form>
    </div>
  );
}

export function FriendsEmpty() {
  return (
    <div className="friend-empty animate-in">
      <div className="friend-empty__icon" aria-hidden>
        👥
      </div>
      <h3 className="text-lg font-bold text-zinc-100">Bygg gjengen din</h3>
      <p className="mt-1 max-w-xs text-sm text-zinc-500">
        Søk etter brukernavn ovenfor for å sende en venneforespørsel.
      </p>
    </div>
  );
}
