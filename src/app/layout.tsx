import type { Metadata, Viewport } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  variable: "--font-rajdhani",
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ROBO CITY — RoboVerse'26 | IEEE Student Branch MMMUT",
  description:
    "RoboVerse'26: GTA Vice City-inspired digital robotics festival by IEEE Student Branch, MMMUT Gorakhpur. Build your crew. Build your bot. Own the city.",
  keywords: [
    "RoboVerse",
    "RoboVerse'26",
    "ROBO CITY",
    "IEEE",
    "IEEE-SB MMMUT",
    "MMMUT Gorakhpur",
    "Robotics",
    "Competition",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07070F",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${orbitron.variable} ${rajdhani.variable} antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-[#07070F] text-zinc-100 selection:bg-[#FF2A85] selection:text-white">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
