import CalendarInteractive from "@/components/calendar/calendar_interactive";
import { getEvents } from "@/lib/events";
import { getTranslations } from "next-intl/server";

export default async function CalendarSection() {
  const t = await getTranslations("calendar");
  const events = await getEvents();

  return (
    <section
      id="church-calendar"
      className="bg-amber-50 px-4 py-12 text-black scroll-mt-16"
      aria-labelledby="church-calendar-heading"
    >
      <div className="max-w-4xl mx-auto">
        <h2
          id="church-calendar-heading"
          className="text-4xl font-bold text-orange-700 font-montserrat"
        >
          {t("title")}
        </h2>

        <CalendarInteractive events={events} />
      </div>
    </section>
  );
}
