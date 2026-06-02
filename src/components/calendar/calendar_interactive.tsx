"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { EventData } from "@/constants/events";
import CalendarGrid from "./calendar_grid";
import CalendarAgendaList from "./calendar_agenda_list";
import CalendarDayModal from "./calendar_day_modal";
import {
  CalendarItem,
  getCalendarItemsForMonth,
  getMonthGridCells,
  groupCalendarItemsByDate,
  toDateKey,
} from "@/lib/schedule";

interface CalendarInteractiveProps {
  events: EventData[];
}

export default function CalendarInteractive({
  events,
}: CalendarInteractiveProps) {
  const t = useTranslations("calendar");
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedItems, setSelectedItems] = useState<CalendarItem[]>([]);

  const todayKey = toDateKey(now);

  const { cells, itemsByDate } = useMemo(() => {
    const items = getCalendarItemsForMonth(year, month, events);
    return {
      cells: getMonthGridCells(year, month),
      itemsByDate: groupCalendarItemsByDate(items),
    };
  }, [events, year, month]);

  const monthYearLabel = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const weekdayLabels = [
    t("weekdays.sun"),
    t("weekdays.mon"),
    t("weekdays.tue"),
    t("weekdays.wed"),
    t("weekdays.thu"),
    t("weekdays.fri"),
    t("weekdays.sat"),
  ];

  const handleDayClick = (date: Date, items: CalendarItem[]) => {
    setSelectedDate(date);
    setSelectedItems(items);
    setModalOpen(true);
  };

  const dayAriaLabel = (date: Date, count: number) => {
    const formatted = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    if (count === 0) return formatted;
    return t("dayAriaLabel", { date: formatted, count });
  };

  return (
    <>
      <p className="mt-1 text-lg text-gray-700">{monthYearLabel}</p>

      <div className="mt-4 flex flex-wrap gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-orange-500" aria-hidden="true" />
          <span>{t("legendService")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-teal-600" aria-hidden="true" />
          <span>{t("legendEvent")}</span>
        </div>
      </div>

      <div className="hidden md:block">
        <CalendarGrid
          cells={cells}
          itemsByDate={itemsByDate}
          todayKey={todayKey}
          weekdayLabels={weekdayLabels}
          onDayClick={handleDayClick}
          dayAriaLabel={dayAriaLabel}
        />
      </div>

      <div className="md:hidden">
        <CalendarAgendaList
          year={year}
          month={month}
          itemsByDate={itemsByDate}
          todayKey={todayKey}
          onDayClick={handleDayClick}
          dayAriaLabel={dayAriaLabel}
        />
      </div>

      <CalendarDayModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        date={selectedDate}
        items={selectedItems}
      />
    </>
  );
}
