import { useState } from "react";
import type { Change } from "@/app/components/detail";
import { Lineup } from "@/app/components/lineup";
import { dateLabel, time, type Demo, type Gathering } from "@/app/model/bulletin";
import { departments, directory, publish, rosterKey, warnings, type Department, type Duty, type Roster } from "@/app/model/scheduling";

const dayLabel = (date: string) => dateLabel(date, { weekday: "short", month: "short", day: "numeric" });
const clockValue = (minute: number) => [Math.floor(minute / 60), minute % 60].map(v => String(v).padStart(2, "0")).join(":");
function minutes(value: string) {
  if (!value) return NaN;
  const [hours, mins] = value.split(":").map(Number);
  return hours * 60 + mins;
}

export function TeamRosters({ rosters }: { rosters: Roster[] }) {
  return <section className="serving-section"><h2>Team Rosters</h2>
    {rosters.length ? rosters.map(r => <details key={rosterKey(r.department, r.gathering)}>
      <summary><strong>{r.department}</strong> · {r.gathering.title}<small>{dayLabel(r.gathering.date)} · {time(r.gathering.minutes)} ET</small></summary>
      <Lineup roster={r} />
    </details>) : <p>No published rosters for this selection.</p>}
  </section>;
}

function Editor({ roster, published, demo, change }: {
  roster: Roster; published: Record<string, Roster>; demo: Demo; change: Change;
}) {
  const key = rosterKey(roster.department, roster.gathering);
  const [duties, setDuties] = useState(roster.duties);
  const [ack, setAck] = useState("");
  const [message, setMessage] = useState("");
  const current = { ...roster, duties };
  const alerts = warnings(current, published, demo);
  const signature = JSON.stringify([current, alerts]);
  const members = demo.scheduling.members[roster.department];
  function edit(next: Duty[]) {
    setDuties(next);
    setAck("");
    setMessage("");
  }
  function patch(id: string, fields: Partial<Duty>) {
    edit(duties.map(d => d.id === id ? { ...d, ...fields } : d));
  }
  return <form className="roster-editor" onSubmit={e => {
    e.preventDefault();
    if (duties.some(d => !d.role.trim() || !Number.isFinite(d.arrival) || !Number.isFinite(d.finish) || d.finish <= d.arrival)) {
      setMessage("Enter a role and a finish time after report time for every assignment.");
      return;
    }
    const cleaned = { ...current, duties: duties.map(d => ({ ...d, role: d.role.trim() })) };
    const submit = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    if (submit?.value === "publish") {
      if (alerts.length && ack !== signature) return;
      change(s => publish(s, cleaned, published, ack === signature));
      setMessage("Roster published. Volunteers can now see their assignments.");
      setAck("");
    } else {
      change(s => ({ ...s, scheduling: { ...s.scheduling, drafts: { ...s.scheduling.drafts, [key]: cleaned } } }));
      setMessage("Draft saved. Volunteers see the last published roster.");
    }
  }}>
    <h3>{roster.department} roster</h3>
    {duties.map((d, index) => {
      const live = published[key]?.duties.find(old => old.id === d.id && old.member === d.member);
      return <fieldset key={d.id}><legend>Assignment {index + 1}</legend>
        <div className="roster-fields">
          <label>Volunteer<select value={d.member} onChange={e => patch(d.id, { member: e.target.value })}>{members.map(m => <option key={m} value={m}>{directory[m]}</option>)}</select></label>
          <label>Role<input required value={d.role} onChange={e => patch(d.id, { role: e.target.value })} /></label>
          <label>Report time (ET)<input required type="time" value={Number.isFinite(d.arrival) ? clockValue(d.arrival) : ""} onInput={e => patch(d.id, { arrival: minutes(e.currentTarget.value) })} /></label>
          <label>Finish time (ET)<input required type="time" value={Number.isFinite(d.finish) ? clockValue(d.finish) : ""} onInput={e => patch(d.id, { finish: minutes(e.currentTarget.value) })} /></label>
        </div>
        <label>Serving instructions<input value={d.instructions} onChange={e => patch(d.id, { instructions: e.target.value })} /></label>
        <div className="actions"><span>{live ? "Published · " + (demo.shifts[d.id] ?? live.initial ?? "Pending") : "Unpublished assignment"}</span>
          <button type="button" className="text-btn" onClick={() => edit(duties.filter(old => old.id !== d.id))}>Remove assignment</button></div>
      </fieldset>;
    })}
    <button type="button" className="secondary" disabled={!members.length} onClick={() => edit([...duties, {
      id: crypto.randomUUID(), member: members[0], role: "", arrival: Math.max(0, roster.gathering.minutes - 15), finish: Math.min(1439, roster.gathering.minutes + 60), instructions: "",
    }])}>Add assignment</button>
    {alerts.length > 0 && <div className="roster-warning"><strong>Scheduling warnings</strong><ul>{alerts.map(a => <li key={a}>{a}</li>)}</ul>
      <label><input type="checkbox" checked={ack === signature} onChange={e => setAck(e.target.checked ? signature : "")} /> I reviewed these warnings and want to publish.</label>
    </div>}
    <div className="actions"><button className="secondary" value="draft">Save draft</button>
      <button className="primary" value="publish" disabled={alerts.length > 0 && ack !== signature}>Publish roster</button></div>
    {message && <p role="status">{message}</p>}
  </form>;
}

export function LeaderSchedule({ demo, change, published, gatherings }: {
  demo: Demo; change: Change; published: Record<string, Roster>; gatherings: Gathering[];
}) {
  const [department, setDepartment] = useState<Department>("Music");
  const [selected, setSelected] = useState("");
  const gathering = gatherings.find(g => g.id === selected) ?? gatherings.find(g => g.title === "Sunday Worship")!;
  const key = rosterKey(department, gathering);
  const roster = demo.scheduling.drafts[key] ?? published[key] ?? { department, gathering, duties: [] };
  const members = demo.scheduling.members[department];
  const available = Object.keys(directory).filter(m => !members.includes(m));
  return <section className="serving-section"><h2>Department scheduling</h2>
    <div className="roster-fields">
      <label>Department<select value={department} onChange={e => setDepartment(e.target.value as Department)}>{departments.map(d => <option key={d}>{d}</option>)}</select></label>
      <label>Dated gathering<select value={gathering.id} onChange={e => setSelected(e.target.value)}>{gatherings.map(g => <option key={g.id} value={g.id}>{dayLabel(g.date)} · {time(g.minutes)} · {g.title}</option>)}</select></label>
    </div>
    <details><summary>Department members ({members.length})</summary><p>{members.map(m => directory[m]).join(", ") || "No members yet."}</p>
      {available.length > 0 && <form className="actions" onSubmit={e => {
        e.preventDefault();
        const member = String(new FormData(e.currentTarget).get("member"));
        change(s => ({ ...s, scheduling: { ...s.scheduling, members: { ...s.scheduling.members, [department]: [...new Set([...s.scheduling.members[department], member])] } } }));
      }}><label>Sample directory<select name="member">{available.map(m => <option key={m} value={m}>{directory[m]}</option>)}</select></label><button className="secondary">Add member</button></form>}
    </details>
    {demo.scheduling.drafts[key] && <p className="tag">Saved draft</p>}
    <Editor key={key} roster={roster} demo={demo} published={published} change={change}/>
  </section>;
}
