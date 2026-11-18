import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

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

export default function PrayerRequestLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
