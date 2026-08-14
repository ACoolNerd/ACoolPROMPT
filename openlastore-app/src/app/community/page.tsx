import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hostEvent, rsvpToEvent } from "@/lib/actions";

export default async function CommunityPage() {
  const user = await getCurrentUser();
  const events = await db.event.findMany({
    orderBy: { startsAt: "asc" },
    include: {
      host: true,
      rsvps: true,
    },
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-2">Community & Events</h1>
        <p className="opacity-75 max-w-2xl">
          Intimate, in-proximity spaces for local service professionals to
          connect. Browse what&apos;s coming up, RSVP, or host your own.
        </p>
      </div>

      <div className="grid gap-4">
        {events.map((event) => {
          const going = event.rsvps.filter((r) => r.status === "GOING").length;
          const alreadyIn = user
            ? event.rsvps.some((r) => r.userId === user.id && r.status === "GOING")
            : false;

          return (
            <div key={event.id} className="border border-card-border bg-card-bg rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-semibold text-lg">{event.title}</h2>
                  <span className="text-xs uppercase tracking-wide bg-brand/10 text-brand px-2 py-0.5 rounded-full">
                    {event.category}
                  </span>
                  {event.isIntimate && (
                    <span className="text-xs uppercase tracking-wide bg-gold/20 text-gold px-2 py-0.5 rounded-full">
                      Intimate space
                    </span>
                  )}
                </div>
                <p className="text-sm opacity-80 mt-1 max-w-xl">{event.description}</p>
                <p className="text-xs opacity-60 mt-2">
                  Hosted by {event.host.name} · {event.location} ·{" "}
                  {event.startsAt.toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  · {going}/{event.capacity} going
                </p>
              </div>
              <form action={rsvpToEvent}>
                <input type="hidden" name="eventId" value={event.id} />
                <button
                  type="submit"
                  disabled={alreadyIn}
                  className="whitespace-nowrap bg-brand text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                  {alreadyIn ? "You're going ✓" : "RSVP"}
                </button>
              </form>
            </div>
          );
        })}
        {events.length === 0 && <p className="opacity-70">No events yet — host the first one below.</p>}
      </div>

      <div className="border border-card-border bg-card-bg rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Host an event</h2>
        {user ? (
          <form action={hostEvent} className="grid sm:grid-cols-2 gap-4">
            <Field label="Title" name="title" required />
            <Field label="Category" name="category" placeholder="Wellness, Networking, Collectibles…" />
            <Field label="Location" name="location" required />
            <Field label="Capacity" name="capacity" type="number" defaultValue="12" />
            <Field label="Starts at" name="startsAt" type="datetime-local" required />
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" name="isIntimate" defaultChecked />
              Keep this an intimate, small-group space
            </label>
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1" htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                className="w-full rounded-md border border-card-border bg-transparent px-3 py-2"
              />
            </div>
            <button type="submit" className="sm:col-span-2 bg-brand text-white rounded-md py-2 font-medium hover:bg-brand-dark transition-colors">
              Publish event
            </button>
          </form>
        ) : (
          <p className="opacity-70 text-sm">
            <a href="/login" className="text-brand underline">Sign in</a> to host an event.
          </p>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-sm mb-1" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-card-border bg-transparent px-3 py-2"
      />
    </div>
  );
}
