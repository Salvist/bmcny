"use client";

import { useEffect, useState } from "react";
import {
  bulletin,
  compare,
  dateLabel,
  emptyDemo,
  time,
  type Demo,
  type Gathering,
} from "./bulletin";
import { Detail, Dialog, type Change } from "./detail";
import { Icon } from "./icons";

const tabs = {
  week: "Home",
  services: "Services",
  events: "Events",
  profile: "Profile",
  schedule: "My Schedule",
} as const;
type Tab = keyof typeof tabs;
const destinations = [
  ["week", "home"],
  ["services", "services"],
  ["profile", "person"],
] as const;
const storageKey = "bmcny-community-v1";
const serviceViews = ["services", "events"] as const;
type ServiceView = (typeof serviceViews)[number];
const serviceViewKey = "bmcny-community-service-view";
function currentTab(): Tab {
  const hash = window.location.hash.slice(1);
  return Object.hasOwn(tabs, hash) ? (hash as Tab) : "week";
}
function label(item: Gathering, demo: Demo) {
  if (item.kind === "Assignment") return demo.shifts[item.id] ?? item.initial;
  if (demo.registrations[item.id]) return "Registered";
  if (demo.saved[item.id]) return "Saved";
}
function Rows({
  items,
  demo,
  open,
}: {
  items: Gathering[];
  demo: Demo;
  open: (i: Gathering) => void;
}) {
  return (
    <div className="rows">
      {items.map((i) => (
        <button className="row" key={i.id} onClick={() => open(i)}>
          <span className="day">
            <small>{dateLabel(i.date, { month: "short" })}</small>
            <b>{Number(i.date.slice(-2))}</b>
          </span>
          <span className="row-copy">
            <span className="row-category">{i.category}</span>
            <strong>{i.title}</strong>
            <span className="meta">
              {dateLabel(i.date, { weekday: "short" })} ·{" "}
              {i.arrival !== undefined ? "Arrive at " : ""}
              {time(i.arrival ?? i.minutes)} · {i.place}
            </span>
          </span>
          {label(i, demo) && <span className="tag">{label(i, demo)}</span>}
          <Icon name="chevron" size={15} />
        </button>
      ))}
    </div>
  );
}
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
export default function Home() {
  const [demo, setDemo] = useState<Demo>(emptyDemo);
  const [data, setData] = useState<ReturnType<typeof bulletin>>();
  const [tab, setTab] = useState<Tab>("week");
  const [lastServiceView, setLastServiceView] = useState<ServiceView>("services");
  const [item, setItem] = useState<Gathering>();
  const [tools, setTools] = useState(false);
  const [reset, setReset] = useState(false);
  const [day, setDay] = useState("");
  useEffect(() => {
    const refresh = () => setData(bulletin(new Date()));
    const nav = () => {
      const next = currentTab();
      setTab(next);
      if (next === "events" || next === "services") {
        setLastServiceView(next);
        try {
          localStorage.setItem(serviceViewKey, next);
        } catch {
          /* The selection remains available in memory. */
        }
      }
      setItem(undefined);
      setTools(false);
      window.scrollTo(0, 0);
    };
    function restore() {
      try {
        setDemo(
          JSON.parse(localStorage.getItem(storageKey) ?? "null") ?? emptyDemo(),
        );
      } catch {
        setDemo(emptyDemo());
      }
    }
    requestAnimationFrame(() => {
      try {
        if (localStorage.getItem(serviceViewKey) === "events") {
          setLastServiceView("events");
        }
      } catch {
        /* Use Services for the first visit. */
      }
      restore();
      refresh();
      nav();
    });
    const timer = setInterval(refresh, 60000);
    window.addEventListener("hashchange", nav);
    window.addEventListener("storage", restore);
    return () => {
      clearInterval(timer);
      window.removeEventListener("hashchange", nav);
      window.removeEventListener("storage", restore);
    };
  }, []);
  const change: Change = (update) => {
    const next = update(demo);
    setDemo(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* Keep the preview usable in memory. */
    }
  };
  const preview = () => {
    setReset(false);
    setTools(true);
  };
  if (!data)
    return (
      <main className="loading" aria-busy="true">
        Opening the bulletin…
      </main>
    );
  const agenda = [...data.events, ...data.services].sort(compare);
  const nextShift = data.shifts.find((i) => label(i, demo) !== "Declined");
  const schedule = new Map<string, Gathering>();
  for (const i of [
    ...Object.values(demo.saved),
    ...Object.values(demo.registrations).map((r) => r.item),
    ...(demo.volunteer ? data.shifts : []),
  ])
    schedule.set(i.id, i);
  const scheduleItems = [...schedule.values()].sort(compare);
  const section = tab === "events" ? "services" : tab === "schedule" ? "profile" : tab;
  const navigation = destinations.map(([k, icon]) => (
    <a
      key={k}
      href={"#" + (k === "services" ? lastServiceView : k)}
      aria-current={section === k ? (tab === "schedule" ? "location" : "page") : undefined}
    >
      <Icon name={icon} />
      <span>{tabs[k]}</span>
    </a>
  ));
  const worship = data.worship;
  return (
    <div className="app">
      <aside className="rail">
        <a className="brand" href="#week">
          <span className="brandmark">
            <Icon name="week" size={25} />
          </span>
          <span>
            BMCNY<small>Community</small>
          </span>
        </a>
        <nav aria-label="Main navigation">{navigation}</nav>
        <div className="rail-bottom">
          <small>
            Bethany Miracle Center
            <br />
            New York
          </small>
        </div>
      </aside>
      <main className="content">
        <header className="masthead">
          <span>
            <Icon name="week" size={17} /> Community bulletin
          </span>
          <span className="local">
            <i /> New York, NY
          </span>
        </header>
        <div className="page-heading">
          <span className="eyebrow">
            {dateLabel(data.today, {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <h1>{tab === "events" ? tabs.services : tabs[tab]}</h1>
        </div>
        {tab === "week" && (
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
                  <a href="#events">
                    All events <Icon name="arrow" size={14} />
                  </a>
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
                <a href="#services" className="panel-link">
                  Explore services <Icon name="arrow" size={15} />
                </a>
              </section>
            </div>
          </>
        )}
        {section === "services" && (
          <section>
            <nav className="service-switch" aria-label="Services views">
              {serviceViews.map((view) => (
                <a key={view} href={"#" + view} aria-current={tab === view ? "page" : undefined}>
                  {tabs[view]}
                </a>
              ))}
            </nav>
            <div className="section-head">
              <h2>{tab === "events" ? "Upcoming events" : "Weekly services"}</h2>
            </div>
            <Rows
              items={tab === "events" ? data.events : [...data.services].sort(compare)}
              demo={demo}
              open={setItem}
            />
          </section>
        )}
        {tab === "profile" && (
          <div className="actions">
            <button className="secondary" onClick={preview}>
              <Icon name="person" /> Preview settings
            </button>
            <a className="secondary" href="#schedule">
              <Icon name="schedule" /> My Schedule
            </a>
          </div>
        )}
        {tab === "schedule" && (
          <>
            <a href="#profile" className="text-btn">Back to Profile</a>
            <section>
              <div className="section-head">
                <h2>Your agenda</h2>
              </div>
              {scheduleItems.length ? (
                <Rows items={scheduleItems} demo={demo} open={setItem} />
              ) : (
                <div className="empty">
                  <Icon name="schedule" size={30} />
                  <h3>Your schedule is open</h3>
                  <p>
                    Save a gathering or register for an event to see it here.
                  </p>
                  <div className="actions">
                    <a href="#events" className="primary">
                      Browse events
                    </a>
                    <a href="#services" className="secondary">
                      Browse services
                    </a>
                  </div>
                </div>
              )}
            </section>
            {demo.volunteer && (
              <section className="availability">
                <div className="section-head">
                  <h2>Availability</h2>
                </div>
                <p>Mark dates when you’re unavailable to serve.</p>
                <form
                  className="date-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    change((s) => ({
                      ...s,
                      unavailable: [...new Set([...s.unavailable, day])].sort(),
                    }));
                    setDay("");
                  }}
                >
                  <label>
                    Unavailable date
                    <input
                      type="date"
                      required
                      min={data.today}
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                    />
                  </label>
                  <button className="primary">Add date</button>
                </form>
                {demo.unavailable.map((d) => (
                  <div className="unavailable" key={d}>
                    <div>
                      <strong>
                        {dateLabel(d, {
                          weekday: "short",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </strong>
                      <button
                        className="text-btn"
                        onClick={() =>
                          change((s) => ({
                            ...s,
                            unavailable: s.unavailable.filter((v) => v !== d),
                          }))
                        }
                      >
                        Remove
                      </button>
                    </div>
                    {data.shifts
                      .filter(
                        (i) => i.date === d && label(i, demo) !== "Declined",
                      )
                      .map((i) => (
                        <button
                          className="conflict"
                          key={i.id}
                          onClick={() => setItem(i)}
                        >
                          Assignment conflict · {i.title} ·{" "}
                          {label(i, demo) === "Confirmed"
                            ? "Request coverage"
                            : label(i, demo)}{" "}
                          <Icon name="arrow" size={14} />
                        </button>
                      ))}
                  </div>
                ))}
              </section>
            )}
          </>
        )}
      </main>
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {navigation}
      </nav>
      {item && (
        <Detail
          key={item.id}
          item={item}
          demo={demo}
          change={change}
          onClose={() => setItem(undefined)}
        />
      )}
      {tools && (
        <Dialog title="Preview settings" onClose={() => setTools(false)}>
          <span className="eyebrow">Prototype</span>
          <h2>Preview settings</h2>
          <p>Choose a view to explore the bulletin.</p>
          <div className="actions">
            {(["Visitor", "Volunteer"] as const).map((role) => (
              <button
                key={role}
                className={
                  demo.volunteer === (role === "Volunteer")
                    ? "primary"
                    : "secondary"
                }
                onClick={() => {
                  change((s) => ({ ...s, volunteer: role === "Volunteer" }));
                  setTools(false);
                }}
              >
                {role}
              </button>
            ))}
          </div>
          <hr />
          {reset ? (
            <>
              <p>
                Clear this browser’s demo schedule, RSVPs, and availability?
              </p>
              <button
                className="secondary"
                onClick={() => {
                  change(emptyDemo);
                  setTools(false);
                  setDay("");
                  window.location.hash = "week";
                }}
              >
                Confirm reset
              </button>
            </>
          ) : (
            <button className="text-btn" onClick={() => setReset(true)}>
              <Icon name="reset" size={16} /> Reset demo
            </button>
          )}
        </Dialog>
      )}
    </div>
  );
}
