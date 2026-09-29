import { Metadata } from "next";
import CityHQ from "@/components/home/CityHQ";

export const metadata: Metadata = {
  title: "About // Robo City HQ | Vice City '26",
  description: "About Robo City // Vice City '26, organizer intelligence, tournament facts, and prize distributions by IEEE Student Branch MMMUT.",
};

export default function AboutPage() {
  return (
    <div className="flex w-full flex-col pt-8">
      <CityHQ />
    </div>
  );
}
