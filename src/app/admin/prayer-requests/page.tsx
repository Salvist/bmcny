import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import type { PrayerRequestRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Prayer requests | BMCNY Admin",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 50;
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/New_York",
});

interface Props {
  searchParams: Promise<{ page?: string | string[] }>;
}

export default async function PrayerRequestsInbox({ searchParams }: Props) {
  const { supabase } = await requireAdmin();
  const { page: rawPage } = await searchParams;
  const parsedPage =
    typeof rawPage === "string" && /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
  const page =
    Number.isSafeInteger(parsedPage) &&
    parsedPage > 0 &&
    parsedPage <= Math.floor(2147483647 / PAGE_SIZE)
      ? parsedPage
      : 1;
  const offset = (page - 1) * PAGE_SIZE;
  const { data, error, count } = await supabase
    .from("prayer_requests")
    .select("id, name, contact, prayer_request, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);
  const requests = (data ?? []) as PrayerRequestRecord[];
  const hasNextPage = !error && offset + requests.length < (count ?? 0);

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div>
            <p className="text-sm font-medium text-orange-700">BMCNY Admin</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Prayer requests
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Private submissions · Times shown in New York time
            </p>
          </div>
          <Link
            href="/"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium transition hover:bg-zinc-50"
          >
            Back to events
          </Link>
        </div>
      </header>

      <section
        aria-label="Prayer request inbox"
        className="mx-auto max-w-4xl px-5 py-6"
      >
        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-white p-5 text-red-700"
          >
            Prayer requests could not be loaded. Please refresh the page to try
            again.
          </p>
        ) : requests.length === 0 ? (
          <p className="rounded-lg border border-zinc-200 bg-white p-5 text-zinc-600">
            {page === 1
              ? "No prayer requests have been submitted yet."
              : "No prayer requests on this page."}
          </p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <article
                key={request.id}
                className="min-w-0 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="min-w-0 whitespace-pre-wrap font-semibold [overflow-wrap:anywhere]">
                    {request.name || "Not provided"}
                  </h2>
                  <time
                    dateTime={request.created_at}
                    className="text-sm text-zinc-500"
                  >
                    {dateFormatter.format(new Date(request.created_at))}
                  </time>
                </div>
                <p className="mt-2 text-sm text-zinc-600 [overflow-wrap:anywhere]">
                  <span className="font-medium">Contact: </span>
                  {request.contact}
                </p>
                <p className="mt-4 whitespace-pre-wrap leading-relaxed [overflow-wrap:anywhere]">
                  {request.prayer_request}
                </p>
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
                className="rounded-md border border-zinc-300 bg-white px-4 py-2 font-medium hover:bg-zinc-50"
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
                className="rounded-md border border-zinc-300 bg-white px-4 py-2 font-medium hover:bg-zinc-50"
              >
                Next
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </section>
    </main>
  );
}
