export type PrayerRequestStatus = "pending" | "ongoing" | "prayed" | "rejected";

export interface PrayerRequest {
  id: string;
  name: string | null;
  phone_number: string | null;
  email: string | null;
  text: string;
  created_at: string;
  updated_at: string;
  status: PrayerRequestStatus;
  notes: string | null;
}

export interface PrayerRequestUpdateState {
  status: "idle" | "error" | "success";
  error?: string;
}

export interface PrayerRequestValues {
  name: string;
  phone_number: string;
  email: string;
  text: string;
}

export type PrayerRequestValidationError =
  | "nameTooLong"
  | "contactRequired"
  | "emailTooLong"
  | "emailInvalid"
  | "phoneTooLong"
  | "phoneInvalid"
  | "prayerRequired"
  | "prayerTooLong";

export interface PrayerRequestFormState {
  status: "idle" | "error" | "success";
  fieldErrors?: Partial<
    Record<keyof PrayerRequestValues, PrayerRequestValidationError>
  >;
  error?: "storageError";
}
