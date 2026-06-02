import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/app/admin/actions";
import { EventActions } from "@/components/event_actions";
import { EventForm } from "@/components/event_form";
import { requireAdmin } from "@/lib/auth";
import type { EventRecord } from "@/lib/types";

const weekdayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getVisibilityLabel(event: EventRecord) {
  const today = new Date().toISOString().slice(0, 10);

  if (!event.is_published) return "Draft";
  if (today < event.display_start_date) return "Scheduled";
  if (today > event.display_end_date) return "Expired";
  return "Live";
}

function formatWeekdayList(days: number[] | null) {
  const labels = (days ?? [])
    .map((day) => weekdayNames[day])
    .filter(Boolean);

  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return labels.join(" and ");
  return `${labels.slice(0, -1).join(", ")}, and ${
    labels[labels.length - 1]
  }`;
}

function formatEventSchedule(event: EventRecord) {
  const dateRange = `${formatDate(event.start_date)} - ${formatDate(
    event.end_date
  )}`;

  if (event.recurrence_type !== "weekly") return dateRange;

  const weekdays = formatWeekdayList(event.recurrence_days);
  return weekdays ? `Every ${weekdays}, ${dateRange}` : dateRange;
}

export default async function Dashboard() {
  const { supabase, user } = await requireAdmin();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("start_date", { ascending: false });
  const events = (data ?? []) as EventRecord[];

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-orange-700">BMCNY Admin</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Event management
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-zinc-600">{user?.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-6 lg:grid-cols-[24rem_1fr]">
        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Upload event</h2>
          <p className="mt-1 text-sm text-zinc-600">
            New published events appear on the website when their display dates
            are active.
          </p>
          <div className="mt-5">
            <EventForm />
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-5 py-4">
            <h2 className="text-lg font-semibold">Events</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Edit, publish, unpublish, or delete existing event uploads.
            </p>
          </div>

          {error ? (
            <p className="p-5 text-sm text-red-700">{error.message}</p>
          ) : events.length === 0 ? (
            <p className="p-5 text-sm text-zinc-600">No events uploaded yet.</p>
          ) : (
            <div className="divide-y divide-zinc-200">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="grid gap-4 p-5 md:grid-cols-[8rem_1fr]"
                >
                  <div className="relative aspect-video overflow-hidden rounded-md bg-zinc-100 md:aspect-square">
                    <Image
                      src={event.image_url}
                      alt={event.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-zinc-950">
                            {event.name}
                          </h3>
                          <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                            {getVisibilityLabel(event)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-zinc-600">
                          {event.location}
                        </p>
                      </div>
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                      >
                        Edit
                      </Link>
                    </div>

                    <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                      <div>
                        <dt className="font-medium text-zinc-500">Event dates</dt>
                        <dd className="text-zinc-800">
                          {formatEventSchedule(event)}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-zinc-500">
                          Website display
                        </dt>
                        <dd className="text-zinc-800">
                          {formatDate(event.display_start_date)} -{" "}
                          {formatDate(event.display_end_date)}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-4">
                      <EventActions event={event} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
