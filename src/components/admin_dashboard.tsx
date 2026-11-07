import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, CalendarDaysIcon, ChatBubbleLeftRightIcon, PlusIcon } from "@heroicons/react/24/outline";
import {
  EVENT_VISIBILITIES, formatAdminDate, formatPrayerDate, getEventVisibility, prayerRequestHref,
  type EventOverview, type PrayerOverview,
} from "@/lib/admin-dashboard";
import { EventVisibilityBadge } from "@/components/admin_event_badge";

const rowClass = "group block px-5 py-5 transition hover:bg-zinc-50 sm:px-6";

export function EventsOverviewCard({ overview }: { overview: EventOverview }) {
  return (
    <section aria-labelledby="events-heading" className="admin-card flex min-w-0 flex-col overflow-hidden">
      <div className="border-b border-zinc-200 p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="rounded-lg bg-orange-50 p-2 text-orange-700"><CalendarDaysIcon className="size-5" aria-hidden="true" /></span>
            <h2 id="events-heading" className="text-lg font-semibold tracking-tight">Events</h2>
          </div>
          <Link href="/events/new" className="admin-button-primary shrink-0"><PlusIcon className="size-4" aria-hidden="true" />Create event</Link>
        </div>
        <p className="text-sm text-zinc-500">Announcement visibility on your website</p>
        <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {EVENT_VISIBILITIES.map((status) => (
            <div key={status}>
              <dt className="text-xs font-medium text-zinc-500">{status}</dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums tracking-tight">
                {overview.counts[status] === null ? <span className="text-sm font-normal text-zinc-500">Unavailable</span> : overview.counts[status]}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="flex-1">
        <h3 className="px-5 pt-5 text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:px-6">Visible &amp; scheduled</h3>
        {overview.previewError ? (
          <p role="alert" className="p-5 text-sm leading-6 text-red-700 sm:p-6">Event previews could not be loaded. Refresh the page to try again, or open Events.</p>
        ) : overview.events.length === 0 ? (
          <div className="p-5 sm:p-6"><p className="text-sm font-medium">No visible or scheduled announcements</p><p className="mt-1 text-sm leading-6 text-zinc-500">Create an event or open Events to manage your drafts.</p></div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {overview.events.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className={rowClass}>
                <div className="flex items-start gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-md border border-zinc-100 bg-zinc-50">
                    <Image src={event.image_url} alt="" fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-1.5 font-medium leading-6 text-zinc-900 [overflow-wrap:anywhere] group-hover:text-orange-800">{event.name}</p>
                    <EventVisibilityBadge status={getEventVisibility(event, overview.today)} />
                    <p className="mt-2 text-xs leading-5 text-zinc-500">Website display<br /><span className="text-zinc-600">{formatAdminDate(event.display_start_date)} – {formatAdminDate(event.display_end_date)}</span></p>
                  </div>
                  <ArrowRightIcon className="mt-1 size-4 shrink-0 text-zinc-400 group-hover:text-orange-700" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="border-t border-zinc-200 p-4 sm:px-6"><Link href="/events" className="admin-button-secondary w-full">View all events<ArrowRightIcon className="size-4" aria-hidden="true" /></Link></div>
    </section>
  );
}

export function PrayerOverviewCard({ overview }: { overview: PrayerOverview }) {
  return (
    <section aria-labelledby="prayers-heading" className="admin-card flex min-w-0 flex-col overflow-hidden">
      <div className="border-b border-zinc-200 p-5 sm:p-6">
        <div className="mb-5 flex min-h-11 items-center gap-3">
          <span className="rounded-lg bg-orange-50 p-2 text-orange-700"><ChatBubbleLeftRightIcon className="size-5" aria-hidden="true" /></span>
          <h2 id="prayers-heading" className="text-lg font-semibold tracking-tight">Prayer requests</h2>
        </div>
        <p className="text-sm text-zinc-500">Received in the past seven days</p>
        <p className="mt-4 text-xl font-semibold tabular-nums tracking-tight lg:min-h-28 xl:min-h-12">
          {overview.recentCount === null ? <span className="text-sm font-normal text-zinc-500">Count unavailable</span> : <>{overview.recentCount}<span className="ml-2 text-sm font-normal text-zinc-500">{overview.recentCount === 1 ? "request" : "requests"}</span></>}
        </p>
      </div>
      <div className="flex-1">
        <h3 className="px-5 pt-5 text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:px-6">Recent submissions</h3>
        {overview.previewError ? (
          <p role="alert" className="p-5 text-sm leading-6 text-red-700 sm:p-6">Prayer requests could not be loaded. Refresh the page to try again, or open the inbox.</p>
        ) : overview.requests.length === 0 ? (
          <div className="p-5 sm:p-6"><p className="text-sm font-medium">No prayer requests yet</p><p className="mt-1 text-sm leading-6 text-zinc-500">Submissions from the website will appear here.</p></div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {overview.requests.map((request) => (
              <Link key={request.id} href={prayerRequestHref(request.id)} className={rowClass} aria-label={`Read prayer request from ${request.name || "Name not provided"}, received ${formatPrayerDate(request.created_at)}, New York time`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 font-medium leading-6 [overflow-wrap:anywhere] group-hover:text-orange-800">{request.name || "Name not provided"}</p>
                  <ArrowRightIcon className="mt-1 size-4 shrink-0 text-zinc-400 group-hover:text-orange-700" aria-hidden="true" />
                </div>
                <time dateTime={request.created_at} className="mt-1 block text-xs leading-5 text-zinc-500">{formatPrayerDate(request.created_at)} · New York</time>
                <p className="mt-2 line-clamp-2 whitespace-pre-line text-sm leading-6 text-zinc-600 [overflow-wrap:anywhere]">{request.text}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="border-t border-zinc-200 p-4 sm:px-6"><Link href="/prayer-requests" className="admin-button-secondary w-full">View all prayer requests<ArrowRightIcon className="size-4" aria-hidden="true" /></Link></div>
    </section>
  );
}

export function DashboardPanelSkeleton({ label }: { label: string }) {
  return (
    <section aria-label={`Loading ${label}`} aria-busy="true" className="admin-card min-h-96 p-5 sm:p-6">
      <p role="status" className="text-sm text-zinc-500">Loading {label}…</p>
      <div aria-hidden="true" className="motion-safe:animate-pulse">
        <div className="my-6 h-16 rounded-md bg-zinc-100" />
        {[1, 2, 3].map((key) => <div key={key} className="mb-5 h-20 rounded-md bg-zinc-100" />)}
      </div>
    </section>
  );
}
