import type { EventData } from "@/constants/events";

interface SupabaseEventRow {
  id: string;
  name: string;
  location: string;
  meeting_type: "onsite" | "online" | null;
  start_date: string;
  end_date: string;
  display_start_date: string;
  display_end_date: string;
  recurrence_type: "continuous" | "weekly" | null;
  recurrence_days: number[] | null;
  zoom_meeting_id: string | null;
  zoom_password: string | null;
  image_url: string;
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return null;
  }

  return { url, key };
}

function toLocalDate(date: string): Date {
  return new Date(`${date}T00:00:00`);
}

function mapEvent(row: SupabaseEventRow): EventData {
  return {
    name: row.name,
    location: row.location,
    meetingType: row.meeting_type === "online" ? "online" : "onsite",
    startDate: toLocalDate(row.start_date),
    endDate: toLocalDate(row.end_date),
    displayStartDate: toLocalDate(row.display_start_date),
    displayEndDate: toLocalDate(row.display_end_date),
    recurrenceType: row.recurrence_type === "weekly" ? "weekly" : "continuous",
    recurrenceDays: row.recurrence_days ?? [],
    zoomMeetingId: row.zoom_meeting_id ?? undefined,
    zoomPassword: row.zoom_password ?? undefined,
    imagePath: row.image_url,
  };
}

export async function getEvents(): Promise<EventData[]> {
  const config = getSupabaseConfig();

  if (!config) {
    return [];
  }

  const response = await fetch(
    `${config.url}/rest/v1/events?select=id,name,location,meeting_type,start_date,end_date,display_start_date,display_end_date,recurrence_type,recurrence_days,zoom_meeting_id,zoom_password,image_url&order=start_date.asc`,
    {
      cache: "no-store",
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
      },
    }
  );

  if (!response.ok) {
    return [];
  }

  const rows = (await response.json()) as SupabaseEventRow[];
  return rows.map(mapEvent);
}
