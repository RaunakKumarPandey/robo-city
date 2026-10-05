"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { eventData } from "@/data/eventData";
import { Shield } from "lucide-react";
import VisitorCounter from "@/components/VisitorCounter";

export default function Footer() {
  const pathname = usePathname();

  // Do not render public footer on admin pages
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    return null;
  }

  return (
    <footer className="relative z-10 w-full border-t border-[#FF2D8D]/20 bg-[#08070D]/95 py-10 text-zinc-400 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          {/* Organization & Event */}
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-mono text-sm font-black tracking-widest text-white uppercase">
                ROBO CITY // ROBOVERSE &apos;26
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#35D9FF] shadow-[0_0_6px_#35D9FF]" />
            </div>
            <p className="text-xs text-zinc-400">
              Organized by <strong className="text-zinc-200">{eventData.organizer}</strong> • MMMUT Gorakhpur
            </p>
          </div>

          {/* Tagline */}
          <div className="font-mono text-xs text-zinc-400">
            <span className="text-[#FF2D8D] font-black">ROBO CITY</span> — THE CITY NEVER SLEEPS. NEITHER DO THE BOTS.
          </div>

          {/* Social / Contact & Admin Portal */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
            <Link
              href="/team"
              className="inline-flex items-center gap-1 rounded-lg border border-[#35D9FF]/40 bg-[#35D9FF]/10 px-3 py-1.5 text-[11px] font-bold text-[#35D9FF] hover:bg-[#35D9FF]/20 hover:text-white transition-colors"
            >
              <span>ORGANISING TEAM</span>
            </Link>
            <a
              href={`mailto:${eventData.email}`}
              className="text-zinc-400 transition-colors hover:text-[#35D9FF]"
            >
              {eventData.email}
            </a>
            <span className="text-zinc-700">•</span>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#FF2D8D]/40 bg-[#120B20] px-3 py-1.5 text-[11px] font-bold text-zinc-300 hover:border-[#35D9FF] hover:text-[#35D9FF] hover:bg-[#35D9FF]/10 transition-colors"
            >
              <Shield className="h-3 w-3 text-[#FF2D8D]" />
              <span>ADMIN PORTAL</span>
            </Link>
          </div>
        </div>

        {/* Bottom Sub-Strip */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between border-t border-white/5 pt-4 text-[10px] font-mono text-zinc-500 gap-3">
          <span>GPS COORDINATES: 26.7323° N, 83.4332° E // GORAKHPUR HUB</span>
          <VisitorCounter />
          <span>IEEE-SB MMMUT © 2026 // ALL ARENA PROTOCOLS ACTIVE</span>
        </div>
      </div>
    </footer>
  );
}
