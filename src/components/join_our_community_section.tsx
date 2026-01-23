import Image from "next/image";
import { useTranslations } from "next-intl";

export default function JoinOurCommunitySection() {
  const t = useTranslations("community");

  return (
    <section
      id="community"
      className="bg-white text-black px-4 py-8 scroll-mt-16"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-orange-700 font-montserrat">
          {t("title")}
        </h2>
        <p className="font-merriweather italic">{t("subtitle")}</p>
        <div className="mt-4 relative aspect-video rounded-2xl overflow-hidden">
          <Image
            src="/bethany_members.webp"
            alt={t("imageAlt")}
            fill
            objectFit="cover"
          />
        </div>
      </div>
    </section>
  );
}
