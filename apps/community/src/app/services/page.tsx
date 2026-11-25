"use client";

import { BulletinLoading, useCommunity } from "@/app/components/community-app";
import { Icon } from "@/app/components/icons";
import { ServicesNavigation } from "@/app/components/services-navigation";
import { time } from "@/app/model/bulletin";

export default function ServicesPage() {
  const { data, setItem } = useCommunity();
  if (!data) return <BulletinLoading />;

  return (
    <section>
      <ServicesNavigation active="services" />
      <div className="section-head">
        <h2>Weekly services</h2>
        <span className="meta">Eastern time</span>
      </div>
      {Array.from(new Set(data.services.map(service => service.recurrence))).map(recurrence => (
        <section className="weekly-group" key={recurrence}>
          <h3>{recurrence}</h3>
          <div className="rows">
            {data.services.filter(service => service.recurrence === recurrence)
              .sort((a, b) => a.minutes - b.minutes)
              .map(service => (
                <button className="row" key={service.id} onClick={() => setItem(service)}>
                  <span className="weekly-time">{time(service.minutes)}</span>
                  <span className="row-copy">
                    <strong>{service.title}</strong>
                    <span className="meta">{service.online ? "Online via Zoom" : service.place}</span>
                  </span>
                  <Icon name="chevron" size={15} />
                </button>
              ))}
          </div>
        </section>
      ))}
    </section>
  );
}
