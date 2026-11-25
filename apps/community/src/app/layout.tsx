import type { Metadata } from "next";
import "./globals.css";
import CommunityApp from "@/app/components/community-app";

export const metadata: Metadata = {
  title: "BMCNY Community",
  description:
    "Explore gatherings, services, and your schedule at Bethany Miracle Center New York.",
};
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <CommunityApp>{children}</CommunityApp>
      </body>
    </html>
  );
}
