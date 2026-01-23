import { getTranslations } from "next-intl/server";

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

// https://www.googleapis.com/youtube/v3/channels

async function getYouTubeVideos() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = "@BMCNewYork";

  // Step 1: Get uploads playlist ID
  const channelRes = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?forHandle=${channelId}&part=contentDetails&key=${apiKey}`,
    { next: { revalidate: 3600 } } // revalidate every hour
  ).then((r) => r.json());

  const uploadsPlaylistId =
    channelRes.items[0].contentDetails.relatedPlaylists.uploads;

  // Step 2: Get videos from that playlist
  const videosRes = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=3&key=${apiKey}`
  ).then((r) => r.json());

  return videosRes.items.map((item: any) => ({
    id: item.snippet.resourceId.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.medium.url,
    link: `https://www.youtube.com/embed/${item.snippet.resourceId.videoId}`,
  }));
}

export default async function LatestServicesSection() {
  const videos = await getYouTubeVideos();
  const t = await getTranslations("latestServices");

  return (
    <section id="latest-services" className="bg-orange-700 px-4 scroll-mt-16">
      <div className="max-w-4xl mx-auto py-8 text-white">
        <h2 className="text-4xl font-bold font-montserrat">{t("title")}</h2>
        <p className="font-merriweather italic">{t("subtitle")}</p>
        <div className="mt-8 space-y-8">
          {videos.map((service: any, index: any) => (
            <div key={index} className="space-y-2">
              <div>
                <h3 className="text-xl font-bold font-montserrat">
                  {service.title}
                </h3>
                {/* <p className="text font-merriweather italic opacity-90">
                  Speaker: {service.speaker}
                </p> */}
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
