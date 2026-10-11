import { Metadata } from "next";
import ChampionsHQ from "@/components/leaderboard/ChampionsHQ";

export const metadata: Metadata = {
  title: "Champions HQ // Live Leaderboard | RoboVerse'26",
  description:
    "Live real-time arena leaderboard and race standings for RoboVerse '26 at MMMUT Gorakhpur.",
};

export default function LeaderboardPage() {
  return <ChampionsHQ />;
}
