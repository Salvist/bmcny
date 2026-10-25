import CalendarInteractive from "@/components/calendar/calendar_interactive";
import { getEvents } from "@/lib/events";
import { getTranslations } from "next-intl/server";

export default async function CalendarSection() {
  const t = await getTranslations("calendar");
  const events = await getEvents();

  return (
    <section
      id="church-calendar"
      className="bg-off-white px-4 py-12 text-charcoal scroll-mt-16"
      aria-labelledby="church-calendar-heading"
    >
      <div className="max-w-4xl mx-auto">
        <h2
          id="church-calendar-heading"
          className="text-4xl font-bold text-charcoal font-montserrat"
        >
          {t("title")}
        </h2>

        <CalendarInteractive events={events} />
      </div>
    </section>
  );
}
