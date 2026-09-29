"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

const BG_MAP: Record<string, { image: string; tint: string; name: string }> = {
  "/": {
    image: "/images/backgrounds/bg_home.jpg",
    tint: "rgba(255, 45, 141, 0.12)",
    name: "ROBOVERSE // WATERFRONT SUNSET",
  },
  "/missions": {
    image: "/images/backgrounds/bg_missions.jpg",
    tint: "rgba(53, 217, 255, 0.15)",
    name: "DOWNTOWN SECTOR // RACE ARENA",
  },
  "/workshops": {
    image: "/images/backgrounds/bg_garage.jpg",
    tint: "rgba(255, 122, 61, 0.15)",
    name: "UNDERGROUND // THE GARAGE",
  },
  "/leaderboard": {
    image: "/images/backgrounds/bg_leaderboard.png",
    tint: "rgba(255, 79, 179, 0.15)",
    name: "OCEAN DRIVE // MOST WANTED HQ",
  },
  "/about": {
    image: "/images/backgrounds/bg_about.jpg",
    tint: "rgba(255, 45, 141, 0.15)",
    name: "VICE BAY // FESTIVAL HQ",
  },
  "/contact": {
    image: "/images/backgrounds/bg_contact.jpg",
    tint: "rgba(53, 217, 255, 0.15)",
    name: "CENTRAL DISPATCH // COMMS TOWER",
  },
  "/register": {
    image: "/images/backgrounds/bg_home.jpg",
    tint: "rgba(255, 122, 61, 0.15)",
    name: "RECRUITMENT DESK // SQUAD TERMINAL",
  },
};

export default function DynamicBackground() {
  const pathname = usePathname();

  // If admin page, use a darker dedicated console backdrop
  const isAdmin = pathname.startsWith("/admin");

  const currentBg = useMemo(() => {
    if (isAdmin) {
      return {
        image: "/images/backgrounds/bg_contact.jpg",
        tint: "rgba(18, 11, 32, 0.4)",
        name: "ADMIN COMMAND // SECURE PROTOCOL",
      };
    }
    return BG_MAP[pathname] || BG_MAP["/"];
  }, [pathname, isAdmin]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      {/* 1. Cross-fading background image scene */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBg.image}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 h-full w-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${currentBg.image})`,
            backgroundPosition: "center center",
            backgroundSize: "cover",
          }}
        />
      </AnimatePresence>

      {/* 2. Deep Vice City Contrast Overlays (Ensures razor-sharp text readability) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#08070D]/88 via-[#120B20]/82 to-[#08070D]/95 backdrop-blur-[2px]" />

      {/* 3. Dynamic Sector Color Tint Glow */}
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{
          background: `radial-gradient(circle at 50% 25%, ${currentBg.tint} 0%, transparent 60%)`,
        }}
      />

      {/* 4. GTA Cinematic Vignette */}
      <div className="vignette-overlay absolute inset-0 opacity-80" />

      {/* 5. Subtle CRT Scanlines & Film Grain */}
      <div className="scanlines bg-grain absolute inset-0 opacity-25" />

      {/* 6. Minimal HUD Sector Watermark in bottom corner */}
      <div className="hidden lg:flex absolute bottom-4 left-6 z-10 items-center gap-2 font-mono text-[10px] font-bold tracking-[0.25em] text-white/30 uppercase">
        <span className="h-1.5 w-1.5 rounded-full bg-[#FF2D8D] animate-ping" />
        <span>ZONE: {currentBg.name}</span>
      </div>
    </div>
  );
}
