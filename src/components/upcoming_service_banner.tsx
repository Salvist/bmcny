"use client";

import { useState, useEffect } from "react";

export default function UpcomingServiceBanner() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextSunday = new Date();

      // Find next Sunday
      const daysUntilSunday = (7 - now.getDay()) % 7;
      const isCurrentlySunday = now.getDay() === 0;
      const isSundayPast6PM = isCurrentlySunday && now.getHours() >= 18;

      if (daysUntilSunday === 0 && !isSundayPast6PM) {
        // Today is Sunday and it's before 6PM
        nextSunday.setHours(18, 0, 0, 0);
      } else {
        // Set to next Sunday
        const daysToAdd = daysUntilSunday === 0 ? 7 : daysUntilSunday;
        nextSunday.setDate(now.getDate() + daysToAdd);
        nextSunday.setHours(18, 0, 0, 0);
      }

      const difference = nextSunday.getTime() - now.getTime();

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
        setTimeLeft("Service starting soon!");
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-black text-white px-4 py-2 mt-16 text-xs">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="flex">
          <span className="text-xs">Upcoming Service:</span>
          <span className="ml-1 font-bold">Sunday Service</span>
        </div>
        <div className="flex items-center">
          <span className="text-xs mr-1">Starts in:</span>
          <span className="font-bold text-yellow-400">{timeLeft}</span>
        </div>
      </div>
    </section>
  );
}
