import { MapPinIcon } from "@heroicons/react/24/outline";

interface LocationButtonProps {
  className?: string;
}

export default function LocationButton({ className }: LocationButtonProps) {
  return (
    <a
      href="https://maps.app.goo.gl/JWKGhHKz9nJELbUK9"
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      <div className="flex gap-1 underline">
        <span>92-14 63rd Dr, Rego Park, NY 11374</span>
      </div>
    </a>
  );
}
