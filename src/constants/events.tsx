export interface EventData {
  name: string;
  location: string;
  startDate?: Date; // Actual event start date
  endDate?: Date; // Actual event end date
  displayStartDate: Date; // When to start showing the event
  displayEndDate: Date; // When to stop showing the event
  imagePath: string;
}

export const events: EventData[] = [
  {
    name: "BMC Passover & 18th Anniversary",
    location: "92-14 63rd Dr, Rego Park, NY 11374",
    startDate: new Date("2026-04-05"), // Actual event start date
    endDate: new Date("2026-04-05"), // Actual event end date
    displayStartDate: new Date("2026-03-05"), // Start showing this event on Jan 1, 2025
    displayEndDate: new Date("2026-04-05"), // Stop showing this event on Nov 30, 2025
    imagePath: "/bmc-passover-18th-anniversary.webp",
  },
  {
    name: "Impactful Life",
    location: "Holiday Inn, Ocean City, Maryland",
    startDate: new Date("2025-11-27"), // Actual event start date
    endDate: new Date("2025-11-29"), // Actual event end date
    displayStartDate: new Date("2025-09-01"), // Start showing this event on Jan 1, 2025
    displayEndDate: new Date("2025-11-29"), // Stop showing this event on Nov 30, 2025
    imagePath: "/impactful-life-retreat.jpg",
  },
];
