"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { eventData } from "@/data/eventData";

export default function Footer() {
  const pathname = usePathname();

  // Do not render public footer on admin pages
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="w-full border-t border-white/10 bg-[#07070F] py-8 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          {/* Organization & Event */}
          <div>
            <p className="text-sm font-bold tracking-wider text-white">
              {eventData.organizer}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              MMMUT Gorakhpur • {eventData.eventName}
            </p>
          </div>

          {/* Tagline / Identity */}
          <div className="text-xs text-zinc-500">
            <span className="text-[#FF2A85] font-semibold">{eventData.eventName}</span> — {eventData.tagline}
          </div>

          {/* Social / Contact Note */}
          <div className="text-xs">
            <a
              href={`mailto:${eventData.email}`}
              className="text-zinc-400 transition-colors hover:text-[#00F0FF]"
            >
              {eventData.email}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
