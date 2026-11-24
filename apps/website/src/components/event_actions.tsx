import { deleteEvent, toggleEvent } from "@/app/admin/actions";
import type { ChurchEvent } from "@/types/event";
import { SubmitButton } from "@/components/submit_button";

interface EventActionsProps {
  event: ChurchEvent;
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
          className="admin-button-secondary"
          pendingLabel="Saving..."
        >
          {event.is_published ? "Unpublish" : "Publish"}
        </SubmitButton>
      </form>

      <form action={deleteEvent}>
        <input type="hidden" name="id" value={event.id} />
        <input type="hidden" name="image_path" value={event.image_path} />
        <SubmitButton
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
          pendingLabel="Deleting..."
        >
          Delete
        </SubmitButton>
      </form>
    </div>
  );
}
