"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const destinations = [
  { href: "/serving", label: "My serving" },
  { href: "/serving/rosters", label: "Rosters" },
  { href: "/serving/team", label: "Team" },
] as const;

export function ServingNavigation() {
  const pathname = usePathname();
  const department = useSearchParams().get("department");
  const query = department ? "?department=" + encodeURIComponent(department) : "";
  return (
    <nav className="service-switch serving-tabs" aria-label="Serving views">
      {destinations.map(({ href, label }) => {
        const active = href === "/serving" ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href + query} aria-current={active ? "page" : undefined}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
