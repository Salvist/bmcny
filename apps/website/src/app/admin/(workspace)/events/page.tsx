import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/20/solid";
import { EventVisibilityBadge } from "@/components/admin_event_badge";
import { EventActions } from "@/components/event_actions";
import { requireAdmin } from "@/lib/auth";
import { formatAdminDate, formatEventSchedule, getEventVisibility, getNewYorkDate } from "@/lib/admin-dashboard";
import type { ChurchEvent } from "@/types/event";

export const metadata: Metadata = { title: "Events | BMCNY Admin" };

export default async function EventsPage() {
  const { supabase } = await requireAdmin();
  let events: ChurchEvent[] = [];
  let failed = false;

  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("start_date", { ascending: false });
    failed = Boolean(error);
    events = (data ?? []) as ChurchEvent[];
  } catch {
    failed = true;
  }

  const today = getNewYorkDate();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="admin-page-title">Events</h1>
          <p className="admin-page-description">Manage your events and when they appear on the website.</p>
        </div>
        <Link href="/events/new" className="admin-button-primary">
          <PlusIcon aria-hidden="true" className="size-4" />
          Create Event
        </Link>
      </header>

      <section aria-label="Event management" className="admin-card overflow-hidden">
        <div className="border-b border-zinc-200 px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-zinc-950">All events</h2>
          <p className="mt-1 text-sm text-zinc-500">Website visibility follows the display dates, using New York time.</p>
        </div>
        {failed ? (
          <div role="alert" className="p-6 text-sm text-red-700">
            <p>Events could not be loaded. Please try again.</p>
            <Link href="/events" className="admin-button-secondary mt-4">Reload events</Link>
          </div>
        ) : events.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <h3 className="font-medium text-zinc-900">No events yet</h3>
            <p className="mt-2 text-sm text-zinc-500">Create your first event to share it with the community.</p>
            <Link href="/events/new" className="admin-button-secondary mt-5">Create Event</Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200">
            {events.map((event) => (
              <article key={event.id} className="grid min-w-0 gap-4 p-5 sm:grid-cols-[7rem_minmax(0,1fr)] sm:p-6">
                <div className="relative aspect-video overflow-hidden rounded-md bg-zinc-100 sm:aspect-square">
                  <Image src={event.image_url} alt="" fill sizes="(min-width: 640px) 112px, 100vw" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-zinc-950 [overflow-wrap:anywhere]">{event.name}</h3>
                      <p className="mt-1 text-sm text-zinc-500 [overflow-wrap:anywhere]">{event.location}</p>
                      <div className="mt-2"><EventVisibilityBadge status={getEventVisibility(event, today)} /></div>
                    </div>
                    <Link href={`/events/${event.id}`} className="admin-button-secondary" aria-label={`Edit ${event.name}`}>Edit</Link>
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm xl:grid-cols-2">
                    <div>
                      <dt className="font-medium text-zinc-500">Event dates</dt>
                      <dd className="mt-1 text-zinc-800">{formatEventSchedule(event)}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-zinc-500">Website display</dt>
                      <dd className="mt-1 text-zinc-800">{formatAdminDate(event.display_start_date)} – {formatAdminDate(event.display_end_date)}</dd>
                    </div>
                  </dl>
                  <div className="mt-5"><EventActions event={event} /></div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
