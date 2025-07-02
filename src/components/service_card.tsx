import LocationButton from "./ui/buttons/location_button";

interface ServiceCardProps {
  title: string;
  content: string[];
  showLocationButton?: boolean;
  note?: string;
}

export default function ServiceCard({
  title,
  content,
  showLocationButton = false,
  note,
}: ServiceCardProps) {
  return (
    <div className="bg-orange-100 rounded-xl text-black px-6 py-4 gap-1 flex flex-col items-start">
      <h3 className="text-xl font-bold text-orange-700 font-montserrat">
        {title}
      </h3>
      {showLocationButton && <LocationButton />}
      {content.map((item, index) => (
        <p key={index}>{item}</p>
      ))}
      {note && <p className="text-xs mt-2">{note}</p>}
    </div>
  );
}
