import Image from "next/image";
import { EventData } from "@/constants/events";
import { getEvents } from "@/lib/events";
import { getTranslations } from "next-intl/server";

export default async function EventsSection() {
  const currentDate = new Date();
  const t = await getTranslations("upcomingEvents");
  const events = await getEvents();

  // Filter events that should be displayed based on display dates
  const upcomingEvents = events.filter((event: EventData) => {
    return (
      currentDate >= event.displayStartDate &&
      currentDate <= event.displayEndDate
    );
  });

  // Hide the section completely if there are no upcoming events
  if (upcomingEvents.length === 0) {
    return null;
  }

  return (
    <section className="bg-white text-black px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h2 className="mb-8 text-4xl font-bold text-orange-700 font-montserrat">
          {t("title")}
        </h2>

        <div className="space-y-8">
          {upcomingEvents.map((event, index) => (
            <div key={index}>
              <Image
                src={`${event.imagePath}`}
                alt={event.name}
                width={1000}
                height={1000}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
