"use client";

import { useActionState, useState } from "react";
import { createEvent, updateEvent } from "@/app/admin/actions";
import type { EventRecord } from "@/lib/types";
import { SubmitButton } from "@/components/submit_button";

interface EventFormProps {
  event?: EventRecord;
}

const fieldClass =
  "mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-orange-600 focus:ring-2 focus:ring-orange-200";
const labelClass = "text-sm font-medium text-zinc-700";
const weekdays = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export function EventForm({ event }: EventFormProps) {
  const action = event ? updateEvent : createEvent;
  const [state, formAction] = useActionState(action, {});
  const initialMeetingType =
    event?.meeting_type ?? (event?.zoom_meeting_id ? "online" : "onsite");
  const [meetingType, setMeetingType] = useState<"onsite" | "online">(
    initialMeetingType
  );
  const [recurrenceType, setRecurrenceType] = useState<
    "continuous" | "weekly"
  >(
    event?.recurrence_type ?? "continuous"
  );
  const recurrenceDays = new Set(event?.recurrence_days ?? []);

  return (
    <form action={formAction} className="space-y-5">
      {event && (
        <>
          <input type="hidden" name="id" value={event.id} />
          <input
            type="hidden"
            name="current_image_path"
            value={event.image_path}
          />
        </>
      )}

      {state.error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label className={labelClass}>
          Event name
          <input
            className={fieldClass}
            name="name"
            defaultValue={event?.name ?? ""}
            required
          />
        </label>
      </div>

      <fieldset className="space-y-3">
        <legend className={labelClass}>Meeting type</legend>
        <p className="text-sm text-zinc-600">
          Choose onsite for events at a physical address, or online for events
          people join through Zoom.
        </p>
        <label className={labelClass}>
          Type
          <select
            className={fieldClass}
            name="meeting_type"
            value={meetingType}
            onChange={(e) =>
              setMeetingType(e.target.value === "online" ? "online" : "onsite")
            }
          >
            <option value="onsite">Onsite</option>
            <option value="online">Online</option>
          </select>
        </label>

        {meetingType === "onsite" ? (
          <label className={labelClass}>
            Address
            <input
              className={fieldClass}
              name="location"
              defaultValue={initialMeetingType === "onsite" ? event?.location ?? "" : ""}
              required
            />
          </label>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClass}>
              Meeting ID
              <input
                className={fieldClass}
                name="zoom_meeting_id"
                defaultValue={event?.zoom_meeting_id ?? ""}
                placeholder="845 4558 5721"
                required
              />
            </label>

            <label className={labelClass}>
              Zoom password
              <input
                className={fieldClass}
                name="zoom_password"
                defaultValue={event?.zoom_password ?? ""}
                placeholder="Optional"
              />
            </label>
          </div>
        )}
      </fieldset>

      <div className="space-y-3">
        <div>
          <p className={labelClass}>Event dates</p>
          <p className="mt-1 text-sm text-zinc-600">
            Set the actual date range when this event happens. Weekly events
            will repeat on the selected weekdays within this range.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className={labelClass}>
            Event start date
            <input
              className={fieldClass}
              type="date"
              name="start_date"
              defaultValue={event?.start_date ?? ""}
              required
            />
          </label>

          <label className={labelClass}>
            Event end date
            <input
              className={fieldClass}
              type="date"
              name="end_date"
              defaultValue={event?.end_date ?? ""}
              required
            />
          </label>
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className={labelClass}>Recurrence</legend>
        <p className="text-sm text-zinc-600">
          Choose continuous for events that happen every day between the start
          and end dates. Choose weekly for events that repeat only on selected
          weekdays in that date range.
        </p>
        <label className={labelClass}>
          Pattern
          <select
            className={fieldClass}
            name="recurrence_type"
            value={recurrenceType}
            onChange={(e) =>
              setRecurrenceType(
                e.target.value === "weekly" ? "weekly" : "continuous"
              )
            }
          >
            <option value="continuous">Continuous date range</option>
            <option value="weekly">Weekly on selected days</option>
          </select>
        </label>

        {recurrenceType === "weekly" && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {weekdays.map((day) => (
              <label
                key={day.value}
                className="flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700"
              >
                <input
                  type="checkbox"
                  name="recurrence_days"
                  value={day.value}
                  defaultChecked={recurrenceDays.has(day.value)}
                  className="size-4 rounded border-zinc-300 text-orange-700 focus:ring-orange-600"
                />
                {day.label}
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <div className="space-y-3">
        <div>
          <p className={labelClass}>Display dates</p>
          <p className="mt-1 text-sm text-zinc-600">
            Choose when this event should be visible on the website. These dates
            do not change the event schedule.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className={labelClass}>
            Display start date
            <input
              className={fieldClass}
              type="date"
              name="display_start_date"
              defaultValue={event?.display_start_date ?? ""}
              required
            />
          </label>

          <label className={labelClass}>
            Display end date
            <input
              className={fieldClass}
              type="date"
              name="display_end_date"
              defaultValue={event?.display_end_date ?? ""}
              required
            />
          </label>
        </div>
      </div>

      <label className={labelClass}>
        Event image
        <input
          className={`${fieldClass} file:mr-3 file:rounded-md file:border-0 file:bg-orange-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-orange-800`}
          type="file"
          name="image"
          accept="image/png,image/jpeg,image/webp,image/gif"
          required={!event}
        />
      </label>

      <label className="flex items-center gap-3 text-sm font-medium text-zinc-700">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={event?.is_published ?? true}
          className="size-4 rounded border-zinc-300 text-orange-700 focus:ring-orange-600"
        />
        Published
      </label>

      <SubmitButton
        className="inline-flex min-h-10 items-center justify-center rounded-md bg-orange-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-60"
        pendingLabel={event ? "Updating..." : "Creating..."}
      >
        {event ? "Update event" : "Create event"}
      </SubmitButton>
    </form>
  );
}
