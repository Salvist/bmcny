import {
  ClockIcon,
  MapPinIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

export default function WeeklyServices() {
  return (
    <section className="bg-orange-100 px-4 py-8 text-black">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 md:items-center">
        <div className="order-2 md:order-1">
          <h2 className="text-4xl font-bold text-orange-700 font-montserrat">
            WEEKLY SERVICES
          </h2>
          <span className="font-merriweather italic">
            Looking for more? We have other daily & weekly services!
          </span>
          <div className="flex flex-col">
            <p className="mt-4 text-2xl text-orange-700 font-bold font-montserrat">
              Morning Prayer
            </p>
            <span>Every Monday - Saturday at 5:30AM (EST)</span>
            <span>Live on Zoom</span>
            <span>Meeting ID: 845 4558 5721</span>
            <span>Password: 123456???</span>
          </div>
          <div className="flex flex-col">
            <p className="mt-4 text-2xl text-orange-700 font-bold font-montserrat">
              Worship From Home
            </p>
            <span>Every Thursday at 8PM (EST)</span>
            <span>Live on Zoom</span>
            <span>Meeting ID: 845 4558 5721</span>
            <span>Password: 123456???</span>
          </div>
        </div>
        <div className="order-1 md:order-2 relative w-full md:w-1/2 md:aspect-square aspect-video rounded-2xl overflow-hidden">
          <Image
            src="/bible_study.webp"
            alt="Worship Crowd"
            fill
            objectFit="cover"
          />
        </div>
      </div>
    </section>
  );
}
