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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://robo-city.vercel.app"),
  title: {
    default: "ROBO CITY // ROBOVERSE '26 — IEEE Student Branch MMMUT",
    template: "%s | ROBO CITY — RoboVerse '26",
  },
  description:
    "ROBO CITY // ROBOVERSE '26: A futuristic digital robotics festival by IEEE Student Branch, MMMUT Gorakhpur. Build your crew. Build your bot. Live Leaderboard & Grand Prix Standings.",
  keywords: [
    "ROBO CITY",
    "ROBOVERSE",
    "RoboVerse'26",
    "Robo City MMMUT",
    "IEEE",
    "IEEE-SB MMMUT",
    "IEEE Student Branch MMMUT Gorakhpur",
    "MMMUT Gorakhpur",
    "Robotics Festival",
    "Robo City Leaderboard",
    "Robotics Competition",
    "Tech Fest MMMUT",
  ],
  authors: [{ name: "IEEE Student Branch, MMMUT Gorakhpur" }],
  creator: "IEEE Student Branch, MMMUT Gorakhpur",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://robo-city.vercel.app",
    title: "ROBO CITY // ROBOVERSE '26 — IEEE Student Branch MMMUT",
    description:
      "A futuristic digital robotics festival by IEEE Student Branch, MMMUT Gorakhpur. Live Leaderboard, Arena Standings, and Syndicate Registration.",
    siteName: "ROBO CITY — RoboVerse '26",
  },
  twitter: {
    card: "summary_large_image",
    title: "ROBO CITY // ROBOVERSE '26 — IEEE Student Branch MMMUT",
    description:
      "A futuristic digital robotics festival by IEEE Student Branch, MMMUT Gorakhpur. Live Leaderboard & Grand Prix Standings.",
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
