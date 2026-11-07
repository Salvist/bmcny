"use server";

import { validatePrayerRequest } from "@/lib/prayer-requests";
import { createClient } from "@/lib/supabase/server";
import type { PrayerRequestFormState } from "@/lib/types";

export async function submitPrayerRequest(
  _state: PrayerRequestFormState,
  formData: FormData,
): Promise<PrayerRequestFormState> {
  const { values, fieldErrors } = validatePrayerRequest(formData);

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", fieldErrors };
  }

  try {
    const supabase = await createClient();
    // Do not select the inserted row: visitors have insert-only access.
    const { error } = await supabase.from("prayer_requests").insert({
      name: values.name || null,
      contact: values.contact,
      prayer_request: values.prayer_request,
    });

    if (error) {
      return { status: "error", error: "storageError" };
    }

    return { status: "success" };
  } catch {
    return { status: "error", error: "storageError" };
  }
}
