import { Metadata } from "next";
import ContactView from "@/components/contact/ContactView";

export const metadata: Metadata = {
  title: "Communications & Dispatch // Contact Control Desk | RoboVerse'26",
  description:
    "Official inquiries and direct coordinator contacts for RoboVerse'26 by IEEE Student Branch, MMMUT Gorakhpur.",
};

export default function ContactPage() {
  return <ContactView />;
}

