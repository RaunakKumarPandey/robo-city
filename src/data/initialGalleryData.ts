import { EventPoster, EventGalleryImage } from "@/types/database";

export const initialEventPosters: EventPoster[] = [
  {
    id: "poster-1",
    title: "ROBOVERSE '26 // OFFICIAL FESTIVAL POSTER",
    tagline: "The City Never Sleeps. Neither Do The Bots.",
    image_url: "/images/backgrounds/bg_home.jpg",
    download_url: "/images/backgrounds/bg_home.jpg",
    category: "Official Festival Poster",
    release_date: "OCTOBER 2026",
    featured: true,
    display_order: 1,
  },
  {
    id: "poster-2",
    title: "GRAND PRIX ARENA // ₹12,000 BOUNTY BATTLE",
    tagline: "High-Octane Traversal & Combat Obstacle Course",
    image_url: "/images/backgrounds/bg_missions.jpg",
    download_url: "/images/backgrounds/bg_missions.jpg",
    category: "Arena Championship",
    release_date: "OCTOBER 2026",
    featured: true,
    display_order: 2,
  },
  {
    id: "poster-3",
    title: "THE GARAGE // ROBOTICS HARDWARE WORKSHOP",
    tagline: "Motor Drivers, Microcontrollers & Telemetry Engineering",
    image_url: "/images/backgrounds/bg_garage.jpg",
    download_url: "/images/backgrounds/bg_garage.jpg",
    category: "Hands-on Workshop",
    release_date: "OCTOBER 2026",
    featured: false,
    display_order: 3,
  },
  {
    id: "poster-4",
    title: "MOST WANTED // ARENA LEADERBOARD SHOWDOWN",
    tagline: "Clash of Champions, Live XP Telemetry & Syndicate Ranks",
    image_url: "/images/backgrounds/bg_leaderboard.png",
    download_url: "/images/backgrounds/bg_leaderboard.png",
    category: "Arena Championship",
    release_date: "OCTOBER 2026",
    featured: true,
    display_order: 4,
  },
];

// Purely user/admin-uploaded images (all 6 mock Unsplash images removed)
export const initialGalleryImages: EventGalleryImage[] = [];
