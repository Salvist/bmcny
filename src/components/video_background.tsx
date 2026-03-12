import { list } from "@vercel/blob";

const VIDEO_FILE_NAME = "bmcny_bg_video.mp4";

export default async function VideoBackground() {
  const { blobs } = await list({
    prefix: VIDEO_FILE_NAME,
    limit: 1,
  });

  if (!blobs.length) {
    return (
      <div
        className="absolute inset-0 bg-[url('/cross_on_top.webp')] bg-cover bg-bottom"
        aria-hidden="true"
      />
    );
  }

  const { url } = blobs[0];

  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 h-full w-full object-cover"
      aria-hidden="true"
    >
      <source src={url} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
