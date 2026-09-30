import { Metadata } from "next";
import RegisterClosedView from "@/components/registration/RegisterClosedView";

export const metadata: Metadata = {
  title: "REGISTRATION CLOSED // ROBOVERSE '26 — Arena Grid Sealed",
  description:
    "Registration for RoboVerse '26 at IEEE Student Branch MMMUT Gorakhpur has closed. 16 combat syndicates locked in the arena.",
};

export default function RegisterPage() {
  return <RegisterClosedView />;
}
