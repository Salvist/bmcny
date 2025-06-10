export default function LatestServicesSection() {
  return (
    <section className="bg-orange-700 px-4">
      <div className="max-w-4xl mx-auto py-8 text-white">
        <h2 className="text-4xl font-bold font-montserrat">
          WATCH OUR LATEST SERVICE
        </h2>
        <p className="font-merriweather italic">
          Catch up on the most recent service, whether you’re at home or on the
          go!
        </p>
        <div className="mt-8">
          <iframe
            className="aspect-video w-full"
            src="https://www.youtube.com/embed/kmoF-7rnY88?si=IRRtLoSueOz0b5-Y"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
