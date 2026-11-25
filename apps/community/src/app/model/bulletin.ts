import { initialScheduling, normalizeScheduling, type Scheduling } from "./scheduling";
export const address = "92-14 63rd Dr, Rego Park, NY 11374";
export const directions =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(address);
type Kind = "Service" | "Event" | "Assignment";
export type Gathering = {
  id: string;
  title: string;
  kind: Kind;
  date: string;
  minutes: number;
  place: string;
  category: string;
  text: string;
  audience: string;
  recurrence?: string;
  rsvp?: boolean;
  image?: string;
  online?: boolean;
  gatheringTitle?: string;
  rosterId?: string;
  finish?: number;
  arrival?: number;
  initial?: "Pending" | "Confirmed";
};
export type Status =
  "Pending" | "Confirmed" | "Declined" | "Coverage requested";
export type Registration = { name: string; email: string };
export type MemberProfile = Registration & { phone: string; photo: string };
export type Preferences = { gatherings: boolean; rsvps: boolean; assignments: boolean };
export const sampleAccount = { name: "Alex Morgan", email: "alex@example.com" };
export type Demo = {
  profile: MemberProfile;
  preferences: Preferences;
  scheduling: Scheduling;
  volunteer: boolean;
  saved: Record<string, Gathering>;
  registrations: Record<string, { item: Gathering; person: Registration }>;
  shifts: Record<string, Status>;
  unavailable: string[];
};
export function emptyDemo(): Demo {
  return {
    profile: { ...sampleAccount, phone: "", photo: "" },
    preferences: { gatherings: false, rsvps: false, assignments: false },
    scheduling: initialScheduling(),
    volunteer: false,
    saved: {},
    registrations: {},
    shifts: {},
    unavailable: [],
  };
}
export function restoreDemo(saved: Demo | null): Demo {
  if (!saved?.scheduling) return emptyDemo();
  return { ...saved, scheduling: normalizeScheduling(saved.scheduling) };
}
const iso = (d: Date) => d.toISOString().slice(0, 10);
export function dateLabel(day: string, options: Intl.DateTimeFormatOptions) {
  return new Date(day + "T12:00:00Z").toLocaleDateString("en-US", {
    ...options,
    timeZone: "UTC",
  });
}
export function time(minutes: number) {
  const hour = Math.floor(minutes / 60);
  return (
    (hour % 12 || 12) +
    ":" +
    String(minutes % 60).padStart(2, "0") +
    (hour >= 12 ? " PM" : " AM")
  );
}
export function compare(a: Gathering, b: Gathering) {
  return (
    a.date.localeCompare(b.date) ||
    (a.arrival ?? a.minutes) - (b.arrival ?? b.minutes)
  );
}
export function bulletin(now: Date) {
  const local = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const part = (key: string) => local.find((p) => p.type === key)!.value;
  const today = [part("year"), part("month"), part("day")].join("-");
  const minute = Number(part("hour")) * 60 + Number(part("minute"));
  const start = new Date(today + "T12:00:00Z");
  function next(days: number[], at: number) {
    const d = new Date(start);
    if (at <= minute) d.setUTCDate(d.getUTCDate() + 1);
    while (!days.includes(d.getUTCDay())) d.setUTCDate(d.getUTCDate() + 1);
    return iso(d);
  }
  function make(
    key: string,
    date: string,
    details: Omit<Gathering, "id" | "date">,
  ): Gathering {
    return { ...details, date, id: key + "-" + date };
  }
  const sunday = next([0], 1080);
  const onsite = {
    place: "Rego Park",
    kind: "Service" as const,
    minutes: 1080,
    recurrence: "Every Sunday",
    category: "Worship",
    audience: "Everyone",
  };
  const worship = make("worship", sunday, {
    ...onsite,
    title: "Sunday Worship",
    text: "Gather with the church for worship, prayer, and a message. English translation is available upon request.",
  });
  const services = [
    worship,
    make("kids", sunday, {
      ...onsite,
      title: "Kids Church",
      category: "Kids",
      audience: "Children ages 3–12",
      text: "An English-language gathering for children during Sunday worship.",
    }),
    make("youth", sunday, {
      ...onsite,
      title: "BMC Youth",
      category: "Youth",
      audience: "Teenagers ages 13–18",
      text: "An English-language Sunday gathering for teenagers to worship and grow together.",
    }),
    make("online", next([0], 600), {
      ...onsite,
      title: "Sunday Worship Online",
      minutes: 600,
      place: "Zoom",
      online: true,
      text: "Join the Sunday morning congregation from home.",
    }),
    make("prayer", next([1, 2, 3, 4, 5, 6], 330), {
      ...onsite,
      title: "Morning Prayer",
      category: "Prayer",
      minutes: 330,
      place: "Zoom",
      online: true,
      recurrence: "Monday–Saturday",
      text: "Begin the day together with Scripture and prayer.",
    }),
  ];
  const event = {
    kind: "Event" as const,
    place: "Rego Park",
    audience: "Everyone",
  };
  const events = [
    make("study", "2026-11-25", {
      ...event,
      title: "Community Bible Study",
      image: "/bible_study.webp",
      minutes: 1140,
      category: "Bible study",
      text: "Bring your Bible and join a small-group conversation. First-time visitors are welcome.",
    }),
    make("table", "2026-11-28", {
      ...event,
      title: "Community Lunch",
      image: "/bethany_members.webp",
      minutes: 720,
      category: "Fellowship",
      rsvp: true,
      text: "Pull up a chair for a shared lunch with the BMCNY community. Reserve a place so the hospitality team can plan the table.",
    }),
    make("welcome", "2026-11-29", {
      ...event,
      title: "Newcomers’ Welcome",
      minutes: 1170,
      category: "Welcome",
      rsvp: true,
      text: "Meet the welcome team after Sunday worship and get to know your church community.",
    }),
  ].filter(event => event.date > today || (event.date === today && event.minutes > minute)).sort(compare);
  return { today, minute, worship, services, events };
}
