"use client";

import { CalendarItem, toDateKey } from "@/lib/schedule";
import { CalendarItemTile } from "./calendar_item_tile";

const MAX_VISIBLE_ITEMS = 4;
const CELL_MIN_HEIGHT = "min-h-[6.5rem]";
const CELL_BORDER =
  "border-r border-b border-orange-200 [&:nth-child(7n)]:border-r-0";

interface CalendarGridProps {
  cells: (Date | null)[];
  itemsByDate: Map<string, CalendarItem[]>;
  todayKey: string;
  weekdayLabels: string[];
  onDayClick: (date: Date, items: CalendarItem[]) => void;
  dayAriaLabel: (date: Date, count: number) => string;
}

function DayCellContent({
  date,
  dayItems,
  isToday,
}: {
  date: Date;
  dayItems: CalendarItem[];
  isToday: boolean;
}) {
  const visibleItems = dayItems.slice(0, MAX_VISIBLE_ITEMS);
  const hiddenCount = dayItems.length - visibleItems.length;

  return (
    <>
      <span
        className={`text-sm font-semibold shrink-0 ${isToday ? "text-orange-700" : "text-gray-900"}`}
      >
        {date.getDate()}
      </span>
      {dayItems.length > 0 && (
        <div className="mt-1 flex flex-col gap-1 min-w-0 flex-1">
          {visibleItems.map((item) => (
            <CalendarItemTile key={item.id} item={item} size="sm" />
          ))}
          {hiddenCount > 0 && (
            <p className="text-[10px] text-gray-500 px-0.5">+{hiddenCount} more</p>
          )}
        </div>
      )}
    </>
  );
}

export default function CalendarGrid({
  cells,
  itemsByDate,
  todayKey,
  weekdayLabels,
  onDayClick,
  dayAriaLabel,
}: CalendarGridProps) {
  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-orange-200">
      <div
        className="grid grid-cols-7 [&>*:nth-last-child(-n+7)]:border-b-0"
        role="grid"
      >
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className={`${CELL_BORDER} text-center text-xs font-semibold text-orange-700 py-2 bg-orange-50/60`}
          >
            {label}
          </div>
        ))}
        {cells.map((date, index) => {
          if (!date) {
            return (
              <div
                key={`empty-${index}`}
                className={`${CELL_MIN_HEIGHT} ${CELL_BORDER} bg-gray-50/40`}
                aria-hidden="true"
              />
            );
          }

          const key = toDateKey(date);
          const dayItems = itemsByDate.get(key) ?? [];
          const isToday = key === todayKey;
          const hasItems = dayItems.length > 0;

          const cellClassName = [
            CELL_MIN_HEIGHT,
            CELL_BORDER,
            "p-1.5 flex flex-col text-left transition-colors",
            isToday ? "ring-2 ring-inset ring-orange-500 z-[1]" : "",
            hasItems
              ? "bg-orange-50 hover:bg-orange-100 cursor-pointer"
              : "bg-white",
          ].join(" ");

          const content = (
            <DayCellContent date={date} dayItems={dayItems} isToday={isToday} />
          );

          if (hasItems) {
            return (
              <button
                key={key}
                type="button"
                className={cellClassName}
                onClick={() => onDayClick(date, dayItems)}
                aria-label={dayAriaLabel(date, dayItems.length)}
              >
                {content}
              </button>
            );
          }

          return (
            <div key={key} className={cellClassName} aria-label={dayAriaLabel(date, 0)}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
