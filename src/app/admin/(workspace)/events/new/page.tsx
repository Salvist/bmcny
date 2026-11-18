import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { EventForm } from "@/components/event_form";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Create Event | BMCNY Admin" };

export default async function CreateEventPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link href="/events" className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-zinc-600 hover:text-orange-700">
          <ArrowLeftIcon aria-hidden="true" className="size-4" /> Back to events
        </Link>
        <h1 className="admin-page-title">Create Event</h1>
        <p className="admin-page-description">Add an event and choose when its announcement appears on the website.</p>
      </header>
      <section aria-label="Create event details" className="admin-card p-5 sm:p-6">
        <EventForm />
      </section>
    </div>
  );
}
