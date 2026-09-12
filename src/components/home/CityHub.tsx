import { cityLocations } from "@/data/cityLocations";
import CityLocationCard from "./CityLocationCard";
import { Compass, MapPin } from "lucide-react";

export default function CityHub() {
  return (
    <section
      id="city-hub"
      className="relative z-10 w-full overflow-hidden border-t border-white/10 bg-[#07070F] py-20 px-4 sm:px-6 lg:px-8"
    >
      {/* 1. 2D INTERACTIVE CYBER MAP BACKGROUND (Pure CSS & SVG) */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
        {/* Subtle Map Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

        {/* Diagonal Transit / Map Highway Rays */}
        <svg
          className="absolute inset-0 h-full w-full stroke-white/10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="0" y1="20%" x2="100%" y2="50%" stroke="rgba(255,42,133,0.15)" strokeWidth="1.5" strokeDasharray="6 6" />
          <line x1="0" y1="80%" x2="100%" y2="40%" stroke="rgba(0,240,255,0.15)" strokeWidth="1.5" strokeDasharray="8 8" />
          <line x1="30%" y1="0" x2="70%" y2="100%" stroke="rgba(138,43,226,0.15)" strokeWidth="1.5" strokeDasharray="4 4" />
          {/* Map Node Dots */}
          <circle cx="20%" cy="30%" r="4" fill="#FF2A85" opacity="0.6" />
          <circle cx="80%" cy="45%" r="4" fill="#00F0FF" opacity="0.6" />
          <circle cx="50%" cy="75%" r="4" fill="#FF6B35" opacity="0.6" />
        </svg>

        {/* Ambient District Glows */}
        <div className="absolute top-1/4 -left-20 h-80 w-80 rounded-full bg-[#FF2A85]/10 blur-[100px]" />
        <div className="absolute bottom-1/4 -right-20 h-80 w-80 rounded-full bg-[#00F0FF]/10 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#8A2BE2]/10 blur-[120px]" />
      </div>

      {/* 2. SECTION CONTENT */}
      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-14 text-center">
          {/* Small Label */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF2A85]/30 bg-[#FF2A85]/10 px-4 py-1 text-xs font-mono font-bold tracking-widest text-[#FF2A85] uppercase mb-4 shadow-[0_0_15px_rgba(255,42,133,0.2)]">
            <Compass className="h-3.5 w-3.5 text-[#00F0FF]" />
            <span>ROBO CITY // CITY HUB</span>
          </div>

          {/* Large Heading */}
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            CHOOSE YOUR{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A85] via-[#FF6B35] to-[#00F0FF]">
              DESTINATION
            </span>
          </h2>

          {/* Short Subtext */}
          <p className="mt-4 mx-auto max-w-2xl text-sm sm:text-base text-zinc-400 leading-relaxed">
            The city is yours. Explore every district, complete every mission, and climb the ranks.
          </p>
        </div>

        {/* 3. LOCATION NODES GRID */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {cityLocations.map((location) => (
            <CityLocationCard key={location.id} location={location} />
          ))}
        </div>
      </div>
    </section>
  );
}
