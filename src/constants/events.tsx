export interface EventData {
  name: string;
  location: string;
  meetingType: "onsite" | "online";
  startDate?: Date; // Actual event start date
  endDate?: Date; // Actual event end date
  displayStartDate: Date; // When to start showing the event
  displayEndDate: Date; // When to stop showing the event
  recurrenceType: "continuous" | "weekly";
  recurrenceDays: number[];
  zoomMeetingId?: string;
  zoomPassword?: string;
  imagePath: string;
}
