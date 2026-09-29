import { Metadata } from "next";
import GarageView from "@/components/garage/GarageView";

export const metadata: Metadata = {
  title: "The Garage // Robotics Workshops | Vice City '26",
  description: "Hands-on machine building, embedded firmware programming, and hardware tuning workshops for Robo City // Vice City '26 at IEEE Student Branch MMMUT.",
};

export default function WorkshopsPage() {
  return (
    <div className="flex w-full flex-col pt-8">
      <GarageView />
    </div>
  );
}
