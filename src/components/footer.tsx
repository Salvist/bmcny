import FacebookIcon from "./icons/facebook_icon";
import InstagramIcon from "./icons/instagram_icon";
import YoutubeIcon from "./icons/youtube_icon";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="bg-slate-800 py-4 px-4">
        <div className="max-w-4xl mx-auto flex flex-col">
          {/* TODO: Add Logo Here */}
          <p className="text-2xl font-bold">BMC NY</p>
          <a
            href="https://maps.app.goo.gl/JWKGhHKz9nJELbUK9"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white transition-colors no-underline"
          >
            92-14 63rd Dr, Rego Park, NY 11374
          </a>
          <p className="mt-4 font-bold">Social Media</p>
          <div className="mt-2 flex gap-6">
            <a
              href="https://www.instagram.com/bmc_ny/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300 transition-colors"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://www.facebook.com/BethanyMiracleCenterNework"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300 transition-colors"
            >
              <FacebookIcon />
            </a>
            <a
              href="https://www.youtube.com/bmcnewyork"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300 transition-colors"
            >
              <YoutubeIcon />
            </a>
          </div>
        </div>
      </div>

      <p className="py-4 text-center text-xs">
        &copy; 2025 Bethany Miracle Center. All rights reserved.
      </p>
    </footer>
  );
}
