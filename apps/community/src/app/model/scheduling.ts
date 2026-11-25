import { compare, time, type Demo, type Gathering, type Status } from "./bulletin";
import type { bulletin } from "./bulletin";

export const directory: Record<string, string> = {
  alex: "Alex Morgan", maya: "Maya Chen", sam: "Sam Rivera", jo: "Jo Park",
};
export const departments = ["Music", "Online Meetings", "Welcome", "Hospitality"] as const;
export type Department = typeof departments[number];
export type Duty = {
  id: string; member: string; role: string; arrival: number; finish: number; instructions: string;
  initial?: "Pending" | "Confirmed";
};
export type Roster = { department: Department; gathering: Gathering; duties: Duty[] };
type Personal = Pick<Demo, "profile" | "preferences" | "saved" | "registrations" | "unavailable">;
export type Scheduling = {
  member: string; leader: boolean; members: Record<Department, string[]>;
  published: Record<string, Roster>; drafts: Record<string, Roster>; accounts: Record<string, Personal>;
};
export function initialScheduling(): Scheduling {
  return {
    member: "alex", leader: false, members: {
      Music: ["alex", "maya", "sam"], "Online Meetings": ["alex", "jo"], Welcome: [], Hospitality: [],
    }, published: {}, drafts: {}, accounts: {},
  };
}
export function switchMember(demo: Demo, member: string, leader: boolean): Demo {
  const s = demo.scheduling;
  const { profile, preferences, saved, registrations, unavailable } = demo;
  const accounts = { ...s.accounts, [s.member]: { profile, preferences, saved, registrations, unavailable } };
  const personal = accounts[member] ?? {
    profile: { name: directory[member], email: member + "@example.com", phone: "", photo: "" },
    preferences: { gatherings: false, rsvps: false, assignments: false }, saved: {}, registrations: {}, unavailable: [],
  };
  delete accounts[member];
  return { ...demo, ...personal, volunteer: true, scheduling: { ...s, member, leader, accounts } };
}
export const rosterKey = (department: Department, gathering: Gathering) => department + "/" + gathering.id;
function moveWeek(g: Gathering, weeks = 1): Gathering {
  const day = new Date(g.date + "T12:00:00Z");
  day.setUTCDate(day.getUTCDate() + 7 * weeks);
  const date = day.toISOString().slice(0, 10);
  return { ...g, date, id: g.id.replace(g.date, date) };
}
export function scheduleData(data: ReturnType<typeof bulletin>, state: Scheduling) {
  // Keep Sunday's roster visible after the public bulletin advances to the next service.
  const services = data.services.flatMap(g => {
    const previous = moveWeek(g, -1);
    return previous.date === data.today ? [previous, g, moveWeek(g)] : [g, moveWeek(g)];
  });
  const gatherings = [...services, ...data.events];
  const rosters: Record<string, Roster> = {};
  function seed(department: Department, gathering: Gathering, duties: Duty[]) {
    rosters[rosterKey(department, gathering)] = { department, gathering, duties };
  }
  for (const gathering of services.filter(g => g.title === data.worship.title)) {
    const week = Math.round((Date.parse(gathering.date) - Date.UTC(2026, 10, 29)) / 604800000);
    seed("Music", gathering, [
      { id: "keys-" + gathering.id, member: week % 2 === 0 ? "alex" : "sam", role: "Keyboard", arrival: 1035, finish: 1155, instructions: "Meet the music team on stage for sound check." },
      { id: "vocals-" + gathering.id, member: "maya", role: "Vocals", arrival: 1035, finish: 1155, instructions: "Join the keyboard player for sound check." },
    ]);
  }
  for (const gathering of services.filter(g => g.title === "Sunday Worship Online")) {
    seed("Online Meetings", gathering, [
      { id: "zoom-" + gathering.id, member: "alex", role: "Zoom operator", arrival: 585, finish: 675, instructions: "Open the Zoom room and check the host audio before worship." },
    ]);
  }
  Object.assign(rosters, state.published);
  const choices = new Map(gatherings.map(g => [g.id, g]));
  for (const roster of [...Object.values(rosters), ...Object.values(state.drafts)]) {
    if (roster.gathering.date >= data.today) choices.set(roster.gathering.id, roster.gathering);
  }
  return { rosters, gatherings: [...choices.values()].sort(compare) };
}
export function assignments(rosters: Record<string, Roster>, member: string): Gathering[] {
  return Object.values(rosters).flatMap(({ department, gathering, duties }) => duties.filter(d => d.member === member).map(d => ({
    ...gathering, kind: "Assignment" as const, category: department, audience: department,
    title: d.role, gatheringTitle: gathering.title, rosterId: rosterKey(department, gathering),
    id: d.id, arrival: d.arrival, finish: d.finish, text: d.instructions, initial: d.initial ?? "Pending" as const,
  }))).sort(compare);
}
export function warnings(roster: Roster, published: Record<string, Roster>, demo: Demo) {
  const key = rosterKey(roster.department, roster.gathering);
  const all = Object.values({ ...published, [key]: roster }).filter(r => r.gathering.date === roster.gathering.date);
  const messages = new Set<string>();
  for (const duty of roster.duties) {
    const unavailable = duty.member === demo.scheduling.member ? demo.unavailable : demo.scheduling.accounts[duty.member]?.unavailable;
    if (unavailable?.includes(roster.gathering.date)) messages.add(directory[duty.member] + " marked this date unavailable.");
    for (const other of all) for (const peer of other.duties) {
      if (peer.id !== duty.id && peer.member === duty.member && peer.arrival < duty.finish && duty.arrival < peer.finish && demo.shifts[peer.id] !== "Declined") {
        messages.add(directory[duty.member] + " · " + duty.role + " overlaps " + other.department + " / " + peer.role + " (" + time(peer.arrival) + "–" + time(peer.finish) + ").");
      }
    }
  }
  return [...messages];
}
export function publish(demo: Demo, roster: Roster, published: Record<string, Roster>, acknowledged: boolean): Demo {
  if (warnings(roster, published, demo).length && !acknowledged) return demo;
  const key = rosterKey(roster.department, roster.gathering);
  const shifts: Record<string, Status> = { ...demo.shifts };
  const previous = published[key]?.duties ?? [];
  for (const duty of roster.duties) {
    const old = previous.find(d => d.id === duty.id);
    if (!old || old.member !== duty.member || old.role !== duty.role || old.arrival !== duty.arrival || old.finish !== duty.finish) shifts[duty.id] = "Pending";
  }
  const drafts = { ...demo.scheduling.drafts };
  delete drafts[key];
  return { ...demo, shifts, scheduling: { ...demo.scheduling, published: { ...demo.scheduling.published, [key]: roster }, drafts } };
}
