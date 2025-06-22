const links = [
  {
    title: "Terus Memiliki Kepekaan",
    speaker: "Ev. Herry Yen Lukman",
    link: "https://www.youtube.com/embed/kmoF-7rnY88?si=IRRtLoSueOz0b5-Y",
  },
  {
    title: "Mengenal Tuhan Secara Pribadi",
    speaker: "Ev. Julin Irinda Sitanggang",
    link: "https://www.youtube.com/embed/c4KDQDkEoUM?si=uoZJhN9L6W3oXSou",
  },
];

export default function LatestServicesSection() {
  return (
    <section id="latest-services" className="bg-orange-700 px-4 scroll-mt-16">
      <div className="max-w-4xl mx-auto py-8 text-white">
        <h2 className="text-4xl font-bold font-montserrat">
          WATCH OUR LATEST SERVICES
        </h2>
        <p className="font-merriweather italic">
          Catch up on the most recent services, whether you're at home or on the
          go!
        </p>
        <div className="mt-8 space-y-8">
          {links.map((service, index) => (
            <div key={index} className="space-y-2">
              <div>
                <h3 className="text-xl font-bold font-montserrat">
                  {service.title}
                </h3>
                <p className="text font-merriweather italic opacity-90">
                  Speaker: {service.speaker}
                </p>
              </div>
              <iframe
                className="aspect-video w-full"
                src={service.link}
                title={`${service.title} - ${service.speaker}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
