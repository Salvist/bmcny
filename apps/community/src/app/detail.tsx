import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  address,
  directions,
  dateLabel,
  time,
  type Demo,
  type Gathering,
  type Status,
} from "./bulletin";
import { Icon } from "./icons";

export function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = before;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="sheet">
        <button className="close" aria-label="Close" onClick={onClose}>
          <Icon name="close" />
        </button>
        {children}
      </div>
    </dialog>
  );
}
export type Change = (update: (s: Demo) => Demo) => void;
export function Detail({
  item,
  demo,
  change,
  onClose,
}: {
  item: Gathering;
  demo: Demo;
  change: Change;
  onClose: () => void;
}) {
  const [form, setForm] = useState(false);
  const reg = demo.registrations[item.id]?.person;
  const saved = !!demo.saved[item.id];
  const status = demo.shifts[item.id] ?? item.initial;
  function shift(next: Status) {
    change((s) => ({ ...s, shifts: { ...s.shifts, [item.id]: next } }));
  }
  return (
    <Dialog title={item.title} onClose={onClose}>
      <span className="eyebrow">
        {item.kind} / {item.category}
      </span>
      <h2>{item.title}</h2>
      <p>{item.text}</p>
      {item.kind === "Event" && (
        <div
          className={
            "event-photo " +
            (item.category === "Bible study"
              ? "study-photo"
              : "community-photo")
          }
        />
      )}
      <div className="facts">
        <div>
          <Icon name="events" />
          <span>
            {dateLabel(item.date, {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            <small>{item.recurrence}</small>
          </span>
        </div>
        <div>
          <Icon name="clock" />
          <span>
            {item.arrival !== undefined ? (
              <>
                <strong>Arrive at {time(item.arrival)}</strong>
                <small>Service starts at {time(item.minutes)} ET</small>
              </>
            ) : (
              time(item.minutes) + " ET"
            )}
          </span>
        </div>
        <div>
          <Icon name={item.online ? "video" : "pin"} />
          <span>
            {item.online ? "Online via Zoom" : address}
            <small>
              <a
                href={
                  item.online ? "https://zoom.us/j/84545585721" : directions
                }
                target="_blank"
                rel="noreferrer"
              >
                {item.online ? "Open Zoom" : "Get directions"} ↗
              </a>
              {item.online ? " · Passcode BMCNY" : ""}
            </small>
          </span>
        </div>
        <div>
          <Icon name="group" />
          {item.audience}
        </div>
        {item.kind === "Event" && (
          <div>
            <Icon name="schedule" />
            {item.rsvp
              ? "Registration available · Demo RSVP"
              : "Drop in · No registration required"}
          </div>
        )}
      </div>
      {item.kind === "Assignment" ? (
        <>
          <span className="tag" role="status">
            {status}
          </span>
          <div className="actions">
            {status === "Pending" && (
              <>
                <button className="primary" onClick={() => shift("Confirmed")}>
                  Confirm assignment
                </button>
                <button className="secondary" onClick={() => shift("Declined")}>
                  Decline
                </button>
              </>
            )}
            {status === "Confirmed" && (
              <button
                className="primary"
                onClick={() => shift("Coverage requested")}
              >
                Request coverage
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          {reg && (
            <div className="notice" role="status">
              <strong>Registered · Demo RSVP</strong>
              <small>
                {reg.name} · {reg.email}
              </small>
            </div>
          )}
          {form && !reg ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const values = new FormData(e.currentTarget);
                const person = {
                  name: String(values.get("name")).trim(),
                  email: String(values.get("email")).trim(),
                };
                change((s) => ({
                  ...s,
                  registrations: {
                    ...s.registrations,
                    [item.id]: { item, person },
                  },
                }));
                setForm(false);
              }}
            >
              <h3>Reserve your place</h3>
              <p>Demo RSVP. Your details stay in this browser.</p>
              <label>
                Name
                <input
                  name="name"
                  required
                  pattern=".*\S.*"
                  autoComplete="name"
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </label>
              <div className="actions">
                <button className="primary">Confirm RSVP</button>
                <button
                  className="secondary"
                  type="button"
                  onClick={() => setForm(false)}
                >
                  Back
                </button>
              </div>
            </form>
          ) : (
            <div className="actions">
              {item.rsvp && !reg && (
                <button className="primary" onClick={() => setForm(true)}>
                  RSVP
                </button>
              )}
              <button
                className={item.rsvp ? "secondary" : "primary"}
                aria-pressed={saved}
                onClick={() =>
                  change((s) => {
                    const items = { ...s.saved };
                    if (saved) delete items[item.id];
                    else items[item.id] = item;
                    return { ...s, saved: items };
                  })
                }
              >
                <Icon name={saved ? "check" : "schedule"} />
                {saved ? "Remove saved item" : "Save to schedule"}
              </button>
              {reg && (
                <button
                  className="secondary"
                  onClick={() =>
                    change((s) => {
                      const registrations = { ...s.registrations };
                      delete registrations[item.id];
                      return { ...s, registrations };
                    })
                  }
                >
                  Cancel registration
                </button>
              )}
            </div>
          )}
        </>
      )}
    </Dialog>
  );
}
