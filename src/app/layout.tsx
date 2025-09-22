import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Analytics } from "@vercel/analytics/next";

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
  icons: "/favicon.ico",
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
  authors: [{ name: "Richie Budijono", url: "https://richiebudijono.com" }],
  creator: "Richie Budijono",
  publisher: "Richie Budijono",
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
        <Analytics />
      </body>
    </html>
  );
}
