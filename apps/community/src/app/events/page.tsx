"use client";

import { BulletinLoading, useCommunity } from "@/app/components/community-app";
import Image from "next/image";
import { Icon } from "@/app/components/icons";
import { dateLabel, directions, time } from "@/app/model/bulletin";
import { ServicesNavigation } from "@/app/components/services-navigation";

export default function EventsPage() {
  const { data, demo, setItem } = useCommunity();
  if (!data) return <BulletinLoading />;

  return (
    <section>
      <ServicesNavigation active="events" />
      <div className="section-head">
        <h2>Upcoming events</h2>
      </div>
      {data.events.length ? (
        <div className="event-grid">
          {data.events.map(event => (
            <article key={event.id} className="event-card">
              {event.image && (
                <div className="event-photo">
                  <Image src={event.image} alt="" fill sizes="(max-width: 600px) 100vw, (max-width: 1050px) 50vw, 33vw" />
                </div>
              )}
              <div className="event-body">
                <h3><button onClick={() => setItem(event)}>{event.title}</button></h3>
                <p>{event.text}</p>
                <div className="event-meta">
                  <span><Icon name="events" size={16} />{dateLabel(event.date, { weekday: "short", month: "short", day: "numeric" })} · {time(event.minutes)} ET</span>
                  <span><Icon name={event.online ? "video" : "pin"} size={16} />{event.place}</span>
                </div>
                {!event.rsvp && <small>Drop in · No RSVP required</small>}
              </div>
              <div className="event-actions">
                  {!event.online && <a className="secondary" href={directions} target="_blank" rel="noreferrer">Get directions <Icon name="arrow" size={15} /></a>}
                  {demo.registrations[event.id] ? (
                    <button className="secondary" onClick={() => setItem(event)}><Icon name="check" size={15} /> Registered</button>
                  ) : event.rsvp && (
                    <button className="primary" onClick={() => setItem(event, "rsvp")}>RSVP</button>
                  )}
              </div>
            </article>
          ))}
        </div>
      ) : <p>No upcoming events.</p>}
    </section>
  );
}
