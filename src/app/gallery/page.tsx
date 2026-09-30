import type { Metadata } from "next";
import EventGalleryView from "@/components/gallery/EventGalleryView";

export const metadata: Metadata = {
  title: "EVENT POSTERS & GALLERY // ROBOVERSE '26 — Media Archives",
  description:
    "Official event posters, arena battle highlights, robot scrutiny snapshots, and festival media for ROBO CITY // RoboVerse '26 at IEEE Student Branch MMMUT Gorakhpur.",
};

export default function GalleryPage() {
  return <EventGalleryView />;
}
