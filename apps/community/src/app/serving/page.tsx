"use client";

import Link from "next/link";
import { BulletinLoading, useCommunity } from "@/app/components/community-app";
import { Icon } from "@/app/components/icons";
import { ProfileSignIn } from "@/app/components/profile-sign-in";
import { label, Rows } from "@/app/components/rows";
import { compare, dateLabel } from "@/app/model/bulletin";
import { departments, directory } from "@/app/model/scheduling";
import { LeaderSchedule, TeamRosters } from "./components/team-rosters";

export default function ServingPage() {
  const {
    data, demo, provider, rosters, gatherings, personalShifts,
    department, setDepartment, day, setDay, signIn, change, preview, setItem,
  } = useCommunity();
  if (!data) return <BulletinLoading />;
  if (!provider) return <ProfileSignIn onContinue={signIn} />;

  const persona = demo.volunteer
    ? (demo.scheduling.leader ? "Department leader" : directory[demo.scheduling.member]) + " · Switch view"
    : "Explore volunteer scheduling";

  if (!demo.volunteer) {
    return (
      <>
        <div className="schedule-toolbar">
          <Link href="/profile" className="text-btn">Back to Profile</Link>
        </div>
        <div className="empty">
          <Icon name="schedule" size={30} />
          <h3>Serving is for volunteers</h3>
          <p>Assignments, team rosters, and availability appear here when you serve at the church.</p>
          <button className="secondary" onClick={preview}>{persona}</button>
        </div>
      </>
    );
  }

  const memberships = departments.filter(d => demo.scheduling.members[d].includes(demo.scheduling.member));
  const teamRosters = Object.values(rosters).filter(r => memberships.includes(r.department) &&
    (!department || r.department === department) && r.gathering.date >= data.today && r.duties.length).sort((a, b) => compare(a.gathering, b.gathering));
  const assignments = personalShifts.filter(i => !department || i.category === department);
  return (
    <>
      <div className="schedule-toolbar">
        <Link href="/profile" className="text-btn">Back to Profile</Link>
        <button className="secondary" onClick={preview}>{persona}</button>
      </div>
      {demo.scheduling.leader && <LeaderSchedule demo={demo} change={change} published={rosters} gatherings={gatherings} />}
      <section>
        <div className="section-head">
          <h2>Assignments</h2>
          <label className="schedule-filter">Department filter<select value={department} onChange={e => setDepartment(e.target.value)}>
            <option value="">All departments</option>{memberships.map(d => <option key={d}>{d}</option>)}
          </select></label>
        </div>
        {assignments.length ? (
          <Rows items={assignments} demo={demo} open={setItem} />
        ) : (
          <div className="empty">
            <Icon name="schedule" size={30} />
            <h3>{department ? "No assignments in " + department : "No upcoming assignments"}</h3>
            <p>Published rosters for your departments show up here.</p>
          </div>
        )}
      </section>
      <TeamRosters rosters={teamRosters} />
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
              .filter((i) => i.date === d && label(i, demo) !== "Declined")
              .map((i) => (
                <button className="conflict" key={i.id} onClick={() => setItem(i)}>
                  Assignment conflict · {i.title} ·{" "}
                  {label(i, demo) === "Confirmed" ? "Request coverage" : label(i, demo)}{" "}
                  <Icon name="arrow" size={14} />
                </button>
              ))}
          </div>
        ))}
      </section>
    </>
  );
}
