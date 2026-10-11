import { Metadata } from "next";
import ChampionsHQ from "@/components/leaderboard/ChampionsHQ";

export const metadata: Metadata = {
  title: "Champions HQ // Private Preview | RoboVerse'26",
  description: "Private preview standings for RoboVerse'26.",
  robots: { index: false, follow: false },
};

export default function PrivateLeaderboardPage() {
  return <ChampionsHQ />;
}
