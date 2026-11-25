import { useState } from "react";
import Image from "next/image";
import {
  address,
  directions,
  dateLabel,
  time,
  type Demo,
  type Gathering,
  type Status,
} from "../model/bulletin";
import { AccountChoices, type Provider } from "./account";
import { Dialog } from "./detail-dialog";
import { Icon } from "./icons";

import { Lineup } from "./lineup";
import { label } from "./rows";
import type { Roster } from "../model/scheduling";

export type Change = (update: (s: Demo) => Demo) => void;
export function Detail({
  item,
  startRsvp,
  roster,
  demo,
  change,
  signedIn,
  onSignIn,
  onClose,
}: {
  item: Gathering;
  startRsvp: boolean;
  roster?: Roster;
  demo: Demo;
  change: Change;
  signedIn: boolean;
  onSignIn: (provider: Provider) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState(startRsvp);
  const [signInPrompt, setSignInPrompt] = useState(false);
  const reg = demo.registrations[item.id]?.person;
  const status = label(item, demo);
  function shift(next: Status) {
    change((s) => ({ ...s, shifts: { ...s.shifts, [item.id]: next } }));
  }
  if (startRsvp && !signedIn) {
    return (
      <Dialog title="Sign in to RSVP" onClose={onClose}>
        <h2>Sign in to RSVP</h2>
        <p>{item.title}</p>
        <AccountChoices onContinue={onSignIn} />
      </Dialog>
    );
  }
  return (
    <Dialog title={item.title} onClose={onClose}>
      <span className="eyebrow">
        {item.kind} / {item.category}
      </span>
      <h2>{item.title}</h2>
      <p>{item.text}</p>
      {item.kind === "Event" && item.image && (
        <div className="event-photo">
          <Image src={item.image} alt="" fill sizes="(max-width: 600px) 100vw, 520px" />
        </div>
      )}
      <div className="facts">
        <div>
          <Icon name="events" />
          <span>
            {item.kind === "Service" && item.recurrence ? item.recurrence : dateLabel(item.date, {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
        <div>
          <Icon name="clock" />
          <span>
            {item.arrival !== undefined ? (
              <>
                <strong>Arrive at {time(item.arrival)}</strong>
                <small>{item.gatheringTitle ?? "Service"} starts at {time(item.minutes)} ET</small>
                {item.finish !== undefined && <small>Finish at {time(item.finish)} ET</small>}
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
              ? "RSVP · Demo registration"
              : "Drop in · No registration required"}
          </div>
        )}
      </div>
      {item.kind === "Assignment" ? (
        <>
          {roster && <><h3>Team roster</h3><Lineup roster={roster}/></>}
          {status === "Coverage requested" && <span className="tag" role="status">{status}</span>}
          {status !== "Coverage requested" && (
            <div className="actions">
              <button className="primary" onClick={() => shift("Coverage requested")}>Request coverage</button>
            </div>
          )}
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
          ) : (item.rsvp || reg) && (
            <div className="actions">
              {item.rsvp && !reg && (
                <button className="primary" onClick={() => signedIn ? setForm(true) : setSignInPrompt(true)}>
                  RSVP
                </button>
              )}
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
      {signInPrompt && (
        <Dialog title="Sign in to RSVP" onClose={() => setSignInPrompt(false)}>
          <h2>Sign in to RSVP</h2>
          <p>{item.title}</p>
          <AccountChoices onContinue={(provider) => {
            onSignIn(provider);
            setForm(true);
            setSignInPrompt(false);
          }} />
          <button className="text-btn preview-error" onClick={() => setSignInPrompt(false)}>Keep browsing</button>
        </Dialog>
      )}
    </Dialog>
  );
}
