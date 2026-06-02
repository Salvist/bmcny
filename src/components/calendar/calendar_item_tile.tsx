"use client";

import { type ReactNode } from "react";
import { CalendarItem, formatCalendarTime } from "@/lib/schedule";

type TileSize = "sm" | "md";

const sizeClasses: Record<TileSize, string> = {
  sm: "text-[10px] px-1.5 py-1",
  md: "text-sm px-2.5 py-1.5",
};

export function ItemTile({
  label,
  className,
  size = "sm",
  children,
}: {
  label: string;
  className: string;
  size?: TileSize;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded leading-snug font-medium line-clamp-2 break-words overflow-hidden ${sizeClasses[size]} ${className}`}
      title={label}
    >
      {children}
    </div>
  );
}

export function CalendarItemTile({
  item,
  size = "sm",
}: {
  item: CalendarItem;
  size?: TileSize;
}) {
  if (item.kind === "event") {
    return (
      <ItemTile
        label={item.title}
        className="bg-teal-600 text-white"
        size={size}
      >
        {item.title}
      </ItemTile>
    );
  }

  const timeStr = formatCalendarTime(item.hour, item.minute);
  const label = `${timeStr ? `${timeStr} ` : ""}${item.title}`;

  return (
    <ItemTile label={label} className="bg-orange-500 text-white" size={size}>
      {timeStr && (
        <span className="text-orange-100 lowercase">{timeStr} </span>
      )}
      {item.title}
    </ItemTile>
  );
}
