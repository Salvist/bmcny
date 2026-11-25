"use client";

import Link from "next/link";
import { BulletinLoading, useCommunity } from "@/app/components/community-app";
import { Icon } from "@/app/components/icons";
import { label, Rows } from "@/app/components/rows";
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
  const { data, demo, personalShifts, setItem } = useCommunity();
  if (!data) return <BulletinLoading />;
  const { worship } = data;
  const agenda = [...data.events, ...data.services].sort(compare);
  const nextShift = personalShifts.find(i => label(i, demo) !== "Declined" &&
    (i.date > data.today || i.finish! > data.minute));
  return (
    <>
      {demo.volunteer && nextShift && (
        <section className="shift-call">
          <span className="eyebrow">Your next assignment</span>
          <Rows items={[nextShift]} demo={demo} open={setItem} />
        </section>
      )}
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
