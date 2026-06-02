import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventForm } from "@/components/event_form";
import { requireAdmin } from "@/lib/auth";
import type { EventRecord } from "@/lib/types";

interface EditEventPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !event) {
    notFound();
  }

  const record = event as EventRecord;

  return (
    <main className="min-h-screen bg-zinc-100 px-5 py-6 text-zinc-950">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin"
          className="text-sm font-medium text-orange-700 transition hover:text-orange-800"
        >
          Back to events
        </Link>

        <section className="mt-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">Edit event</p>
              <h1 className="text-2xl font-semibold tracking-tight">
                {record.name}
              </h1>
            </div>
            <div className="relative aspect-video w-full overflow-hidden rounded-md bg-zinc-100 md:w-48">
              <Image
                src={record.image_url}
                alt={record.name}
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="mt-6">
            <EventForm event={record} />
          </div>
        </section>
      </div>
    </main>
  );
}
