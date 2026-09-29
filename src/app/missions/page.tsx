import { Metadata } from "next";
import RaceArena from "@/components/missions/RaceArena";

export const metadata: Metadata = {
  title: "Missions // Rampage Arena | RoboVerse '26",
  description: "Official robotics tournament missions, endurance challenges, ramp navigation, and Robosoccer arena for RoboVerse '26.",
};

export default function MissionsPage() {
  return (
    <div className="flex w-full flex-col pt-8">
      <RaceArena />
    </div>
  );
}
