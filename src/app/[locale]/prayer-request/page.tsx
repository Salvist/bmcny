import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PrayerRequestForm } from "@/components/prayer_request_form";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "prayerRequest" });

  return {
    title: `${t("title")} | BMC NY`,
    description: t("description"),
    alternates: {
      canonical:
        locale === "en" ? "/prayer-request" : `/${locale}/prayer-request`,
      languages: { en: "/prayer-request", id: "/id/prayer-request" },
    },
    openGraph: {
      title: `${t("title")} | BMC NY`,
      description: t("description"),
    },
  };
}

export default async function PrayerRequestPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("prayerRequest");

  return (
    <main className="min-h-screen bg-orange-50/50 px-5 pb-16 pt-28 text-zinc-950 sm:pt-32">
      <section className="mx-auto max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-700">
          BMC NY
        </p>
        <h1 className="mt-3 font-montserrat text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-4 leading-relaxed text-zinc-600">{t("description")}</p>
        <div className="mt-8 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
          <PrayerRequestForm />
        </div>
      </section>
    </main>
  );
}
