import {
  ClockIcon,
  MapPinIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import LocationButton from "./ui/buttons/location_button";

export default function SundayServicesSection() {
  return (
    <section id="sunday-services" className="bg-white px-4 py-8 scroll-mt-16">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <h2 className="text-4xl font-bold text-orange-700 font-montserrat">
          SUNDAY SERVICES
        </h2>
        <p className="font-merriweather italic">
          Join our Sunday services available both on-site and online!
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-start w-full">
          <div className="bg-orange-100 rounded-xl text-black px-6 py-4 flex flex-col items-start">
            <h3 className="text-xl font-bold text-orange-700 font-montserrat">
              Sunday Service On-site
            </h3>

            <LocationButton />
            <p>Upper Floor</p>
            <p>Every Sunday at 6PM (EST)</p>
            <p className="text-xs mt-2">
              English translator is available upon request.
            </p>
          </div>
          <div className="bg-orange-100 rounded-xl text-black px-6 py-4 flex flex-col items-start">
            <h3 className="text-xl font-bold text-orange-700 font-montserrat">
              Sunday Service Online
            </h3>
            <p>Live on Zoom</p>
            <p>Meeting ID: 845 4558 5721</p>
            <p>Password: 123456???</p>
            <p>Every Sunday at 10AM (EST)</p>
          </div>
          <div className="bg-orange-100 rounded-xl text-black px-6 py-4 flex flex-col items-start">
            <h3 className="text-xl font-bold text-orange-700 font-montserrat">
              Kids Church
            </h3>
            <LocationButton />
            <p>Lower Floor</p>
            <p>Every Sunday at 6PM (EST)</p>
            <p className="text-xs mt-2">
              Service is available for children aged 3-12 years old and in
              English.
            </p>
          </div>
          <div className="bg-orange-100 rounded-xl text-black px-6 py-4 flex flex-col items-start">
            <h3 className="text-xl font-bold text-orange-700 font-montserrat">
              BMC Youth
            </h3>
            <LocationButton />
            <p>Lower Floor</p>
            <p>Every Sunday at 6PM (EST)</p>
            <p className="text-xs mt-2">
              Service is available for teenagers aged 13-18 years old and in
              English.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// export default function SundayServicesSection() {
//   return (
//     <section className="bg-white pb-16 md:py-16">
//       <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 md:items-center">
//         <div className="relative w-full md:w-1/2 aspect-square md:rounded-2xl overflow-hidden">
//           <Image
//             src="/worship_crowd.webp"
//             alt="Worship Service"
//             fill
//             objectFit="cover"
//           />
//         </div>
//         <div className="bg-orange-100 text-black mx-4 md:mx-0 md:w-1/2 md:aspect-square px-6 py-6 rounded-2xl flex flex-col gap-2 justify-center">
//           <h2 className="text-4xl font-bold text-orange-700 font-montserrat">
//             SUNDAY SERVICES
//           </h2>
//           <span>
//             Join our weekly Sunday Services available both offline and on-site!
//           </span>
//           <p className="mt-4 text-2xl">Online</p>
//           <div className="flex">
//             <ClockIcon className="size-6 mr-2" />
//             <span>Time: 10AM (EST)</span>
//           </div>
//           <div className="flex">
//             <MapPinIcon className="size-6 mr-2" />
//             <span>Location: Live on Zoom</span>
//           </div>
//           <div className="flex">
//             <MegaphoneIcon className="size-6 mr-2" />
//             <span>Meeting ID: 845 4558 5721</span>
//           </div>
//           <div className="mt-4 flex flex-col gap-2">
//             <p className="text-2xl">On-site</p>
//             <div className="flex">
//               <ClockIcon className="size-6 mr-2" />
//               <span>Time: 6PM (EST)</span>
//             </div>
//             <div className="flex">
//               <MapPinIcon className="size-6 mr-2" />
//               <span>Location: 9214 63rd Drive, Rego Park, NY, 11374</span>
//             </div>
//             <span className="text-xs">
//               Note: English translator is available upon request.
//             </span>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
