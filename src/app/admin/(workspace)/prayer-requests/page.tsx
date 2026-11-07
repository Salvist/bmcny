import { PrayerRequestEditor } from "@/components/prayer_request_editor";
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import type { PrayerRequest } from "@/types/prayer_request";
import { formatPrayerDate } from "@/lib/admin-dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Prayer requests | BMCNY Admin",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 50;

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
          Private submissions · Times shown in New York time
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
          <div className="space-y-4">
            {requests.map((request) => (
              <article
                key={request.id}
                id={`request-${request.id}`}
                tabIndex={-1}
                className="admin-card min-w-0 scroll-mt-24 p-5 target:border-orange-300 target:ring-2 target:ring-orange-100 sm:p-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="min-w-0 whitespace-pre-wrap font-semibold [overflow-wrap:anywhere]">
                    {request.name || "Name not provided"}
                  </h2>
                  <time
                    dateTime={request.created_at}
                    className="text-sm text-zinc-500"
                  >
                    {formatPrayerDate(request.created_at)}
                  </time>
                </div>
                <p className="mt-2 text-sm text-zinc-600 [overflow-wrap:anywhere]">
                  <span className="font-medium">Contact: </span>
                  {[request.phone_number, request.email].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-4 whitespace-pre-wrap leading-relaxed [overflow-wrap:anywhere]">
                  {request.text}
                </p>
                <p className="mt-3 text-xs text-zinc-500">Updated: <time dateTime={request.updated_at}>{formatPrayerDate(request.updated_at)}</time></p>
                <PrayerRequestEditor request={request} />
              </article>
            ))}
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
