import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { EventForm } from "@/components/event_form";
import { EventVisibilityBadge } from "@/components/admin_event_badge";
import { getEventVisibility } from "@/lib/admin-dashboard";
import { requireAdmin } from "@/lib/auth";
import type { ChurchEvent } from "@/types/event";

export const metadata: Metadata = { title: "Edit Event | BMCNY Admin" };

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !event) notFound();
  const record = event as ChurchEvent;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link href="/events" className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-zinc-600 hover:text-orange-700">
          <ArrowLeftIcon aria-hidden="true" className="size-4" /> Back to events
        </Link>
        <h1 className="admin-page-title">Edit Event</h1>
        <p className="admin-page-description">Update the event details, image, and website display dates.</p>
      </header>
      <section aria-label="Edit event details" className="admin-card p-5 sm:p-6">
        <div className="mb-6 flex min-w-0 items-start gap-4 border-b border-zinc-200 pb-6">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-zinc-100 sm:size-24">
            <Image src={record.image_url} alt="" fill sizes="96px" className="object-cover" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-zinc-950 [overflow-wrap:anywhere]">{record.name}</h2>
            <div className="mt-2"><EventVisibilityBadge status={getEventVisibility(record)} /></div>
          </div>
        </div>
        <EventForm event={record} />
      </section>
    </div>
  );
}
