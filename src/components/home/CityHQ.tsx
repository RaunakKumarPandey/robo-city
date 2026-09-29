"use client";

import { eventData } from "@/data/eventData";
import {
  Ticket,
  Users,
  Trophy,
  Award,
  Wrench,
  Calendar,
  Building2,
  Flame,
  Coins,
  Medal,
} from "lucide-react";
import Link from "next/link";

const intelCards = [
  {
    number: "01",
    title: "FREE SQUAD ENTRY",
    description: "Zero registration cost. Completely free entry for all engineering squads.",
    icon: Ticket,
    borderColor: "border-[#FF2D8D]/30 hover:border-[#FF2D8D] hover:shadow-[0_0_25px_rgba(255,45,141,0.3)]",
    iconBg: "bg-[#FF2D8D]/15 text-[#FF4FB3]",
    numberColor: "text-[#FF4FB3]",
  },
  {
    number: "02",
    title: "3–5 PLAYERS PER CREW",
    description: "Form your squad with 3 to 5 specialists: Pilot, Programmer, and Hardware leads.",
    icon: Users,
    borderColor: "border-[#FF7A3D]/30 hover:border-[#FF7A3D] hover:shadow-[0_0_25px_rgba(255,122,61,0.3)]",
    iconBg: "bg-[#FF7A3D]/15 text-[#FF7A3D]",
    numberColor: "text-[#FF7A3D]",
  },
  {
    number: "03",
    title: "₹12,000 TOTAL HEIST SCORE",
    description: "Substantial cash prizes, prestigious winner trophies, and podium bounties.",
    icon: Trophy,
    borderColor: "border-[#35D9FF]/30 hover:border-[#35D9FF] hover:shadow-[0_0_25px_rgba(53,217,255,0.3)]",
    iconBg: "bg-[#35D9FF]/15 text-[#35D9FF]",
    numberColor: "text-[#35D9FF]",
  },
  {
    number: "04",
    title: "CERTIFICATES & MERCH",
    description: "Official IEEE Student Branch certificates of excellence and custom tournament swag.",
    icon: Award,
    borderColor: "border-[#FF4FB3]/30 hover:border-[#FF4FB3] hover:shadow-[0_0_25px_rgba(255,79,179,0.3)]",
    iconBg: "bg-[#FF4FB3]/15 text-[#FF4FB3]",
    numberColor: "text-[#FF4FB3]",
  },
  {
    number: "05",
    title: "THE GARAGE WORKSHOPS",
    description: "Hands-on pre-tournament mechanical & embedded systems masterclasses.",
    icon: Wrench,
    borderColor: "border-[#35D9FF]/30 hover:border-[#35D9FF] hover:shadow-[0_0_25px_rgba(53,217,255,0.3)]",
    iconBg: "bg-[#35D9FF]/15 text-[#35D9FF]",
    numberColor: "text-[#35D9FF]",
  },
  {
    number: "06",
    title: "3-DAY TOURNAMENT",
    description: "Multi-round knockout racing, ramps, obstacle runs, and Robosoccer matches.",
    icon: Calendar,
    borderColor: "border-[#FF7A3D]/30 hover:border-[#FF7A3D] hover:shadow-[0_0_25px_rgba(255,122,61,0.3)]",
    iconBg: "bg-[#FF7A3D]/15 text-[#FF7A3D]",
    numberColor: "text-[#FF7A3D]",
  },
];

