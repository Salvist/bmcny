import { dateLabel, time, type Demo, type Gathering } from "../model/bulletin";
import { Icon } from "./icons";

export function label(item: Gathering, demo: Demo) {
  if (item.kind === "Assignment") return demo.shifts[item.id] === "Coverage requested" ? "Coverage requested" : undefined;
  if (demo.registrations[item.id]) return "Registered";
}
export function Rows({
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
              {time(i.arrival ?? i.minutes)} · {i.gatheringTitle ? i.gatheringTitle + " at " + time(i.minutes) + " ET" : i.place}
              {i.kind === "Event" && (i.rsvp ? " · RSVP" : " · Drop in")}
            </span>
          </span>
          {label(i, demo) && <span className="tag">{label(i, demo)}</span>}
          <Icon name="chevron" size={15} />
        </button>
      ))}
    </div>
  );
}
