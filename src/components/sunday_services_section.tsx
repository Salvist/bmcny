import {
    ClockIcon,
    MapPinIcon,
    MegaphoneIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

export default function SundayServicesSection() {
    return (
        <div className="flex justify-center">
            <section className="max-w-4xl text-white py-8">
                <div className="flex flex-row gap-8 items-center justify-center">
                    <div className="relative w-2xl aspect-square rounded-2xl overflow-hidden">
                        <Image
                            src="/worship_crowd.webp"
                            alt="Worship Service"
                            fill
                            objectFit="cover"
                        />
                    </div>
                    <div className="bg-orange-600 aspect-square px-6 py-6 rounded-2xl flex flex-col gap-2 justify-center">
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
                        <div className="mt-4 flex flex-col gap-2">
                            <p className="text-2xl underline">On-site</p>
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
                    </div>
                </div>
            </section>
        </div>
    );
}