export default function CityHQ() {
  return (
    <section
      id="city-hq"
      className="relative z-10 w-full overflow-hidden py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="relative z-10 mx-auto max-w-7xl">
        {/* 1. SECTION HEADER: EVENT INTEL */}
        <div className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF2D8D]/40 bg-[#120B20]/80 px-4 py-1.5 font-mono text-xs font-bold tracking-widest text-[#FF4FB3] uppercase mb-4 shadow-[0_0_20px_rgba(255,45,141,0.25)] backdrop-blur-xl">
            <Building2 className="h-3.5 w-3.5 text-[#35D9FF]" />
            <span>ROBO CITY HQ // INTEL DESK</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white">
            EVENT{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D8D] via-[#FF7A3D] to-[#35D9FF]">
              INTELLIGENCE
            </span>
          </h2>

          <p className="mt-4 mx-auto max-w-2xl font-sans text-sm sm:text-base text-zinc-300 leading-relaxed">
            Robo City // RoboVerse &apos;26 is organized by <strong className="text-white">{eventData.organizer}</strong> at Madan Mohan Malaviya University of Technology, Gorakhpur.
          </p>
        </div>

        {/* 2. 6 EVENT HIGHLIGHT CARDS (COMPACT) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-24">
          {intelCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.number}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-[#120B20]/80 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 shadow-[0_8px_25px_rgba(0,0,0,0.5)] ${card.borderColor}`}
              >
                <div className="space-y-3">
                  <div
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 shadow-md ${card.iconBg}`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>

                  <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                    {card.title}
                  </h3>

                  <p className="font-sans text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. THE SCORE // PRIZE SECTION */}
        <div id="the-score" className="relative rounded-3xl border border-[#FF7A3D]/40 bg-gradient-to-b from-[#120B20]/95 via-[#08070D]/95 to-[#120B20]/95 p-8 sm:p-12 backdrop-blur-2xl shadow-[0_0_60px_rgba(255,122,61,0.25)]">
          {/* Ambient Glow in Box */}
          <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-64 w-96 rounded-full bg-gradient-to-r from-[#FF2D8D]/25 via-[#FF7A3D]/25 to-[#35D9FF]/25 blur-[90px]" />

          <div className="relative z-10 text-center max-w-4xl mx-auto">
            {/* Header */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7A3D]/40 bg-[#FF7A3D]/15 px-4 py-1.5 font-mono text-xs font-black tracking-widest text-[#FF7A3D] uppercase mb-4 shadow-[0_0_20px_rgba(255,122,61,0.3)]">
              <Coins className="h-4 w-4 text-[#FFE8C7]" />
              <span>THE SCORE // HEIST BOUNTY</span>
            </div>

            <h2 className="font-mono text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white">
              TOTAL HEIST POOL
            </h2>

            {/* Massive ₹12,000 typography */}
            <div className="my-6">
              <span className="font-mono text-6xl sm:text-8xl md:text-9xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FFE8C7] via-[#FF7A3D] to-[#FF2D8D] filter drop-shadow-[0_0_35px_rgba(255,122,61,0.6)]">
                ₹12,000
              </span>
            </div>

            <p className="font-sans text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed mb-10">
              The highest stakes in collegiate robotics. Top ranked crews take home cash bounties, champion trophies, sponsor goodies, and official IEEE certifications.
            </p>

            {/* Bounty Breakdown Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-left">
              <div className="rounded-2xl border border-[#FF2D8D]/40 bg-[#08070D]/80 p-5 shadow-[0_0_20px_rgba(255,45,141,0.2)]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black tracking-widest text-[#FF4FB3]">RANK #01</span>
                  <Trophy className="h-5 w-5 text-[#FF4FB3]" />
                </div>
                <div className="mt-3 font-mono text-xl font-black text-white">CHAMPION CREW</div>
                <p className="mt-1 text-xs text-zinc-400">Grand Cash Bounty + Winner Trophy + IEEE Official Title</p>
              </div>

              <div className="rounded-2xl border border-[#FF7A3D]/40 bg-[#08070D]/80 p-5 shadow-[0_0_20px_rgba(255,122,61,0.2)]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black tracking-widest text-[#FF7A3D]">RANK #02</span>
                  <Medal className="h-5 w-5 text-[#FF7A3D]" />
                </div>
                <div className="mt-3 font-mono text-xl font-black text-white">RUNNER-UP SQUAD</div>
                <p className="mt-1 text-xs text-zinc-400">Runner-Up Cash Bounty + Trophy + Distinction Certificate</p>
              </div>

              <div className="rounded-2xl border border-[#35D9FF]/40 bg-[#08070D]/80 p-5 shadow-[0_0_20px_rgba(53,217,255,0.2)]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black tracking-widest text-[#35D9FF]">BONUS ROUND</span>
                  <Flame className="h-5 w-5 text-[#35D9FF]" />
                </div>
                <div className="mt-3 font-mono text-xl font-black text-white">ROBOSOCCER BOUNTY</div>
                <p className="mt-1 text-xs text-zinc-400">Second-Chance Tournament Cash & Special Recognition</p>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-10">
              <Link
                href="/register"
                className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#FF2D8D] via-[#FF7A3D] to-[#35D9FF] px-8 py-4 font-mono text-sm sm:text-base font-black tracking-widest text-white shadow-[0_0_30px_rgba(255,45,141,0.5)] hover:shadow-[0_0_45px_rgba(255,45,141,0.8)] transition-all hover:scale-105 uppercase"
              >
                <span>CLAIM YOUR SHARE → REGISTER NOW</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
