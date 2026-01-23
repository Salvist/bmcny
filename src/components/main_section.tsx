import { MapPinIcon } from "@heroicons/react/24/outline";
import FacebookIcon from "./icons/facebook_icon";
import InstagramIcon from "./icons/instagram_icon";
import YoutubeIcon from "./icons/youtube_icon";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function MainSection() {
  const t = useTranslations("hero");
  const tCommon = useTranslations("common");

  return (
    <section
      className="relative bg-amber-50 px-4 py-24 text-black text-center flex items-center justify-center overflow-hidden"
      aria-labelledby="main-heading"
    >
      <div
        className="absolute inset-0 bg-[url('/cross_on_top.webp')] bg-cover bg-bottom"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-amber-50/70" aria-hidden="true" />
      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        <p className="text-3xl font-bold" aria-hidden="true">
          {t("welcomeTo")}
        </p>
        <h1 id="main-heading" className="text-4xl font-bold">
          {t("bethanyMiracleCenterNewYork")}
        </h1>
        <p className="text-2xl font-bold">{t("newYork")}</p>
        <p className="mt-8 text-lg">{t("tagline")}</p>
        <nav className="flex gap-4" aria-label="Main navigation">
          <Link
            href="#sunday-services"
            className="bg-yellow-400 text-orange-700 px-6 py-2 rounded-lg font-bold mt-8"
            aria-label="Join us for Sunday service"
          >
            {t("joinUsSunday")}
          </Link>
          <Link
            href="#latest-services"
            className="outline outline-orange-700 text-orange-700 px-6 py-2 rounded-lg font-bold mt-8"
            aria-label="Watch our online services"
          >
            {t("watchOnline")}
          </Link>
        </nav>

        {/* Social Media Links */}
        <nav className="mt-12 flex gap-6" aria-label="Social media links">
          <a
            href="https://www.instagram.com/bmc_ny/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us on Instagram"
          >
            <div className="flex gap-1">
              <InstagramIcon />
              <span>{t("instagram")}</span>
            </div>
          </a>
          <a
            href="https://www.facebook.com/BethanyMiracleCenterNework"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us on Facebook"
          >
            <div className="flex gap-1">
              <FacebookIcon />
              <span>{t("facebook")}</span>
            </div>
          </a>
          <a
            href="https://www.youtube.com/bmcnewyork"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Subscribe to our YouTube channel"
          >
            <div className="flex gap-1">
              <YoutubeIcon />
              <span>{t("youtube")}</span>
            </div>
          </a>
        </nav>
        <a
          href="https://maps.app.goo.gl/JWKGhHKz9nJELbUK9"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4"
          aria-label="View our location on Google Maps"
        >
          <div className="flex gap-1 underline">
            <MapPinIcon className="size-6" aria-hidden="true" />
            <span>{tCommon("address")}</span>
          </div>
        </a>
      </div>
    </section>
  );
}
