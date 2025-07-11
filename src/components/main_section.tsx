import { MapPinIcon } from "@heroicons/react/24/outline";
import FacebookIcon from "./icons/facebook_icon";
import InstagramIcon from "./icons/instagram_icon";
import YoutubeIcon from "./icons/youtube_icon";
import Link from "next/link";

export default function MainSection() {
  return (
    <section className="relative bg-amber-50 px-4 py-24 text-black text-center flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[url('/cross_on_top.webp')] bg-cover bg-bottom" />
      <div className="absolute inset-0 bg-amber-50/70" />
      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        <p className="text-3xl font-bold">Welcome to</p>
        <h1 className="text-4xl font-bold">Bethany Miracle Center</h1>
        <p className="text-2xl font-bold">New York</p>
        <p className="mt-8 text-lg">
          An Indonesian community church filled with loving members of Christ.
        </p>
        <div className="flex gap-4">
          <Link
            href="#sunday-services"
            className="bg-yellow-400 text-orange-700 px-6 py-2 rounded-lg font-bold mt-8"
          >
            Join Us This Sunday!
          </Link>
          <Link
            href="#latest-services"
            className="outline outline-orange-700 text-orange-700 px-6 py-2 rounded-lg font-bold mt-8"
          >
            Watch Online
          </Link>
        </div>

        {/* Social Media Links */}
        <div className="mt-12 flex gap-6">
          <a
            href="https://www.instagram.com/bmc_ny/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex gap-1">
              <InstagramIcon />
              <span>Instagram</span>
            </div>
          </a>
          <a
            href="https://www.facebook.com/BethanyMiracleCenterNework"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex gap-1">
              <FacebookIcon />
              <span>Facebook</span>
            </div>
          </a>
          <a
            href="https://www.youtube.com/bmcnewyork"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex gap-1">
              <YoutubeIcon />
              <span>Youtube</span>
            </div>
          </a>
        </div>
        <a
          href="https://maps.app.goo.gl/JWKGhHKz9nJELbUK9"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4"
        >
          <div className="flex gap-1 underline">
            <MapPinIcon className="size-6" />
            <span>92-14 63rd Dr, Rego Park, NY 11374</span>
          </div>
        </a>
      </div>
    </section>
  );
}
