import Link from "next/link";

const destinations = [
  { path: "services", label: "Services" },
  { path: "events", label: "Events" },
] as const;

export function ServicesNavigation({ active }: { active: "services" | "events" }) {
  return (
    <nav className="service-switch" aria-label="Services views">
      {destinations.map(({ path, label }) => (
        <Link key={path} href={`/${path}`} aria-current={active === path ? "page" : undefined}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
