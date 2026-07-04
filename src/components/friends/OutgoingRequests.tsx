import { UserAvatar } from "@/components/friends/UserAvatar";

type Request = {
  id: string;
  addressee: { id: string; name: string | null; username: string | null };
};

export function OutgoingRequests({ requests }: { requests: Request[] }) {
  if (requests.length === 0) return null;

  return (
    <section className="flex flex-col gap-3 animate-in">
      <h2 className="section-label">Sendt</h2>
      <div className="flex flex-wrap gap-2">
        {requests.map((f) => (
          <div key={f.id} className="friend-pending-pill">
            <UserAvatar name={f.addressee.name} username={f.addressee.username} size="sm" />
            <span className="max-w-[8rem] truncate text-sm font-medium text-zinc-300">
              {f.addressee.name ?? f.addressee.username}
            </span>
            <span className="friend-pending-dot" aria-label="Venter" />
          </div>
        ))}
      </div>
    </section>
  );
}
