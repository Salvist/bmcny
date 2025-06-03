import {
  ClockIcon,
  MapPinIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

export default function WeeklyServices() {
  return (
    <section className="bg-orange-600 px-4 py-16 text-white">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 md:items-center">
        <div className="order-2 md:order-1">
          <p className="text-4xl font-bold">Weekly Services</p>
          <span>Looking for more? We have other daily & weekly services!</span>
          <div className="flex flex-col gap-2">
            <p className="mt-4 text-2xl underline">Morning Prayer</p>
            <div className="flex">
              <ClockIcon className="size-6 mr-2" />
              <span>Day & Time: Every Monday - Saturday at 5.30AM (EST)</span>
            </div>
            <div className="flex">
              <MapPinIcon className="size-6 mr-2" />
              <span>Location: Live on Zoom & YouTube</span>
            </div>
            <div className="flex">
              <MegaphoneIcon className="size-6 mr-2" />
              <span>Meeting ID: 845 4558 5721</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="mt-4 text-2xl underline">Worship From Home</p>
            <div className="flex">
              <ClockIcon className="size-6 mr-2" />
              <span>Day & Time: Every Thursday at 8PM (EST)</span>
            </div>
            <div className="flex">
              <MapPinIcon className="size-6 mr-2" />
              <span>Location: Live on Zoom</span>
            </div>
            <div className="flex">
              <MegaphoneIcon className="size-6 mr-2" />
              <span>Meeting ID: 845 4558 5721</span>
            </div>
          </div>
        </div>
        <div className="order-1 md:order-2 relative w-full md:w-1/2 aspect-square rounded-2xl overflow-hidden">
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
