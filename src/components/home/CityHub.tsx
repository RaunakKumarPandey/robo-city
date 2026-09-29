"use client";

import { cityLocations } from "@/data/cityLocations";
import CityLocationCard from "./CityLocationCard";
import { Compass, MapPin, Radio, Shield, Crosshair } from "lucide-react";

export default function CityHub() {
  return (
    <section
      id="city-overview"
      className="relative z-10 w-full overflow-hidden py-24 px-4 sm:px-6 lg:px-8"
    >
      {/* SECTION CONTENT CONTAINER */}
      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-14 text-center">
          {/* HUD Category Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#35D9FF]/40 bg-[#120B20]/80 px-4 py-1.5 font-mono text-xs font-bold tracking-widest text-[#35D9FF] uppercase mb-4 shadow-[0_0_20px_rgba(53,217,255,0.25)] backdrop-blur-xl">
            <Crosshair className="h-3.5 w-3.5 text-[#FF2D8D]" />
            <span>ROBOVERSE // DISTRICT RADAR</span>
          </div>

          {/* Large Display Heading */}
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white">
            SELECT YOUR{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D8D] via-[#FF7A3D] to-[#35D9FF]">
              SECTOR
            </span>
          </h2>

          {/* Subtext */}
          <p className="mt-4 mx-auto max-w-2xl font-sans text-sm sm:text-base text-zinc-300 leading-relaxed">
            The city is alive with underground machine racing and robotics warfare. Navigate through sectors to check mission intel, live standings, workshops, and the prize vault.
          </p>
        </div>

        {/* LOCATION NODES GRID */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cityLocations.map((location) => (
            <CityLocationCard key={location.id} location={location} />
          ))}
        </div>
      </div>
    </section>
  );
}
