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

export interface PrayerRequestRecord {
  id: string;
  name: string | null;
  contact: string;
  prayer_request: string;
  created_at: string;
}

export interface PrayerRequestValues {
  name: string;
  contact: string;
  prayer_request: string;
}

export type PrayerRequestValidationError =
  | "nameTooLong"
  | "contactRequired"
  | "contactTooLong"
  | "contactInvalid"
  | "prayerRequired"
  | "prayerTooLong";

export interface PrayerRequestFormState {
  status: "idle" | "error" | "success";
  fieldErrors?: Partial<
    Record<keyof PrayerRequestValues, PrayerRequestValidationError>
  >;
  error?: "storageError";
}
