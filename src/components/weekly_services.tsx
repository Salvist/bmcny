import {
  ClockIcon,
  MapPinIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function WeeklyServices() {
  const t = useTranslations("weeklyServices");
  const tCommon = useTranslations("common");

  return (
    <section
      id="weekly-services"
      className="bg-orange-100 px-4 py-8 text-black scroll-mt-16"
    >
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 md:items-center">
        <div className="order-2 md:order-1">
          <h2 className="text-4xl font-bold text-orange-700 font-montserrat">
            {t("title")}
          </h2>
          <span className="font-merriweather italic">{t("subtitle")}</span>
          <div className="flex flex-col">
            <p className="mt-4 text-2xl text-orange-700 font-bold font-montserrat">
              {t("morningPrayer.title")}
            </p>
            <span>{t("morningPrayer.schedule")}</span>
            <span>{t("morningPrayer.liveOnZoom")}</span>
            <span>{t("morningPrayer.meetingId")}</span>
            <span>{t("morningPrayer.password")}</span>
          </div>
          <div className="flex flex-col">
            <p className="mt-4 text-2xl text-orange-700 font-bold font-montserrat">
              {t("worshipFromHome.title")}
            </p>
            <span>{t("worshipFromHome.schedule")}</span>
            <span>{t("worshipFromHome.liveOnZoom")}</span>
            <span>{t("worshipFromHome.meetingId")}</span>
            <span>{t("worshipFromHome.password")}</span>
          </div>
        </div>
        <div className="order-1 md:order-2 relative w-full md:w-1/2 md:aspect-square aspect-video rounded-2xl overflow-hidden">
          <Image
            src="/bible_study.webp"
            alt="Worship Crowd"
            fill
            objectFit="cover"
          />
        </div>
      </div>
    </section>
  );
}
