"use client";

import Link from "next/link";
import { useCommunity } from "@/app/components/community-app";
import { Icon } from "@/app/components/icons";
import { ProfileSignIn } from "@/app/components/profile-sign-in";
import { label, Rows } from "@/app/components/rows";
import { compare, dateLabel } from "@/app/model/bulletin";
import { departments, directory } from "@/app/model/scheduling";
import { LeaderSchedule, TeamRosters } from "./components/team-rosters";

export default function SchedulePage() {
  const {
    data, demo, provider, rosters, gatherings, personalShifts, scheduleItems,
    department, setDepartment, day, setDay, signIn, change, preview, setItem,
  } = useCommunity();
  if (!provider) return <ProfileSignIn onContinue={signIn} />;

  const memberships = departments.filter(d => demo.scheduling.members[d].includes(demo.scheduling.member));
  const teamRosters = Object.values(rosters).filter(r => memberships.includes(r.department) &&
    (!department || r.department === department) && r.gathering.date >= data.today && r.duties.length).sort((a, b) => compare(a.gathering, b.gathering));
  const filtered = scheduleItems.filter(i => !demo.volunteer || !department || (i.kind === "Assignment" && i.category === department));
  return (
    <>
      <div className="schedule-toolbar"><Link href="/profile" className="text-btn">Back to Profile</Link>
        <button className="secondary" onClick={preview}>{demo.volunteer ? (demo.scheduling.leader ? "Department leader" : directory[demo.scheduling.member]) + " · Switch view" : "Explore volunteer scheduling"}</button></div>
      {demo.scheduling.leader && demo.volunteer && <LeaderSchedule demo={demo} change={change} published={rosters} gatherings={gatherings}/>}
      <section>
        <div className="section-head">
          <h2>Your agenda</h2>
          {demo.volunteer && <label className="schedule-filter">Department filter<select value={department} onChange={e => setDepartment(e.target.value)}>
            <option value="">All departments</option>{memberships.map(d => <option key={d}>{d}</option>)}
          </select></label>}
        </div>
        {filtered.length ? (
          <Rows items={filtered} demo={demo} open={setItem} />
        ) : (
          <div className="empty">
            <Icon name="schedule" size={30} />
            <h3>{department ? "No assignments in " + department : "Your schedule is open"}</h3>
            <p>
              Save a gathering or register for an event to see it here.
            </p>
            <div className="actions">
              <Link href="/events" className="primary">
                Browse events
              </Link>
              <Link href="/services" className="secondary">
                Browse services
              </Link>
            </div>
          </div>
        )}
      </section>
      {demo.volunteer && <TeamRosters rosters={teamRosters}/>}
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
  );
}
