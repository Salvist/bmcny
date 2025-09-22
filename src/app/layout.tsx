import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer";
import Header from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bethany Miracle Center New York - Indonesian Christian Church in NYC",
  description:
    "Join Bethany Miracle Center (BMC NY), an Indonesian Christian church in New York City. Sunday services in Indonesian with English translation, kids ministry, youth programs, and online worship. Located in Rego Park, Queens.",
  keywords: [
    "Indonesian church New York",
    "Christian church NYC",
    "Bethany Miracle Center",
    "BMC NY",
    "Indonesian Christian community",
    "church Rego Park Queens",
    "Sunday service Indonesian",
    "kids church New York",
    "youth ministry NYC",
    "online church service",
    "Indonesian worship NYC",
  ],
  authors: [{ name: "Bethany Miracle Center New York" }],
  creator: "Bethany Miracle Center New York",
  publisher: "Bethany Miracle Center New York",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://bmcny.church"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title:
      "Bethany Miracle Center New York - Indonesian Christian Church in NYC",
    description:
      "Join our Indonesian Christian community in New York City. Sunday services, kids ministry, youth programs, and online worship available.",
    url: "https://bmcny.church",
    siteName: "Bethany Miracle Center New York",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/bethany_members.webp",
        width: 1200,
        height: 630,
        alt: "Bethany Miracle Center congregation worshiping together",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Bethany Miracle Center New York - Indonesian Christian Church in NYC",
    description:
      "Join our Indonesian Christian community in New York City. Sunday services, kids ministry, youth programs, and online worship available.",
    images: ["/bethany_members.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // verification: {
  //   google: "your-google-verification-code", // Replace with actual verification code
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
