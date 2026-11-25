"use client";

import { useCommunity } from "@/app/components/community-app";
import { Rows } from "@/app/components/rows";
import { ServicesNavigation } from "@/app/components/services-navigation";

export default function EventsPage() {
  const { data, demo, setItem } = useCommunity();

  return (
    <section>
      <ServicesNavigation active="events" />
      <div className="section-head">
        <h2>Upcoming events</h2>
      </div>
      <Rows items={data.events} demo={demo} open={setItem} />
    </section>
  );
}
