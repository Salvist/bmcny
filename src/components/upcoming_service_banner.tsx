"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { services, ServiceData } from "../constants/services";
import { getNextServiceTime } from "@/lib/schedule";
import { useTranslations } from "next-intl";

export default function UpcomingServiceBanner() {
  const [timeLeft, setTimeLeft] = useState("");
  const [nextService, setNextService] = useState<ServiceData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("upcomingService");

  // Function to open Google Maps with the address
  const openGoogleMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
      "_blank"
    );
  };

  useEffect(() => {
    const calculateNextService = () => {
      const now = new Date();
      let closestService: ServiceData | null = null;
      let closestTime: Date | null = null;

      // Find the next upcoming service
      services.forEach((service) => {
        const nextOccurrence = getNextServiceTime(service, now);
        if (nextOccurrence && nextOccurrence.nextTime > now) {
          if (!closestTime || nextOccurrence.nextTime < closestTime) {
            closestService = nextOccurrence.service;
            closestTime = nextOccurrence.nextTime;
          }
        }
      });

      setNextService(closestService);

      if (closestTime && closestService) {
        const difference = (closestTime as Date).getTime() - now.getTime();

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (difference % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);

          if (days > 0) {
            setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
          } else if (hours > 0) {
            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
          } else {
            setTimeLeft(`${minutes}m ${seconds}s`);
          }
        } else {
          setTimeLeft(t("serviceStartingSoon"));
        }
      } else {
        setTimeLeft(t("noUpcoming"));
      }
    };

    calculateNextService();
    const timer = setInterval(calculateNextService, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <section
        className="bg-black text-white px-4 py-2 mt-16 text-xs cursor-pointer hover:bg-gray-800 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex">
            <span className="text-xs">{t("title")}</span>
            <span className="ml-1 font-bold">
              {nextService?.name || t("noUpcoming")}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-xs mr-1">{t("startsIn")}</span>
            <span className="font-bold text-yellow-400">{timeLeft}</span>
          </div>
        </div>
      </section>

      <Dialog
        open={isOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={setIsOpen}
      >
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
            >
              <DialogTitle
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                {nextService?.name || t("serviceInformation")}
              </DialogTitle>

              <div className="mt-4 space-y-3">
                {nextService?.description && (
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {t("description")}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {nextService.description}
                    </p>
                  </div>
                )}

                {nextService?.time && (
                  <div>
                    <h4 className="font-medium text-gray-900">{t("time")}</h4>
                    <p className="text-sm text-gray-600">{nextService.time}</p>
                  </div>
                )}

                {nextService?.frequency && (
                  <div>
                    <h4 className="font-medium text-gray-900">{t("every")}</h4>
                    <p className="text-sm text-gray-600">
                      {nextService.frequency}
                    </p>
                  </div>
                )}

                {nextService?.meetingType && (
                  <div>
                    <h4 className="font-medium text-gray-900">{t("type")}</h4>
                    <p className="text-sm text-gray-600 capitalize">
                      {nextService.meetingType === "on-site"
                        ? t("inPerson")
                        : t("online")}
                    </p>
                  </div>
                )}

                {nextService?.address && (
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {t("address")}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {nextService.address}
                    </p>
                    <button
                      onClick={() => openGoogleMaps(nextService.address!)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {t("openInGoogleMaps")}
                    </button>
                  </div>
                )}

                {nextService?.zoomMeetingId && (
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {t("zoomMeeting")}
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        {t("meetingId")} {nextService.zoomMeetingId}
                      </p>
                      {nextService.zoomMeetingPassword && (
                        <p>
                          {t("password")} {nextService.zoomMeetingPassword}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {nextService?.note && (
                  <div>
                    <h4 className="font-medium text-gray-900">{t("note")}</h4>
                    <p className="text-sm text-gray-600">{nextService.note}</p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => setIsOpen(false)}
                >
                  {t("close")}
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
