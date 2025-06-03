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
      <section className="bg-orange-600 text-white px-4 py-8">
        <div className="flex flex-col gap-2">
          <p className="text-4xl font-bold">Sunday Services</p>
          <span>
            Join our weekly Sunday Services available both offline and on-site!
          </span>
          <p className="mt-4 text-2xl underline">Online</p>
          <div className="flex">
            <ClockIcon className="size-6 mr-2" />
            <span>Time: 10AM (EST)</span>
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
        <div className="mt-4 flex flex-col gap-2">
          <p className="mt-4 text-2xl underline">On-site</p>
          <div className="flex">
            <ClockIcon className="size-6 mr-2" />
            <span>Time: 6PM (EST)</span>
          </div>
          <div className="flex">
            <MapPinIcon className="size-6 mr-2" />
            <span>Location: 9214 63rd Drive, Rego Park, NY, 11374</span>
          </div>
          <span className="text-xs">
            Note: English translator is available upon request.
          </span>
        </div>
      </section>
      <section className="bg-white text-black px-4 py-6">
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
      </section>
      <section className="bg-lime-100 h-96">
        <p className=""></p>
      </section>
    </main>
  );
}
