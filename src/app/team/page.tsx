import type { Metadata } from "next";
import OrganizingTeamView from "@/components/team/OrganizingTeamView";

export const metadata: Metadata = {
  title: "ORGANISING TEAM // ROBOVERSE '26 — Central Command",
  description:
    "Meet the organizing committee, technical directors, and student coordinators behind ROBO CITY // RoboVerse '26 at IEEE Student Branch MMMUT Gorakhpur.",
};

export default function OrganizingTeamPage() {
  return <OrganizingTeamView />;
}
