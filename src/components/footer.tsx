import FacebookIcon from "./icons/facebook_icon";
import InstagramIcon from "./icons/instagram_icon";
import YoutubeIcon from "./icons/youtube_icon";
import TiktokIcon from "./icons/tiktok_icon";
import {
  INSTAGRAM_LINK,
  FACEBOOK_LINK,
  YOUTUBE_LINK,
  TIKTOK_LINK,
  GOOGLE_MAPS_LINK,
} from "@/constants/constants";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="bg-slate-800 py-4 px-4">
        <div className="max-w-4xl mx-auto flex flex-col">
          {/* TODO: Add Logo Here */}
          <p className="text-2xl font-bold">BMC NY</p>
          <a
            href={GOOGLE_MAPS_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white transition-colors no-underline"
          >
            92-14 63rd Dr, Rego Park, NY 11374
          </a>
          <p className="mt-4 font-bold">Social Media</p>
          <div className="mt-2 flex gap-6">
            <a
              href={INSTAGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300 transition-colors"
            >
              <InstagramIcon />
            </a>
            <a
              href={FACEBOOK_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300 transition-colors"
            >
              <FacebookIcon />
            </a>
            <a
              href={YOUTUBE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300 transition-colors"
            >
              <YoutubeIcon />
            </a>
            <a
              href={TIKTOK_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300 transition-colors"
            >
              <TiktokIcon />
            </a>
          </div>
        </div>
      </div>

      <p
        className="py-4 text-center text-xs"
        style={{
          paddingBottom: `max(1rem, env(safe-area-inset-bottom))`,
        }}
      >
        &copy; 2025 Bethany Miracle Center. All rights reserved.
      </p>
    </footer>
  );
}
