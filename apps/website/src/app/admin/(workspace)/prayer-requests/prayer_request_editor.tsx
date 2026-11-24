"use client";

import { useActionState, useState } from "react";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  LockClosedIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { updatePrayerRequest } from "./actions";
import { PRAYER_REQUEST_STATUSES } from "@/lib/prayer-requests";
import { formatPrayerDate } from "@/lib/admin-dashboard";
import type { PrayerRequest, PrayerRequestUpdateState } from "@/types/prayer_request";

const initialState: PrayerRequestUpdateState = { status: "idle" };

const statusDescriptions = {
  pending: "Waiting for the team to pray.",
  ongoing: "Keep this request in regular prayer.",
  prayed: "The team has prayed for this request.",
  rejected: "This submission is not accepted as a prayer request.",
} satisfies Record<PrayerRequest["status"], string>;

export function PrayerRequestEditor({ request }: { request: PrayerRequest }) {
  const [status, setStatus] = useState(request.status);
  const [notes, setNotes] = useState(request.notes ?? "");
  const [state, action, pending] = useActionState(updatePrayerRequest.bind(null, request.id), initialState);
  const hasChanges = status !== request.status || notes.trim() !== (request.notes ?? "");

  return (
    <>
      {request.notes && (
        <details className="group/notes mx-5 mb-5 rounded-xl border border-zinc-200/80 bg-zinc-50 sm:mx-6 sm:mb-6">
          <summary className="list-none rounded-xl p-4 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-3 text-xs font-medium text-zinc-600">
              <span className="inline-flex items-center gap-1.5"><LockClosedIcon aria-hidden="true" className="size-3.5" />Private notes</span>
              <span className="inline-flex shrink-0 items-center gap-1 text-zinc-500">
                <span className="group-open/notes:hidden">Read notes</span>
                <span className="hidden group-open/notes:inline">Hide notes</span>
                <ChevronDownIcon aria-hidden="true" className="size-3.5 transition-transform group-open/notes:rotate-180" />
              </span>
            </span>
            <span className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm leading-6 text-zinc-600 [overflow-wrap:anywhere] group-open/notes:hidden">{request.notes}</span>
          </summary>
          <p className="px-4 pb-4 whitespace-pre-wrap text-sm leading-6 text-zinc-600 [overflow-wrap:anywhere]">{request.notes}</p>
        </details>
      )}

      <details className="group/editor border-t border-zinc-200/80 bg-zinc-50/70">
        <summary className="flex min-h-16 list-none flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3 sm:px-6 [&::-webkit-details-marker]:hidden">
          <span className="text-xs leading-5 text-zinc-500">
            {request.updated_at !== request.created_at
              ? <>Updated <time dateTime={request.updated_at}>{formatPrayerDate(request.updated_at)}</time></>
              : "No updates yet"}
          </span>
          <span className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100">
            <PencilSquareIcon aria-hidden="true" className="size-4 text-zinc-500" />
            <span className="group-open/editor:hidden">Update request</span>
            <span className="hidden group-open/editor:inline">Close editor</span>
            <ChevronDownIcon aria-hidden="true" className="size-3.5 text-zinc-400 transition-transform group-open/editor:rotate-180" />
          </span>
        </summary>

        <form action={action} aria-label="Update prayer request" aria-busy={pending} className="space-y-5 border-t border-zinc-200/80 p-5 sm:p-6">
          <div className="grid gap-2 sm:grid-cols-[11rem_1fr] sm:items-center sm:gap-x-5">
            <label htmlFor={`status-${request.id}`} className="text-sm font-medium text-zinc-800">Prayer status</label>
            <select id={`status-${request.id}`} name="status" value={status} disabled={pending}
              onChange={(event) => setStatus(event.target.value as PrayerRequest["status"])}
              aria-describedby={`status-help-${request.id}`}
              className="min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-800 sm:col-start-1 sm:row-start-2 sm:text-sm">
              {PRAYER_REQUEST_STATUSES.map((value) => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}
            </select>
            <p id={`status-help-${request.id}`} className="text-xs leading-5 text-zinc-500 sm:col-start-2 sm:row-start-2">{statusDescriptions[status]}</p>
          </div>

          <div>
            <label htmlFor={`notes-${request.id}`} className="flex items-center gap-1.5 text-sm font-medium text-zinc-800">
              <LockClosedIcon aria-hidden="true" className="size-3.5 text-zinc-400" />Private notes
            </label>
            <textarea id={`notes-${request.id}`} name="notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={5000}
              rows={3} readOnly={pending} aria-describedby={`notes-help-${request.id}`}
              placeholder="Add a follow-up, an update, or a reminder for the team…"
              className="mt-2 block w-full resize-y rounded-lg border border-zinc-300 bg-white p-3 text-base leading-6 text-zinc-800 placeholder:text-zinc-400 sm:text-sm" />
            <div id={`notes-help-${request.id}`} className="mt-2 flex flex-wrap justify-between gap-2 text-xs leading-5 text-zinc-500">
              <span>Only church admins can see these notes.</span>
              <span className="tabular-nums">{notes.length.toLocaleString("en-US")} / 5,000</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div aria-live="polite" className="text-sm">
              {state.status === "success" && !hasChanges && <p role="status" className="inline-flex items-center gap-1.5 text-emerald-700"><CheckCircleIcon aria-hidden="true" className="size-4" />Changes saved</p>}
              {state.status === "error" && <p role="alert" className="text-red-700">{state.error}</p>}
            </div>
            <button type="submit" disabled={pending || !hasChanges} className="admin-button-primary w-full sm:w-auto">{pending ? "Saving…" : "Save changes"}</button>
          </div>
        </form>
      </details>
    </>
  );
}
