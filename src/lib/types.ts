export interface EventRecord {
  id: string;
  name: string;
  location: string;
  meeting_type: "onsite" | "online";
  start_date: string;
  end_date: string;
  display_start_date: string;
  display_end_date: string;
  recurrence_type: "continuous" | "weekly";
  recurrence_days: number[] | null;
  zoom_meeting_id: string | null;
  zoom_password: string | null;
  image_url: string;
  image_path: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventFormState {
  error?: string;
}
