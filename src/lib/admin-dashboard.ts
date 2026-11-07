import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChurchEvent } from "@/types/event";
import type { PrayerRequest } from "@/types/prayer_request";

export const EVENT_VISIBILITIES = ["Visible", "Scheduled", "Draft", "Expired"] as const;
export type EventVisibility = (typeof EVENT_VISIBILITIES)[number];
type VisibilityDates = Pick<ChurchEvent, "is_published" | "display_start_date" | "display_end_date">;
export type DashboardEvent = Pick<ChurchEvent, "id" | "name" | "image_url"> & VisibilityDates;
export type DashboardPrayerRequest = Pick<PrayerRequest, "id" | "name" | "text" | "created_at">;
export interface EventOverview {
  counts: Record<EventVisibility, number | null>;
  events: DashboardEvent[];
  previewError: boolean;
  today: string;
}
export interface PrayerOverview {
  recentCount: number | null;
  requests: DashboardPrayerRequest[];
  previewError: boolean;
}

export function getNewYorkDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((value) => value.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function getEventVisibility(event: VisibilityDates, today = getNewYorkDate()): EventVisibility {
  if (!event.is_published) return "Draft";
  if (today < event.display_start_date) return "Scheduled";
  if (today > event.display_end_date) return "Expired";
  return "Visible";
}

export function formatAdminDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatPrayerDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York",
  }).format(new Date(date));
}

export function formatEventSchedule(event: ChurchEvent) {
  const range = `${formatAdminDate(event.start_date)} – ${formatAdminDate(event.end_date)}`;
  if (event.recurrence_type !== "weekly") return range;
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const days = (event.recurrence_days ?? []).map((day) => weekdays[day]).filter(Boolean);
  const list = new Intl.ListFormat("en-US", { style: "long", type: "conjunction" }).format(days);
  return list ? `Every ${list}, ${range}` : range;
}

export function prayerRequestHref(id: string) {
  // Focused links resolve the request's current page, even if new submissions arrive.
  return `/prayer-requests?request=${encodeURIComponent(id)}#request-${encodeURIComponent(id)}`;
}

export function getRecentPrayerCutoff(now = new Date()) {
  return new Date(now.getTime() - 168 * 60 * 60 * 1000).toISOString();
}

export async function loadEventOverview(supabase: SupabaseClient, now = new Date()): Promise<EventOverview> {
  const today = getNewYorkDate(now);
  const count = () => supabase.from("events").select("id", { count: "exact", head: true });
  const fields = "id, name, image_url, is_published, display_start_date, display_end_date";
  const results = await Promise.allSettled([
    count().eq("is_published", true).lte("display_start_date", today).gte("display_end_date", today),
    count().eq("is_published", true).gt("display_start_date", today),
    count().eq("is_published", false),
    count().eq("is_published", true).lt("display_end_date", today),
    supabase.from("events").select(fields).eq("is_published", true)
      .lte("display_start_date", today).gte("display_end_date", today)
      .order("display_end_date", { ascending: true }).order("id", { ascending: true }).limit(3),
    supabase.from("events").select(fields).eq("is_published", true)
      .gt("display_start_date", today)
      .order("display_start_date", { ascending: true }).order("id", { ascending: true }).limit(3),
  ]);
  const counts = Object.fromEntries(EVENT_VISIBILITIES.map((status, index) => {
    const result = results[index];
    return [status, result.status === "fulfilled" && !result.value.error ? result.value.count : null];
  })) as EventOverview["counts"];
  const visible = results[4];
  const scheduled = results[5];
  const previewError = [visible, scheduled].some((result) => result.status === "rejected" || result.value.error);
  const events = previewError ? [] : [
    ...(visible.status === "fulfilled" ? visible.value.data ?? [] : []),
    ...(scheduled.status === "fulfilled" ? scheduled.value.data ?? [] : []),
  ].slice(0, 3) as DashboardEvent[];
  return { counts, events, previewError, today };
}

export async function loadPrayerOverview(supabase: SupabaseClient, now = new Date()): Promise<PrayerOverview> {
  const [count, preview] = await Promise.allSettled([
    supabase.from("prayer_requests").select("id", { count: "exact", head: true })
      .gte("created_at", getRecentPrayerCutoff(now)).lte("created_at", now.toISOString()),
    supabase.from("prayer_requests").select("id, name, text, created_at")
      .order("created_at", { ascending: false }).order("id", { ascending: false }).limit(3),
  ]);
  return {
    recentCount: count.status === "fulfilled" && !count.value.error ? count.value.count : null,
    requests: preview.status === "fulfilled" && !preview.value.error ? preview.value.data as DashboardPrayerRequest[] ?? [] : [],
    previewError: preview.status === "rejected" || Boolean(preview.value.error),
  };
}
