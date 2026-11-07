import type { PrayerRequestFormState, PrayerRequestValues } from "@/lib/types";

export const PRAYER_REQUEST_LIMITS = {
  name: 120,
  contact: 254,
  prayer_request: 5000,
} as const;

export const EMPTY_PRAYER_REQUEST: PrayerRequestValues = {
  name: "",
  contact: "",
  prayer_request: "",
};

export function validatePrayerRequest(formData: FormData) {
  function getText(key: keyof PrayerRequestValues) {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
  }

  const values: PrayerRequestValues = {
    name: getText("name"),
    contact: getText("contact"),
    prayer_request: getText("prayer_request"),
  };
  const fieldErrors: NonNullable<PrayerRequestFormState["fieldErrors"]> = {};

  if (values.name.length > PRAYER_REQUEST_LIMITS.name) {
    fieldErrors.name = "nameTooLong";
  }

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contact);
  const digitCount = values.contact.replace(/\D/g, "").length;
  const isPhone =
    /^\+?[0-9 ().-]+$/.test(values.contact) &&
    digitCount >= 7 &&
    digitCount <= 15;

  if (!values.contact) {
    fieldErrors.contact = "contactRequired";
  } else if (values.contact.length > PRAYER_REQUEST_LIMITS.contact) {
    fieldErrors.contact = "contactTooLong";
  } else if (!isEmail && !isPhone) {
    fieldErrors.contact = "contactInvalid";
  }

  if (!values.prayer_request) {
    fieldErrors.prayer_request = "prayerRequired";
  } else if (
    values.prayer_request.length > PRAYER_REQUEST_LIMITS.prayer_request
  ) {
    fieldErrors.prayer_request = "prayerTooLong";
  }

  return { values, fieldErrors };
}
