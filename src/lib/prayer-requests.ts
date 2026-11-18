import type { PrayerRequestFormState, PrayerRequestValues } from "@/types/prayer_request";


export const PRAYER_REQUEST_LIMITS = {
  name: 120,
  email: 254,
  phone_number: 254,
  text: 5000,
} as const;

export const EMPTY_PRAYER_REQUEST: PrayerRequestValues = {
  name: "",
  email: "",
  phone_number: "",
  text: "",
};

export function validatePrayerRequest(formData: FormData) {
  function getText(key: keyof PrayerRequestValues) {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
  }

  const values: PrayerRequestValues = {
    name: getText("name"),
    email: getText("email"),
    phone_number: getText("phone_number"),
    text: getText("text"),
  };
  const fieldErrors: NonNullable<PrayerRequestFormState["fieldErrors"]> = {};

  if (values.name.length > PRAYER_REQUEST_LIMITS.name) {
    fieldErrors.name = "nameTooLong";
  }

  if (!values.email && !values.phone_number) {
    fieldErrors.email = "contactRequired";
    fieldErrors.phone_number = "contactRequired";
  }
  if (values.email.length > PRAYER_REQUEST_LIMITS.email) {
    fieldErrors.email = "emailTooLong";
  } else if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    fieldErrors.email = "emailInvalid";
  }
  const digitCount = values.phone_number.replace(/\D/g, "").length;
  if (values.phone_number.length > PRAYER_REQUEST_LIMITS.phone_number) {
    fieldErrors.phone_number = "phoneTooLong";
  } else if (values.phone_number && (!/^\+?[0-9 ().-]+$/.test(values.phone_number) || digitCount < 7 || digitCount > 15)) {
    fieldErrors.phone_number = "phoneInvalid";
  }

  if (!values.text) {
    fieldErrors.text = "prayerRequired";
  } else if (
    values.text.length > PRAYER_REQUEST_LIMITS.text
  ) {
    fieldErrors.text = "prayerTooLong";
  }

  return { values, fieldErrors };
}

export const PRAYER_REQUEST_STATUSES = ["pending", "ongoing", "prayed", "rejected"] as const;
