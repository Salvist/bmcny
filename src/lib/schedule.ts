import { EventData } from "@/constants/events";
import { services, ServiceData } from "@/constants/services";

export type CalendarItemKind = "service" | "event";

export interface CalendarItem {
  kind: CalendarItemKind;
  id: string;
  date: Date;
  title: string;
  timeLabel?: string;
  hour?: number;
  minute?: number;
  service?: ServiceData;
  event?: EventData;
}

export function parseTime(
  timeStr: string | undefined
): { hour: number; minute: number } | null {
  if (!timeStr) return null;
  const match = timeStr.match(/(\d+):?(\d+)?(AM|PM)/i);
  if (!match) return null;

  let hour = parseInt(match[1]);
  const minute = match[2] ? parseInt(match[2]) : 0;
  const period = match[3].toUpperCase();

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return { hour, minute };
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function serviceRunsOnDayOfWeek(service: ServiceData, dayOfWeek: number): boolean {
  const frequency = service.frequency ?? "";
  if (frequency.includes("Sunday") && dayOfWeek === 0) return true;
  if (frequency.includes("Monday - Saturday") && dayOfWeek >= 1 && dayOfWeek <= 6)
    return true;
  if (frequency.includes("Thursday") && dayOfWeek === 4) return true;
  return false;
}

function eventRunsOnDate(event: EventData, date: Date): boolean {
  if (event.recurrenceType !== "weekly") return true;
  return event.recurrenceDays.includes(date.getDay());
}

export function getServiceOccurrencesInMonth(
  service: ServiceData,
  year: number,
  month: number
): { date: Date; hour: number; minute: number }[] {
  const time = parseTime(service.time);
  if (!time) return [];

  const { hour, minute } = time;
  const occurrences: { date: Date; hour: number; minute: number }[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    if (serviceRunsOnDayOfWeek(service, date.getDay())) {
      occurrences.push({ date: startOfDay(date), hour, minute });
    }
  }

  return occurrences;
}

export function getEventOccurrencesInMonth(
  eventList: EventData[],
  year: number,
  month: number
): CalendarItem[] {
  const items: CalendarItem[] = [];
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  for (const event of eventList) {
    if (!event.startDate || !event.endDate) continue;

    const rangeStart = startOfDay(event.startDate);
    const rangeEnd = startOfDay(event.endDate);

    const cursor = new Date(
      Math.max(rangeStart.getTime(), monthStart.getTime())
    );
    const end = new Date(Math.min(rangeEnd.getTime(), monthEnd.getTime()));

    if (cursor > end) continue;

    cursor.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    while (cursor <= end) {
      const day = startOfDay(cursor);
      if (eventRunsOnDate(event, day)) {
        items.push({
          kind: "event",
          id: `event-${event.name}-${toDateKey(day)}`,
          date: day,
          title: event.name,
          event,
        });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return items;
}

export function getNextServiceTime(
  service: ServiceData,
  now: Date = new Date()
): { service: ServiceData; nextTime: Date } | null {
  const time = parseTime(service.time);
  if (!time) return null;

  const { hour, minute } = time;

  if (service.frequency?.includes("Sunday")) {
    const nextOccurrence = new Date(now);
    nextOccurrence.setHours(hour, minute, 0, 0);

    const currentDay = now.getDay();
    const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;

    if (daysUntilSunday === 0 && nextOccurrence <= now) {
      nextOccurrence.setDate(now.getDate() + 7);
    } else if (daysUntilSunday > 0) {
      nextOccurrence.setDate(now.getDate() + daysUntilSunday);
    }

    return { service, nextTime: nextOccurrence };
  }

  if (service.frequency?.includes("Monday - Saturday")) {
    const nextOccurrence = new Date(now);
    nextOccurrence.setHours(hour, minute, 0, 0);

    const currentDay = now.getDay();

    if (currentDay >= 1 && currentDay <= 6 && nextOccurrence > now) {
      return { service, nextTime: nextOccurrence };
    }

    let daysToAdd = 1;
    let targetDay = (currentDay + daysToAdd) % 7;

    while (targetDay === 0) {
      daysToAdd++;
      targetDay = (currentDay + daysToAdd) % 7;
    }

    nextOccurrence.setDate(now.getDate() + daysToAdd);
    return { service, nextTime: nextOccurrence };
  }

  if (service.frequency?.includes("Thursday")) {
    const nextOccurrence = new Date(now);
    nextOccurrence.setHours(hour, minute, 0, 0);

    const currentDay = now.getDay();
    const thursdayDay = 4;

    let daysUntilThursday = (thursdayDay - currentDay + 7) % 7;

    if (daysUntilThursday === 0 && nextOccurrence <= now) {
      daysUntilThursday = 7;
    }

    if (daysUntilThursday > 0) {
      nextOccurrence.setDate(now.getDate() + daysUntilThursday);
    }

    return { service, nextTime: nextOccurrence };
  }

  return null;
}

export function getCalendarItemsForMonth(
  year: number,
  month: number,
  eventList: EventData[] = []
): CalendarItem[] {
  const items: CalendarItem[] = [];

  for (const service of services) {
    const occurrences = getServiceOccurrencesInMonth(service, year, month);
    for (const { date, hour, minute } of occurrences) {
      items.push({
        kind: "service",
        id: `service-${service.name}-${toDateKey(date)}-${hour}-${minute}`,
        date,
        title: service.name,
        timeLabel: service.time,
        hour,
        minute,
        service,
      });
    }
  }

  items.push(...getEventOccurrencesInMonth(eventList, year, month));

  return items;
}

export function compareCalendarItemsByTime(a: CalendarItem, b: CalendarItem): number {
  const aAllDay = a.hour === undefined;
  const bAllDay = b.hour === undefined;
  if (aAllDay && !bAllDay) return -1;
  if (!aAllDay && bAllDay) return 1;
  if (aAllDay && bAllDay) return a.title.localeCompare(b.title);

  const aTime = a.hour! * 60 + (a.minute ?? 0);
  const bTime = b.hour! * 60 + (b.minute ?? 0);
  if (aTime !== bTime) return aTime - bTime;
  return a.title.localeCompare(b.title);
}

export function formatCalendarTime(hour?: number, minute?: number): string | null {
  if (hour === undefined) return null;

  const isPm = hour >= 12;
  let h = hour % 12;
  if (h === 0) h = 12;
  const min = minute ?? 0;
  const suffix = isPm ? "pm" : "am";

  if (min > 0) {
    return `${h}.${String(min).padStart(2, "0")}${suffix}`;
  }
  return `${h}${suffix}`;
}

export function groupCalendarItemsByDate(
  items: CalendarItem[]
): Map<string, CalendarItem[]> {
  const map = new Map<string, CalendarItem[]>();

  for (const item of items) {
    const key = toDateKey(item.date);
    const existing = map.get(key) ?? [];
    existing.push(item);
    map.set(key, existing);
  }

  for (const [key, dayItems] of map) {
    dayItems.sort(compareCalendarItemsByTime);
    map.set(key, dayItems);
  }

  return map;
}

export function getMonthGridCells(year: number, month: number): (Date | null)[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const cells: (Date | null)[] = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(startOfDay(new Date(year, month, day)));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export function getMonthWeeks(year: number, month: number): Date[][] {
  const cells = getMonthGridCells(year, month);
  const weeks: Date[][] = [];

  for (let i = 0; i < cells.length; i += 7) {
    const week = cells
      .slice(i, i + 7)
      .filter((d): d is Date => d !== null);
    if (week.length > 0) weeks.push(week);
  }

  return weeks;
}

export function getWeekIndexForDate(weeks: Date[][], date: Date): number {
  const key = toDateKey(date);
  const index = weeks.findIndex((week) =>
    week.some((d) => toDateKey(d) === key)
  );
  return index >= 0 ? index : 0;
}

export function formatWeekRange(week: Date[]): string {
  if (week.length === 0) return "";
  const start = week[0];
  const end = week[week.length - 1];
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startStr = start.toLocaleDateString("en-US", opts);
  if (start.getTime() === end.getTime()) return startStr;
  const endStr =
    start.getMonth() === end.getMonth()
      ? end.toLocaleDateString("en-US", { day: "numeric" })
      : end.toLocaleDateString("en-US", opts);
  return `${startStr} – ${endStr}`;
}
