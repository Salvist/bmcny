import FacebookIcon from "./icons/facebook_icon";
import InstagramIcon from "./icons/instagram_icon";
import YoutubeIcon from "./icons/youtube_icon";

export default function MainSection() {
  return (
    <section className="relative bg-amber-50 px-4 py-32 mt-16 text-black text-center flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[url('/cross_on_top.webp')] bg-cover bg-bottom" />
      <div className="absolute inset-0 bg-amber-50/70" />
      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        <p className="text-3xl font-bold">Welcome to</p>
        <h1 className="text-4xl font-bold">Bethany Miracle Center</h1>
        <p className="text-2xl font-bold">New York</p>
        <p className="mt-8 text-lg">
          An Indonesian community church filled with loving members of Christ.
        </p>
        <button className="bg-yellow-400 text-white px-6 py-2 rounded-lg font-bold mt-8">
          Join us!
        </button>
        <div className="mt-8 flex gap-6">
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
      </div>
    </section>
  );
}
