const lines = {
  home: "M3 10.5 12 3l9 7.5 M5 9v12h5v-7h4v7h5V9",
  week: "M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3z M12 6v15",
  events: "M4 6h16v15H4z M4 10h16 M8 3v5 M16 3v5 M8 14h2 M14 14h2",
  services: "M3 21h18 M5 21V11l7-5 7 5v10 M10 21v-6h4v6 M12 2v4 M10 4h4",
  schedule: "M6 3h12v18l-6-4-6 4z",
  arrow: "M4 12h15m-6-6 6 6-6 6",
  chevron: "m9 5 7 7-7 7",
  down: "m6 9 6 6 6-6",
  pin: "M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0z M14 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0",
  clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 6v6l4 2",
  person:
    "M15.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0 M5 21v-2a7 7 0 0 1 14 0v2",
  cross: "M12 3v18 M5 9h14",
  sun: "M2 18h20 M5 15a7 7 0 0 1 14 0 M12 2v3 M3 6l2 2 M21 6l-2 2 M2 21h20",
  group:
    "M15 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0 M6 20v-2a6 6 0 0 1 12 0v2 M3 9a3 3 0 0 1 3-3 M2 18a5 5 0 0 1 3-5",
  close: "m6 6 12 12 M18 6 6 18",
  check: "m4 12 5 5L20 6",
  video: "M3 6h12v12H3z M15 10l6-3v10l-6-3",
  reset: "M3 4v6h6 M4 10a8 8 0 1 1 1 8",
};
export type IconName = keyof typeof lines;
export function Icon({ name, size = 19 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={lines[name]} />
    </svg>
  );
}
