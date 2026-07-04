import { acceptFriendRequest, declineFriendRequest } from "@/app/(app)/friends/actions";
import { UserAvatar } from "@/components/friends/UserAvatar";

type Request = {
  id: string;
  requester: { id: string; name: string | null; username: string | null };
};

export function IncomingRequests({ requests }: { requests: Request[] }) {
  if (requests.length === 0) return null;

  return (
    <section className="flex flex-col gap-3 animate-in">
      <div className="flex items-center gap-2">
        <h2 className="section-label">Innkommende</h2>
        <span className="friend-badge">{requests.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {requests.map((f) => (
          <div key={f.id} className="friend-request-card">
            <UserAvatar name={f.requester.name} username={f.requester.username} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-zinc-100">
                {f.requester.name ?? f.requester.username}
              </p>
              {f.requester.username && f.requester.name && (
                <p className="truncate text-xs text-zinc-500">@{f.requester.username}</p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <form action={acceptFriendRequest}>
                <input type="hidden" name="id" value={f.id} />
                <button type="submit" className="friend-btn friend-btn--accept">
                  Godta
                </button>
              </form>
              <form action={declineFriendRequest}>
                <input type="hidden" name="id" value={f.id} />
                <button type="submit" className="friend-btn friend-btn--decline">
                  Avslå
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
