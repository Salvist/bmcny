"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { EventFormState } from "@/lib/types";

const IMAGE_BUCKET = "event-images";
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MEETING_TYPES = new Set(["onsite", "online"]);
const RECURRENCE_TYPES = new Set(["continuous", "weekly"]);

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  return value;
}

function normalizeOptionalText(value: string): string | null {
  return value || null;
}

function normalizeMeetingType(value: string): "onsite" | "online" {
  return MEETING_TYPES.has(value) && value === "online" ? "online" : "onsite";
}

function normalizeRecurrenceType(value: string): "continuous" | "weekly" {
  return RECURRENCE_TYPES.has(value) && value === "weekly"
    ? "weekly"
    : "continuous";
}

function getRecurrenceDays(formData: FormData): number[] {
  const days = formData
    .getAll("recurrence_days")
    .map((value) => (typeof value === "string" ? Number(value) : NaN))
    .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6);

  return Array.from(new Set(days)).sort((a, b) => a - b);
}

function validateDates(
  startDate: string,
  endDate: string,
  displayStartDate: string,
  displayEndDate: string
): string | null {
  if (!startDate || !endDate || !displayStartDate || !displayEndDate) {
    return "All date fields are required.";
  }

  if (endDate < startDate) {
    return "Event end date cannot be before the start date.";
  }

  if (displayEndDate < displayStartDate) {
    return "Display end date cannot be before display start date.";
  }

  return null;
}

function getImageFile(formData: FormData): File | null {
  const file = formData.get("image");

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  return file;
}

function validateImage(file: File | null, required: boolean): string | null {
  if (!file) {
    return required ? "Event image is required." : null;
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Image must be a JPEG, PNG, WebP, or GIF file.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Image must be smaller than 8 MB.";
  }

  return null;
}

function getImageExtension(file: File): string {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension && /^[a-z0-9]+$/.test(extension)) {
    return extension;
  }

  return file.type.split("/")[1] ?? "webp";
}

async function uploadImage(file: File) {
  const { supabase, user } = await requireAdmin();
  const path = `${user!.id}/${crypto.randomUUID()}.${getImageExtension(file)}`;

  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);

  return {
    image_path: path,
    image_url: data.publicUrl,
  };
}

function getEventPayload(formData: FormData) {
  const name = getString(formData, "name");
  const meeting_type = normalizeMeetingType(getString(formData, "meeting_type"));
  const location =
    meeting_type === "online" ? "Online" : getString(formData, "location");
  const zoom_meeting_id =
    meeting_type === "online"
      ? normalizeOptionalText(getString(formData, "zoom_meeting_id"))
      : null;
  const zoom_password =
    meeting_type === "online"
      ? normalizeOptionalText(getString(formData, "zoom_password"))
      : null;
  const start_date = normalizeDate(getString(formData, "start_date"));
  const end_date = normalizeDate(getString(formData, "end_date"));
  const display_start_date = normalizeDate(
    getString(formData, "display_start_date")
  );
  const display_end_date = normalizeDate(getString(formData, "display_end_date"));
  const recurrence_type = normalizeRecurrenceType(
    getString(formData, "recurrence_type")
  );
  const recurrence_days =
    recurrence_type === "weekly" ? getRecurrenceDays(formData) : null;
  const is_published = formData.get("is_published") === "on";

  return {
    name,
    location,
    meeting_type,
    zoom_meeting_id,
    zoom_password,
    start_date,
    end_date,
    display_start_date,
    display_end_date,
    recurrence_type,
    recurrence_days,
    is_published,
  };
}

function validateEventPayload(payload: ReturnType<typeof getEventPayload>) {
  if (!payload.name) return "Event name is required.";
  if (payload.meeting_type === "onsite" && !payload.location) {
    return "Address is required for onsite events.";
  }
  if (payload.meeting_type === "online" && !payload.zoom_meeting_id) {
    return "Meeting ID is required for online events.";
  }

  const dateError = validateDates(
    payload.start_date,
    payload.end_date,
    payload.display_start_date,
    payload.display_end_date
  );

  if (dateError) return dateError;

  if (
    payload.recurrence_type === "weekly" &&
    (!payload.recurrence_days || payload.recurrence_days.length === 0)
  ) {
    return "Choose at least one weekday for weekly recurring events.";
  }

  return null;
}

export async function signIn(formData: FormData) {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const supabase = await createClient();

  if (!email || !password) {
    redirect("/admin/login?error=missing");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/admin/login?error=credentials");
  }

  const { isAdmin } = await requireAdmin();

  if (!isAdmin) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function createEvent(
  _state: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const { supabase } = await requireAdmin();
  const payload = getEventPayload(formData);
  const validationError = validateEventPayload(payload);

  if (validationError) return { error: validationError };

  const image = getImageFile(formData);
  const imageError = validateImage(image, true);

  if (imageError) return { error: imageError };

  try {
    const imagePayload = await uploadImage(image!);
    const { error } = await supabase.from("events").insert({
      ...payload,
      ...imagePayload,
    });

    if (error) return { error: error.message };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to upload image.",
    };
  }

  revalidatePath("/");
  redirect("/admin");
}

export async function updateEvent(
  _state: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const { supabase } = await requireAdmin();
  const id = getString(formData, "id");
  const currentImagePath = getString(formData, "current_image_path");
  const payload = getEventPayload(formData);
  const validationError = validateEventPayload(payload);

  if (!id) return { error: "Missing event id." };
  if (validationError) return { error: validationError };

  const image = getImageFile(formData);
  const imageError = validateImage(image, false);

  if (imageError) return { error: imageError };

  try {
    const imagePayload = image ? await uploadImage(image) : null;
    const { error } = await supabase
      .from("events")
      .update({
        ...payload,
        ...(imagePayload ?? {}),
      })
      .eq("id", id);

    if (error) return { error: error.message };

    if (imagePayload && currentImagePath) {
      await supabase.storage.from(IMAGE_BUCKET).remove([currentImagePath]);
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update event.",
    };
  }

  revalidatePath("/");
  redirect("/admin");
}

export async function toggleEvent(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = getString(formData, "id");
  const isPublished = formData.get("is_published") === "true";

  if (id) {
    await supabase
      .from("events")
      .update({ is_published: !isPublished })
      .eq("id", id);
  }

  revalidatePath("/");
}

export async function deleteEvent(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = getString(formData, "id");
  const imagePath = getString(formData, "image_path");

  if (id) {
    await supabase.from("events").delete().eq("id", id);
  }

  if (imagePath) {
    await supabase.storage.from(IMAGE_BUCKET).remove([imagePath]);
  }

  revalidatePath("/");
}
