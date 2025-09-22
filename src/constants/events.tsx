interface EventData {
  name: string;
  location: "on-site" | "online";
  date: Date;
  zoomMeetingId?: string;
  zoomMeetingPassword?: string;
  address?: string;
}
