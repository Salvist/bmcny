import Image from "next/image";

export default function UpcomingEventsSection() {
  return (
    <section className="bg-white text-black mt-8 mb-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="mb-4 text-4xl font-bold text-orange-700 font-montserrat">
          UPCOMING EVENTS
        </h2>
        <Image
          src="/fathers_day_june_2025.webp"
          alt="Upcoming Events"
          width={1000}
          height={1000}
        />
      </div>
    </section>
  );
}
