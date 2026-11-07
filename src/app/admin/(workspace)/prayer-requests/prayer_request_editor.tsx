"use client";

import { useActionState, useState } from "react";
import { updatePrayerRequest } from "./actions";
import { PRAYER_REQUEST_STATUSES } from "@/lib/prayer-requests";
import type { PrayerRequest, PrayerRequestUpdateState } from "@/types/prayer_request";


const initialState: PrayerRequestUpdateState = { status: "idle" };

export function PrayerRequestEditor({ request }: { request: PrayerRequest }) {
  const [status, setStatus] = useState(request.status);
  const [notes, setNotes] = useState(request.notes ?? "");
  const [state, action, pending] = useActionState(updatePrayerRequest.bind(null, request.id), initialState);
  return (
    <form action={action} aria-busy={pending} className="mt-5 space-y-4 border-t border-zinc-200 pt-4">
      <div>
        <label htmlFor={`status-${request.id}`} className="block text-sm font-medium">Status</label>
        <select id={`status-${request.id}`} name="status" value={status} disabled={pending}
          onChange={(event) => setStatus(event.target.value as PrayerRequest["status"])}
          className="mt-2 w-full rounded-lg border border-zinc-300 bg-white p-3 text-base sm:w-auto">
          {PRAYER_REQUEST_STATUSES.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor={`notes-${request.id}`} className="block text-sm font-medium">Notes</label>
        <textarea id={`notes-${request.id}`} name="notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={5000}
          rows={3} readOnly={pending} aria-describedby={`notes-help-${request.id}`}
          className="mt-2 block w-full resize-y rounded-lg border border-zinc-300 p-3 text-base" />
        <p id={`notes-help-${request.id}`} className="mt-1 text-xs text-zinc-500">Private to church admins · Up to 5,000 characters</p>
      </div>
      <button type="submit" disabled={pending} className="admin-button-primary">{pending ? "Saving…" : "Save"}</button>
      {state.status === "success" && <p role="status" className="text-sm text-green-700">Saved.</p>}
      {state.status === "error" && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
    </form>
  );
}
