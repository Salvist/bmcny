"use client";

import { useCommunity } from "@/app/components/community-app";
import { Icon } from "@/app/components/icons";
import { label, Rows } from "@/app/components/rows";
import { dateLabel } from "@/app/model/bulletin";
import { ServingShell } from "./components/serving-shell";

export default function ServingPage() {
  return (
    <ServingShell>
      <MyServing />
    </ServingShell>
  );
}

function MyServing() {
  const {
    data, demo, personalShifts,
    day, setDay, change, preview, setItem,
  } = useCommunity();
  if (!data) return null;

  if (!demo.volunteer) {
    return (
      <div className="empty">
        <Icon name="schedule" size={30} />
        <h3>Serving is for volunteers</h3>
        <p>Assignments and availability appear here when you serve at the church.</p>
        <button className="secondary" onClick={preview}>Explore volunteer scheduling</button>
      </div>
    );
  }

  return (
    <>
      <section>
        <div className="section-head">
          <h2>Assignments</h2>
        </div>
        {personalShifts.length ? (
          <Rows items={personalShifts} demo={demo} open={setItem} />
        ) : (
          <div className="empty">
            <Icon name="schedule" size={30} />
            <h3>No upcoming assignments</h3>
            <p>Published rosters for your departments show up here.</p>
          </div>
        )}
      </section>
      <section className="availability">
        <div className="section-head">
          <h2>Availability</h2>
        </div>
        <p>Mark dates when you’re unavailable to serve.</p>
        <form
          className="date-form"
          onSubmit={(e) => {
            e.preventDefault();
            const date = new FormData(e.currentTarget).get("unavailableDate");
            if (typeof date !== "string" || !date) return;
            change((s) => ({
              ...s,
              unavailable: [...new Set([...s.unavailable, date])].sort(),
            }));
            setDay("");
          }}
        >
          <label>
            Unavailable date
            <input
              type="date"
              name="unavailableDate"
              required
              min={data.today}
              value={day}
              onInput={(e) => setDay(e.currentTarget.value)}
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
            {personalShifts
              .filter((i) => i.date === d)
              .map((i) => (
                <button className="conflict" key={i.id} onClick={() => setItem(i)}>
                  Assignment conflict · {i.title} ·{" "}
                  {label(i, demo) === "Coverage requested" ? "Coverage requested" : "Request coverage"}{" "}
                  <Icon name="arrow" size={14} />
                </button>
              ))}
          </div>
        ))}
      </section>
    </>
  );
}
