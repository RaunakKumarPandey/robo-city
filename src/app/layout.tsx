import type { Metadata, Viewport } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicBackground from "@/components/DynamicBackground";
import HudCursor from "@/components/HudCursor";
import PageTransition from "@/components/PageTransition";
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
  title: "ROBO CITY // VICE CITY '26 — IEEE Student Branch MMMUT",
  description:
    "ROBO CITY // VICE CITY '26: A futuristic GTA Vice City-inspired digital robotics festival by IEEE Student Branch, MMMUT Gorakhpur. Build your crew. Build your bot. Own the city.",
  keywords: [
    "ROBO CITY",
    "VICE CITY 26",
    "RoboVerse",
    "RoboVerse'26",
    "IEEE",
    "IEEE-SB MMMUT",
    "MMMUT Gorakhpur",
    "Robotics Festival",
    "Competition",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#08070D",
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
      <body className="relative flex min-h-screen flex-col bg-[#08070D] text-[#F5F5F5] selection:bg-[#FF2D8D] selection:text-white">
        {/* Dynamic Per-Route Vice City Atmospheric Background */}
        <DynamicBackground />

        {/* Desktop HUD Targeting Reticle */}
        <HudCursor />

        {/* Global HUD Navigation Bar */}
        <Navbar />

        {/* Main Content with Cinematic Route Transition */}
        <main className="relative z-10 flex flex-1 flex-col">
          <PageTransition>{children}</PageTransition>
        </main>

        {/* Global Vice City Footer */}
        <Footer />
      </body>
    </html>
  );
}
