import { PrayerRequestEditor } from "./prayer_request_editor";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { requireAdmin } from "@/lib/auth";
import type { PrayerRequest } from "@/types/prayer_request";
import { formatPrayerDate } from "@/lib/admin-dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Prayer requests | BMCNY Admin",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 50;

const statusStyles = {
  pending: "bg-amber-50 text-amber-800 ring-amber-600/15",
  ongoing: "bg-blue-50 text-blue-800 ring-blue-600/15",
  prayed: "bg-emerald-50 text-emerald-800 ring-emerald-600/15",
  rejected: "bg-zinc-100 text-zinc-600 ring-zinc-500/15",
} satisfies Record<PrayerRequest["status"], string>;

interface Props {
  searchParams: Promise<{ page?: string | string[]; request?: string | string[] }>;
}

export default async function PrayerRequestsInbox({ searchParams }: Props) {
  const { supabase } = await requireAdmin();
  const { page: rawPage, request: focusedRequest } = await searchParams;
  const parsedPage =
    typeof rawPage === "string" && /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
  let page =
    Number.isSafeInteger(parsedPage) &&
    parsedPage > 0 &&
    parsedPage <= Math.floor(2147483647 / PAGE_SIZE)
      ? parsedPage
      : 1;
  let focusNotice: string | null = null;
  if (typeof focusedRequest === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(focusedRequest)) {
    // Resolve the request's current page rather than assuming it is still on page one.
    const { data: target, error: targetError } = await supabase.from("prayer_requests")
      .select("id, created_at").eq("id", focusedRequest).maybeSingle();
    if (target && !targetError) {
      const { count: preceding, error: countError } = await supabase.from("prayer_requests")
        .select("id", { count: "exact", head: true })
        .or(`created_at.gt.${target.created_at},and(created_at.eq.${target.created_at},id.gt.${target.id})`);
      if (!countError && preceding !== null) page = Math.floor(preceding / PAGE_SIZE) + 1;
      else focusNotice = "This request could not be located. Showing the latest submissions.";
    } else {
      focusNotice = targetError ? "This request could not be located. Showing the latest submissions." : "This request is no longer available. Showing the latest submissions.";
    }
    if (focusNotice) page = 1;
  }
  const offset = (page - 1) * PAGE_SIZE;
  const { data, error, count } = await supabase
    .from("prayer_requests")
    .select("id, name, phone_number, email, text, created_at, updated_at, status, notes", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);
  const requests = (data ?? []) as PrayerRequest[];
  const hasNextPage = !error && offset + requests.length < (count ?? 0);

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-7 sm:mb-8">
        <h1 className="admin-page-title">Prayer requests</h1>
        <p className="admin-page-description">
          Care for each request, keep track of prayers, and follow up.
        </p>
      </header>

      {focusNotice && <p role="status" className="mb-5 rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600">{focusNotice}</p>}

      <section
        aria-label="Prayer request inbox"
        className="min-w-0"
      >
        {error ? (
          <p
            role="alert"
            className="admin-card border-red-200 p-5 text-sm text-red-700"
          >
            Prayer requests could not be loaded. Please refresh the page to try
            again.
          </p>
        ) : requests.length === 0 ? (
          <p className="admin-card p-5 text-sm text-zinc-600">
            {page === 1
              ? "No prayer requests have been submitted yet."
              : "No prayer requests on this page."}
          </p>
        ) : (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-zinc-500">
              <p className="inline-flex items-center gap-1.5">
                <LockClosedIcon aria-hidden="true" className="size-3.5" />
                Private to church admins
              </p>
              <p>Newest first <span aria-hidden="true">&middot;</span> New York time</p>
            </div>
            <div className="space-y-5">
              {requests.map((request) => (
                <article
                  key={request.id}
                  id={`request-${request.id}`}
                  tabIndex={-1}
                  aria-labelledby={`request-name-${request.id}`}
                  className="min-w-0 scroll-mt-24 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm target:border-orange-400 target:ring-2 target:ring-orange-100"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-sm font-semibold text-orange-800 ring-1 ring-inset ring-orange-700/10">
                          {request.name?.trim()
                            ? request.name.trim().split(/\s+/).slice(0, 2).map((part) => Array.from(part)[0]).join("").toUpperCase()
                            : <UserIcon className="size-5" />}
                        </span>
                        <div className="min-w-0">
                          <h2 id={`request-name-${request.id}`} className="whitespace-pre-wrap font-semibold leading-6 text-zinc-950 [overflow-wrap:anywhere]">
                            {request.name || "Name not provided"}
                          </h2>
                          <p className="mt-1 text-xs leading-5 text-zinc-500">
                            Received <time dateTime={request.created_at}>{formatPrayerDate(request.created_at)}</time>
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[request.status]}`}>
                        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
                        {request.status[0].toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>

                    <div className="mt-6">
                      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        <ChatBubbleLeftRightIcon aria-hidden="true" className="size-4" />
                        Prayer request
                      </p>
                      <p className="whitespace-pre-wrap text-base leading-7 text-zinc-800 [overflow-wrap:anywhere]">
                        {request.text}
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1 border-t border-zinc-100 pt-3 text-sm">
                      {request.email && (
                        <a href={`mailto:${request.email}`} className="inline-flex min-h-11 min-w-0 items-center gap-2 text-zinc-600 underline-offset-4 hover:text-orange-800 hover:underline">
                          <EnvelopeIcon aria-hidden="true" className="size-4 shrink-0 text-zinc-400" />
                          <span className="[overflow-wrap:anywhere]">{request.email}</span>
                        </a>
                      )}
                      {request.phone_number && (
                        <a href={`tel:${request.phone_number.replace(/[^+\d]/g, "")}`} className="inline-flex min-h-11 min-w-0 items-center gap-2 text-zinc-600 underline-offset-4 hover:text-orange-800 hover:underline">
                          <PhoneIcon aria-hidden="true" className="size-4 shrink-0 text-zinc-400" />
                          <span className="[overflow-wrap:anywhere]">{request.phone_number}</span>
                        </a>
                      )}
                      {!request.email && !request.phone_number && (
                        <p className="py-3 text-xs text-zinc-500">No contact details provided</p>
                      )}
                    </div>
                  </div>
                  <PrayerRequestEditor request={request} />
                </article>
              ))}
            </div>
          </div>
        )}

        {(page > 1 || hasNextPage) && (
          <nav
            aria-label="Inbox pagination"
            className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm"
          >
            {page > 1 ? (
              <Link
                href={`/prayer-requests?page=${page - 1}`}
                className="admin-button-secondary"
              >
                Previous
              </Link>
            ) : (
              <span />
            )}
            <span className="text-zinc-600">Page {page}</span>
            {hasNextPage ? (
              <Link
                href={`/prayer-requests?page=${page + 1}`}
                className="admin-button-secondary"
              >
                Next
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </section>
    </div>
  );
}
