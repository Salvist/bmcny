"use client";

import Link from "next/link";
import { BulletinLoading, useCommunity } from "@/app/components/community-app";
import { Icon } from "@/app/components/icons";
import { Rows } from "@/app/components/rows";
import { compare, dateLabel, time, type Gathering } from "@/app/model/bulletin";

function ServiceLinks({
  items,
  open,
}: {
  items: Gathering[];
  open: (i: Gathering) => void;
}) {
  return (
    <div className="service-links">
      {items.map((i) => (
        <button key={i.id} onClick={() => open(i)}>
          <span className="icon-tile">
            <Icon
              name={
                i.online
                  ? "sun"
                  : i.category === "Kids"
                    ? "group"
                    : i.category === "Youth"
                      ? "week"
                      : "services"
              }
            />
          </span>
          <span>
            <strong>{i.title}</strong>
            <small>
              {i.recurrence} · {time(i.minutes)}
            </small>
          </span>
          <Icon name="chevron" size={14} />
        </button>
      ))}
    </div>
  );
}
export default function HomePage() {
  const { data, demo, provider, personalShifts, scheduleItems, setItem } = useCommunity();
  if (!data) return <BulletinLoading />;
  const { worship } = data;
  const agenda = [...data.events, ...data.services].sort(compare);
  const upcoming = (entry: { date: string; arrival?: number; minutes: number }) =>
    entry.date > data.today || (entry.date === data.today && (entry.arrival ?? entry.minutes) >= data.minute);
  const nextGathering = scheduleItems.find((entry) => entry.kind !== "Assignment" && upcoming(entry));
  const nextShift = demo.volunteer
    ? personalShifts.find((entry) => upcoming(entry) && demo.shifts[entry.id] !== "Declined")
    : undefined;
  return (
    <>
      <article className="hero">
        <div className="hero-content">
          <span className="hero-label">
            <i /> Sunday gathering
          </span>
          <h2>Sunday Worship</h2>
          <div className="hero-meta">
            <span>
              <Icon name="events" size={15} />
              {dateLabel(worship.date, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}{" "}
              · {time(worship.minutes)}
            </span>
            <span>
              <Icon name="pin" size={15} />
              Rego Park
            </span>
          </div>
          <button onClick={() => setItem(worship)}>
            View service <Icon name="arrow" size={17} />
          </button>
        </div>
      </article>
      {provider && (
        <div className="home-previews">
          <section>
            <h2>My Schedule</h2>
            {nextGathering ? <Rows items={[nextGathering]} demo={demo} open={setItem} /> : (
              <div className="member-empty">
                <Icon name="schedule" />
                <h3>No upcoming gatherings</h3>
                <div className="actions"><Link href="/events">Browse events</Link></div>
              </div>
            )}
            <Link className="member-link" href="/schedule">View schedule <Icon name="arrow" size={16} /></Link>
          </section>
          {demo.volunteer && (
            <section>
              <h2>Serving</h2>
              {nextShift ? <Rows items={[nextShift]} demo={demo} open={setItem} /> : (
                <div className="member-empty">
                  <Icon name="schedule" />
                  <h3>No upcoming assignments</h3>
                </div>
              )}
              <Link className="member-link" href="/serving">View serving schedule <Icon name="arrow" size={16} /></Link>
            </section>
          )}
        </div>
      )}
      <div className="home-grid">
        <section>
          <div className="section-head">
            <h2>Coming up</h2>
            <Link href="/events">
              All events <Icon name="arrow" size={14} />
            </Link>
          </div>
          <Rows items={agenda.slice(0, 4)} demo={demo} open={setItem} />
        </section>
        <section className="services-panel">
          <div className="section-head">
            <h2>Weekly services</h2>
          </div>
          <ServiceLinks
            items={[worship, data.services[4], data.services[1]]}
            open={setItem}
          />
          <Link href="/services" className="panel-link">
            Explore services <Icon name="arrow" size={15} />
          </Link>
        </section>
      </div>
    </>
  );
}
