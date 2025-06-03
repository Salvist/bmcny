import SundayServicesSection from "@/components/sunday_services_section";
import WeeklyServices from "@/components/weekly_services";
import {
  ClockIcon,
  MapIcon,
  MapPinIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="relative bg-amber-50 px-4 py-48 text-black text-center flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/cross_on_top.webp')] bg-cover bg-bottom" />
        <div className="absolute inset-0 bg-amber-50/70" />
        <div className="relative z-10 w-full flex flex-col items-center justify-center">
          <p className="text-3xl font-bold">Welcome to</p>
          <h1 className="text-4xl font-bold">Bethany Miracle Center</h1>
          <p className="text-2xl font-bold">New York</p>
          <p className="mt-8 text-lg">
            An Indonesian community church filled with loving members of Christ.
          </p>
        </div>
      </section>
      <SundayServicesSection />
      <WeeklyServices />
      <section className="bg-lime-100 h-96">
        <p className=""></p>
      </section>
    </main>
  );
}
