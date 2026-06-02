"use client";

import { useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import {
  CalendarItem,
  formatWeekRange,
  getMonthWeeks,
  getWeekIndexForDate,
  toDateKey,
} from "@/lib/schedule";
import { CalendarItemTile } from "./calendar_item_tile";

interface CalendarAgendaListProps {
  year: number;
  month: number;
  itemsByDate: Map<string, CalendarItem[]>;
  todayKey: string;
  onDayClick: (date: Date, items: CalendarItem[]) => void;
  dayAriaLabel: (date: Date, count: number) => string;
}

export default function CalendarAgendaList({
  year,
  month,
  itemsByDate,
  todayKey,
  onDayClick,
  dayAriaLabel,
}: CalendarAgendaListProps) {
  const t = useTranslations("calendar");

  const weeks = useMemo(() => getMonthWeeks(year, month), [year, month]);

  const [weekIndex, setWeekIndex] = useState(() =>
    getWeekIndexForDate(weeks, new Date())
  );

  const safeWeekIndex = Math.min(weekIndex, Math.max(0, weeks.length - 1));
  const currentWeek = weeks[safeWeekIndex] ?? [];

  const weekDays = useMemo(() => {
    return currentWeek
      .map((date) => {
        const key = toDateKey(date);
        const items = itemsByDate.get(key);
        if (!items?.length) return null;
        return { key, date, items };
      })
      .filter(
        (day): day is { key: string; date: Date; items: CalendarItem[] } =>
          day !== null
      );
  }, [currentWeek, itemsByDate]);

  const canGoPrev = safeWeekIndex > 0;
  const canGoNext = safeWeekIndex < weeks.length - 1;
  const weekRangeLabel = formatWeekRange(currentWeek);

  if (weeks.length === 0) {
    return <p className="mt-6 text-sm text-gray-600">{t("agendaEmpty")}</p>;
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-orange-200 text-orange-700 hover:bg-orange-100 disabled:opacity-40 disabled:pointer-events-none"
          onClick={() => setWeekIndex((i) => i - 1)}
          disabled={!canGoPrev}
          aria-label={t("previousWeek")}
        >
          <ChevronLeftIcon className="size-5" aria-hidden="true" />
        </button>

        <p className="text-sm font-semibold text-gray-800 text-center font-montserrat">
          {weekRangeLabel}
        </p>

        <button
          type="button"
          className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-orange-200 text-orange-700 hover:bg-orange-100 disabled:opacity-40 disabled:pointer-events-none"
          onClick={() => setWeekIndex((i) => i + 1)}
          disabled={!canGoNext}
          aria-label={t("nextWeek")}
        >
          <ChevronRightIcon className="size-5" aria-hidden="true" />
        </button>
      </div>

      {weekDays.length === 0 ? (
        <p className="mt-4 text-sm text-gray-600 text-center">{t("weekEmpty")}</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3" role="list">
          {weekDays.map(({ key, date, items }) => {
            const isToday = key === todayKey;
            const dateHeader = date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });

            return (
              <article key={key} role="listitem" className="flex flex-col gap-1.5">
                <button
                  type="button"
                  className="flex flex-col gap-1.5 w-full text-left rounded-lg p-2 -mx-2 hover:bg-orange-100/80 transition-colors"
                  onClick={() => onDayClick(date, items)}
                  aria-label={dayAriaLabel(date, items.length)}
                >
                  <h3
                    className={`text-sm font-bold font-montserrat ${
                      isToday ? "text-orange-700" : "text-gray-900"
                    }`}
                  >
                    {dateHeader}
                    {isToday && (
                      <span className="ml-2 text-xs font-normal text-orange-600">
                        ({t("today")})
                      </span>
                    )}
                  </h3>
                  <div className="flex flex-col gap-1.5">
                    {items.map((item) => (
                      <CalendarItemTile key={item.id} item={item} size="md" />
                    ))}
                  </div>
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
