import HeroSection from "@/components/home/HeroSection";
import CityHub from "@/components/home/CityHub";
import CityHQ from "@/components/home/CityHQ";
import RaceArena from "@/components/missions/RaceArena";

export default function HomePage() {
  return (
    <div className="flex w-full flex-col">
      {/* 1. CINEMATIC HERO SECTION */}
      <HeroSection />

      {/* 2. ROBO CITY HUB // DISTRICT NAVIGATION */}
      <CityHub />

      {/* 3. CITY HQ // EVENT INFORMATION */}
      <CityHQ />

      {/* 4. RACE ARENA // COMPETITION MISSIONS */}
      <RaceArena />
    </div>
  );
}
