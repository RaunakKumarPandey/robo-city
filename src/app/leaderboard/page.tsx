import { Metadata } from "next";
import ChampionsHQ from "@/components/leaderboard/ChampionsHQ";

export const metadata: Metadata = {
  title: "Champions HQ // Live Leaderboard | RoboVerse'26",
  description: "Live tournament rankings, real-time round scores, and competition standings for RoboVerse'26 at IEEE Student Branch, MMMUT Gorakhpur.",
};

export default function LeaderboardPage() {
  return <ChampionsHQ />;
}
