"use client";

import { useActionState, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { submitPrayerRequest } from "@/app/[locale]/prayer-request/actions";
import { SubmitButton } from "@/components/submit_button";
import {
  EMPTY_PRAYER_REQUEST,
  PRAYER_REQUEST_LIMITS,
} from "@/lib/prayer-requests";
import type { PrayerRequestFormState } from "@/types/prayer_request";

const fieldClass =
  "mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-950 outline-none transition focus:border-orange-600 focus:ring-2 focus:ring-orange-200 aria-invalid:border-red-600";
const initialState: PrayerRequestFormState = { status: "idle" };

export function PrayerRequestForm() {
  const t = useTranslations("prayerRequest");
  const [values, setValues] = useState(EMPTY_PRAYER_REQUEST);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (previousState: PrayerRequestFormState, formData: FormData) => {
      const nextState = await submitPrayerRequest(previousState, formData);

      if (nextState.status === "success") {
        setValues({ ...EMPTY_PRAYER_REQUEST });
      } else if (nextState.fieldErrors) {
        const firstField = (["text", "name", "phone_number", "email"] as const).find(
          (name) => nextState.fieldErrors?.[name],
        );
        const field = firstField
          ? formRef.current?.elements.namedItem(firstField)
          : null;
        if (field instanceof HTMLElement) field.focus();
      }

      return nextState;
    },
    initialState,
  );

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-6"
      aria-busy={pending}
    >
      {state.status === "success" && (
        <p
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800"
        >
          {t("success")}
        </p>
      )}
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
        >
          {t(`errors.${state.error}`)}
        </p>
      )}
      {state.fieldErrors && (
        <p role="alert" className="text-sm text-red-700">
          {t("checkFields")}
        </p>
      )}

      <div>
        <label htmlFor="prayer-text" className="font-medium text-zinc-800">
          {t("request")}
        </label>
        <textarea
          id="prayer-text"
          name="text"
          required
          rows={7}
          maxLength={PRAYER_REQUEST_LIMITS.text}
          value={values.text}
          onChange={(event) =>
            setValues({ ...values, text: event.target.value })
          }
          readOnly={pending}
          aria-invalid={Boolean(state.fieldErrors?.text)}
          aria-describedby={`prayer-text-help${state.fieldErrors?.text ? " prayer-text-error" : ""}`}
          className={`${fieldClass} resize-y`}
        />
        <p id="prayer-text-help" className="mt-2 text-sm text-zinc-500">
          {t("requestHelp")}
        </p>
        {state.fieldErrors?.text && (
          <p id="prayer-text-error" className="mt-2 text-sm text-red-700">
            {t(`errors.${state.fieldErrors.text}`)}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="prayer-name" className="font-medium text-zinc-800">
          {t("name")}{" "}
          <span className="font-normal text-zinc-500">({t("optional")})</span>
        </label>
        <input
          id="prayer-name"
          name="name"
          autoComplete="name"
          maxLength={PRAYER_REQUEST_LIMITS.name}
          value={values.name}
          onChange={(event) =>
            setValues({ ...values, name: event.target.value })
          }
          readOnly={pending}
          aria-invalid={Boolean(state.fieldErrors?.name)}
          aria-describedby={
            state.fieldErrors?.name ? "prayer-name-error" : undefined
          }
          className={fieldClass}
        />
        {state.fieldErrors?.name && (
          <p id="prayer-name-error" className="mt-2 text-sm text-red-700">
            {t(`errors.${state.fieldErrors.name}`)}
          </p>
        )}
      </div>

      <p id="contact-help" className="text-sm text-zinc-500">{t("contactHelp")}</p>
      {(["phone_number", "email"] as const).map((field) => (
        <div key={field}>
          <label htmlFor={field} className="font-medium text-zinc-800">{t(field)}</label>
          <input id={field} name={field} type={field === "email" ? "email" : "tel"}
            autoComplete={field === "email" ? "email" : "tel"}
            maxLength={PRAYER_REQUEST_LIMITS[field]} value={values[field]}
            onChange={(event) => setValues({ ...values, [field]: event.target.value })}
            readOnly={pending} aria-invalid={Boolean(state.fieldErrors?.[field])}
            aria-describedby={state.fieldErrors?.[field] ? field + "-error contact-help" : "contact-help"}
            className={fieldClass} />
          {state.fieldErrors?.[field] && <p id={field + "-error"} className="mt-2 text-sm text-red-700">{t(`errors.${state.fieldErrors[field]}`)}</p>}
        </div>
      ))}

      <p className="text-sm leading-relaxed text-zinc-600">{t("privacy")}</p>
      <SubmitButton
        pendingLabel={t("submitting")}
        className="w-full rounded-lg bg-orange-700 px-5 py-3 font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700 disabled:cursor-wait disabled:opacity-60"
      >
        {t("submit")}
      </SubmitButton>
      <p className="text-center text-xs leading-relaxed text-zinc-500">
        {t("submissionConsent")}
      </p>
    </form>
  );
}
