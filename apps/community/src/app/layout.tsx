import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BMCNY Community",
  description:
    "Explore gatherings, services, and your schedule at Bethany Miracle Center New York.",
};
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
