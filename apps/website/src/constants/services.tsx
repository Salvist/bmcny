export interface ServiceData {
  name: string;
  description?: string;
  meetingType: "on-site" | "online";
  zoomMeetingId?: string;
  zoomMeetingPassword?: string;
  time?: string;
  frequency?: string;
  address?: string;
  note?: string;
  showLocationButton?: boolean;
}

// Church Services Data
export const services: ServiceData[] = [
  {
    name: "Sunday Service On-site",
    description: "Main Sunday service held in person at the church",
    meetingType: "on-site",
    time: "6PM (EST)",
    frequency: "Every Sunday",
    address: "92-14 63rd Dr, Rego Park, NY 11374",
    note: "English translation is available upon request.",
    showLocationButton: true,
  },
  {
    name: "Sunday Service Online",
    description: "Sunday service broadcast live on Zoom",
    meetingType: "online",
    time: "10AM (EST)",
    frequency: "Every Sunday",
    zoomMeetingId: "845 4558 5721",
    zoomMeetingPassword: "BMCNY",
  },
  {
    name: "Kids Church",
    description: "Children's service for ages 3-12 years old in English",
    meetingType: "on-site",
    time: "6PM (EST)",
    frequency: "Every Sunday",
    address: "92-14 63rd Dr, Rego Park, NY 11374",
    note: "Service is available for children aged 3-12 years old and in English.",
    showLocationButton: true,
  },
  {
    name: "BMC Youth",
    description: "Youth service for teenagers aged 13-18 years old in English",
    meetingType: "on-site",
    time: "6PM (EST)",
    frequency: "Every Sunday",
    address: "92-14 63rd Dr, Rego Park, NY 11374",
    note: "Service is available for teenagers aged 13-18 years old and in English.",
    showLocationButton: true,
  },
  {
    name: "Morning Prayer",
    description: "Daily morning prayer service",
    meetingType: "online",
    time: "5:30AM (EST)",
    frequency: "Monday - Saturday",
    zoomMeetingId: "845 4558 5721",
    zoomMeetingPassword: "BMCNY",
  },
  {
    name: "Worship From Home",
    description: "Thursday evening worship service",
    meetingType: "online",
    time: "8PM (EST)",
    frequency: "Every Thursday",
    zoomMeetingId: "845 4558 5721",
    zoomMeetingPassword: "BMCNY",
  },
];
