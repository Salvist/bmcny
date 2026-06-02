import { deleteEvent, toggleEvent } from "@/app/admin/actions";
import type { EventRecord } from "@/lib/types";
import { SubmitButton } from "@/components/submit_button";

interface EventActionsProps {
  event: EventRecord;
}

export function EventActions({ event }: EventActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={toggleEvent}>
        <input type="hidden" name="id" value={event.id} />
        <input
          type="hidden"
          name="is_published"
          value={event.is_published ? "true" : "false"}
        />
        <SubmitButton
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60"
          pendingLabel="Saving..."
        >
          {event.is_published ? "Unpublish" : "Publish"}
        </SubmitButton>
      </form>

      <form action={deleteEvent}>
        <input type="hidden" name="id" value={event.id} />
        <input type="hidden" name="image_path" value={event.image_path} />
        <SubmitButton
          className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
          pendingLabel="Deleting..."
        >
          Delete
        </SubmitButton>
      </form>
    </div>
  );
}
