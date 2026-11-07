"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { PRAYER_REQUEST_STATUSES } from "@/lib/prayer-requests";
import type { PrayerRequestStatus, PrayerRequestUpdateState } from "@/types/prayer_request";


export async function updatePrayerRequest(
  id: string,
  _state: PrayerRequestUpdateState,
  formData: FormData,
): Promise<PrayerRequestUpdateState> {
  const { supabase } = await requireAdmin();
  const status = formData.get("status");
  const rawNotes = formData.get("notes");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ||
      typeof status !== "string" || !PRAYER_REQUEST_STATUSES.includes(status as PrayerRequestStatus) ||
      typeof rawNotes !== "string" || rawNotes.trim().length > 5000) {
    return { status: "error", error: "Choose a valid status and keep notes to 5,000 characters or fewer." };
  }
  try {
    const { data, error } = await supabase.from("prayer_requests")
      .update({ status, notes: rawNotes.trim() || null }).eq("id", id).select("id").maybeSingle();
    if (error || !data) return { status: "error", error: "Could not save this request. Please try again." };
  } catch {
    return { status: "error", error: "Could not save this request. Please try again." };
  }
  revalidatePath("/admin/prayer-requests");
  return { status: "success" };
}
