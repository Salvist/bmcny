"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Image from "next/image";
import { CalendarItem } from "@/lib/schedule";
import { useTranslations } from "next-intl";

interface CalendarDayModalProps {
  open: boolean;
  onClose: () => void;
  date: Date | null;
  items: CalendarItem[];
}

function openGoogleMaps(address: string) {
  const encodedAddress = encodeURIComponent(address);
  window.open(
    `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
    "_blank"
  );
}

function formatEventDateRange(start?: Date, end?: Date): string {
  if (!start || !end) return "";
  const opts: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  };
  const startStr = start.toLocaleDateString("en-US", opts);
  if (start.getTime() === end.getTime()) return startStr;
  const endStr = end.toLocaleDateString("en-US", opts);
  return `${startStr} – ${endStr}`;
}

export default function CalendarDayModal({
  open,
  onClose,
  date,
  items,
}: CalendarDayModalProps) {
  const t = useTranslations("calendar");
  const tService = useTranslations("upcomingService");

  const formattedDate =
    date?.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }) ?? "";

  return (
    <Dialog
      open={open}
      as="div"
      className="relative z-50 focus:outline-none"
      onClose={onClose}
    >
      <div className="fixed inset-0 z-50 w-screen overflow-y-auto bg-black/40">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
          >
            <DialogTitle
              as="h3"
              className="text-lg font-bold text-orange-700 font-montserrat"
            >
              {formattedDate}
            </DialogTitle>

            <div className="mt-4 space-y-6">
              {items.map((item) =>
                item.kind === "service" && item.service ? (
                  <article
                    key={item.id}
                    className="border-l-4 border-orange-500 pl-4 space-y-2"
                  >
                    <span className="text-xs font-medium uppercase tracking-wide text-orange-600">
                      {t("serviceLabel")}
                    </span>
                    <h4 className="font-bold text-gray-900">{item.service.name}</h4>

                    {item.service.description && (
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          {tService("description")}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.service.description}
                        </p>
                      </div>
                    )}

                    {item.service.time && (
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          {tService("time")}
                        </p>
                        <p className="text-sm text-gray-600">{item.service.time}</p>
                      </div>
                    )}

                    {item.service.frequency && (
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          {tService("every")}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.service.frequency}
                        </p>
                      </div>
                    )}

                    {item.service.meetingType && (
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          {tService("type")}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">
                          {item.service.meetingType === "on-site"
                            ? tService("inPerson")
                            : tService("online")}
                        </p>
                      </div>
                    )}

                    {item.service.address && (
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          {tService("address")}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.service.address}
                        </p>
                        <button
                          type="button"
                          onClick={() => openGoogleMaps(item.service!.address!)}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          {tService("openInGoogleMaps")}
                        </button>
                      </div>
                    )}

                    {item.service.zoomMeetingId && (
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          {tService("zoomMeeting")}
                        </p>
                        <p className="text-sm text-gray-600">
                          {tService("meetingId")} {item.service.zoomMeetingId}
                        </p>
                        {item.service.zoomMeetingPassword && (
                          <p className="text-sm text-gray-600">
                            {tService("password")}{" "}
                            {item.service.zoomMeetingPassword}
                          </p>
                        )}
                      </div>
                    )}

                    {item.service.note && (
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          {tService("note")}
                        </p>
                        <p className="text-sm text-gray-600">{item.service.note}</p>
                      </div>
                    )}
                  </article>
                ) : item.kind === "event" && item.event ? (
                  <article
                    key={item.id}
                    className="border-l-4 border-teal-600 pl-4 space-y-2"
                  >
                    <span className="text-xs font-medium uppercase tracking-wide text-teal-700">
                      {t("eventLabel")}
                    </span>
                    <h4 className="font-bold text-gray-900">{item.event.name}</h4>

                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        {t("dateRange")}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatEventDateRange(
                          item.event.startDate,
                          item.event.endDate
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        {t("location")}
                      </p>
                      <p className="text-sm text-gray-600">{item.event.location}</p>
                    </div>

                    {item.event.imagePath && (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                        <Image
                          src={item.event.imagePath}
                          alt={item.event.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </article>
                ) : null
              )}
            </div>

            <div className="mt-6">
              <button
                type="button"
                className="inline-flex justify-center rounded-md bg-orange-100 px-4 py-2 text-sm font-medium text-orange-900 hover:bg-orange-200"
                onClick={onClose}
              >
                {t("close")}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
