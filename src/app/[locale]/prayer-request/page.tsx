"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { submitPrayerRequest } from "./actions";
import { SubmitButton } from "@/components/submit_button";
import { EMPTY_PRAYER_REQUEST, PRAYER_REQUEST_LIMITS } from "@/lib/prayer-requests";
import type { PrayerRequestFormState } from "@/types/prayer_request";

const initialState: PrayerRequestFormState = { status: "idle" };
const fieldClass =
  "mt-2 block w-full scroll-mt-28 rounded-lg border border-zinc-400 bg-white px-3.5 py-2.5 text-base text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal aria-invalid:border-red-700";
const helperClass = "mt-2 text-sm leading-relaxed text-zinc-600";
const errorClass = "mt-2 text-sm text-red-700";
const headingClass = "text-balance font-montserrat text-3xl font-bold tracking-tight sm:text-4xl";

export default function PrayerRequestPage() {
  const [attempt, setAttempt] = useState(0);

  return (
    <main className="min-h-screen bg-off-white px-5 pb-16 pt-24 text-charcoal sm:px-8 sm:pt-28">
      <section className="mx-auto max-w-xl">
        <PrayerRequestForm key={attempt} focusRequest={attempt > 0} onRestart={() => setAttempt(attempt + 1)} />
      </section>
    </main>
  );
}

function PrayerRequestForm({ focusRequest, onRestart }: { focusRequest: boolean; onRestart: () => void }) {
  const t = useTranslations("prayerRequest");
  const [values, setValues] = useState(EMPTY_PRAYER_REQUEST);
  const [state, formAction, pending] = useActionState(submitPrayerRequest, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const confirmationRef = useRef<HTMLHeadingElement>(null);
  const errors = state.fieldErrors;
  const missingContact = errors?.email === "contactRequired";

  useEffect(() => {
    if (state.status === "success") {
      confirmationRef.current?.focus();
    } else if (state.fieldErrors) {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="text-center">
        <h1 ref={confirmationRef} tabIndex={-1} className={`${headingClass} scroll-mt-28`}>{t("successTitle")}</h1>
        <p className="mt-4 leading-relaxed">{t("success")}</p>
        <button type="button" onClick={onRestart} className="mt-6 rounded-lg border border-zinc-400 bg-white px-5 py-3 font-semibold hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2">
          {t("sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <>
      <header className="text-center">
        <h1 className={headingClass}>{t("title")}</h1>
        <p className="mt-3 text-pretty leading-relaxed text-rich-gray">{t("description")}</p>
      </header>
      <form ref={formRef} action={formAction} aria-busy={pending}
        className="mt-8 space-y-7 sm:rounded-xl sm:border sm:border-zinc-200 sm:bg-white sm:p-8">
        {errors && <p role="alert" className={errorClass}>{t("checkFields")}</p>}
        <div>
          <label htmlFor="prayer-text" className="font-semibold">{t("request")}</label>
          <textarea id="prayer-text" name="text" required rows={5} autoFocus={focusRequest}
            maxLength={PRAYER_REQUEST_LIMITS.text} value={values.text}
            onChange={(event) => setValues({ ...values, text: event.target.value })}
            readOnly={pending} aria-invalid={Boolean(errors?.text)}
            aria-describedby={errors?.text ? "request-help text-error" : "request-help"}
            className={`${fieldClass} resize-y`} />
          <p id="request-help" className={helperClass}>{t("requestHelp")}</p>
          {errors?.text && <p id="text-error" className={errorClass}>{t(`errors.${errors.text}`)}</p>}
        </div>

        <fieldset className="min-w-0">
          <legend className="font-montserrat text-xl font-bold">{t("contactTitle")}</legend>
          <p id="contact-help" className={helperClass}>{t("contactHelp")}</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {(["name", "email", "phone_number"] as const).map((field) => {
              const isPhone = field === "phone_number";
              const fieldError = errors?.[field];
              const errorId = fieldError === "contactRequired" ? "contact-error" : `${field}-error`;
              const descriptions = [
                field !== "name" && "contact-help",
                isPhone && "phone-help",
                fieldError && errorId,
              ].filter(Boolean).join(" ");

              return (
                <div key={field} className={field === "name" ? "sm:col-span-2" : "min-w-0"}>
                  <label htmlFor={field} className="font-semibold">
                    {t(field)}{field === "name" && <span className="font-normal text-zinc-600"> ({t("optional")})</span>}
                  </label>
                  <input id={field} name={field} type={isPhone ? "tel" : field === "email" ? "email" : "text"}
                    autoComplete={isPhone ? "tel" : field} maxLength={PRAYER_REQUEST_LIMITS[field]}
                    value={values[field]} onChange={(event) => setValues({ ...values, [field]: event.target.value })}
                    readOnly={pending} aria-invalid={Boolean(fieldError)} aria-describedby={descriptions || undefined}
                    className={fieldClass} />
                  {isPhone && <p id="phone-help" className={helperClass}>{t("phoneHelp")}</p>}
                  {fieldError && fieldError !== "contactRequired" && (
                    <p id={errorId} className={errorClass}>{t(`errors.${fieldError}`)}</p>
                  )}
                </div>
              );
            })}
          </div>
          {missingContact && <p id="contact-error" className={errorClass}>{t("errors.contactRequired")}</p>}
        </fieldset>

        <div>
          <p className="text-sm leading-relaxed text-rich-gray">{t("submissionConsent")}</p>
          {state.error && <p role="alert" className={errorClass}>{t(`errors.${state.error}`)}</p>}
          <SubmitButton pendingLabel={t("submitting")} className="mt-4 w-full rounded-lg bg-gold px-5 py-3 font-semibold text-charcoal hover:bg-gold-hover focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60">
            {t("submit")}
          </SubmitButton>
        </div>
      </form>
    </>
  );
}
