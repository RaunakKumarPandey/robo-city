"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Lock,
  Star,
  AlertTriangle,
  Trophy,
  Camera,
  Flag,
  Users,
  PhoneCall,
  Radio,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  Zap,
} from "lucide-react";

export default function RegisterClosedView() {
  return (
    <div className="relative min-h-[85vh] w-full px-4 pt-24 pb-20 sm:px-6">
      {/* 75% Centered Content Container (Keeps cyberpunk background visible on sides) */}
      <div className="relative mx-auto w-[94%] sm:w-[90%] md:w-[85%] lg:w-[75%] max-w-5xl space-y-10">
        
        {/* ========================================================================= */}
        {/* 1. GTA DISPATCH CODE RED TELEMETRY STRIP */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-red-500/50 bg-[#14060C]/90 p-4 shadow-[0_0_35px_rgba(255,0,60,0.3)] backdrop-blur-2xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-mono">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-red-500 shadow-[0_0_10px_#FF003C]" />
              </span>
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-red-500" />
                  <span>POLICE DISPATCH // 10-99 CODE RED // GRID LOCKDOWN</span>
                </div>
                <div className="text-[10px] text-zinc-400 tracking-wider">
                  GPS: 26.7314° N, 83.4332° E // MMMUT CENTRAL COMMAND
                </div>
              </div>
            </div>

            {/* Audio Wave Visualizer Simulation */}
            <div className="flex items-center gap-1 self-end sm:self-center">
              <span className="text-[10px] font-bold text-red-400/80 mr-2">ENLISTMENT SEALED</span>
              {[4, 8, 12, 16, 10, 14, 6, 12, 8, 4].map((h, i) => (
                <span
                  key={i}
                  className="w-1 rounded-full bg-red-500/80 animate-pulse"
                  style={{
                    height: `${h}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* 2. MAIN GTA "REGISTRATION CLOSED" BUSTED / WASTED HERO BANNER */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border-2 border-red-500/60 bg-gradient-to-b from-[#1F0712]/95 via-[#0E0308]/95 to-[#060104]/98 p-8 sm:p-12 text-center backdrop-blur-2xl shadow-[0_0_60px_rgba(255,0,60,0.35)]"
        >
          {/* Background CRT Scanlines */}
          <div className="pointer-events-none absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600 via-transparent to-black" />
          
          {/* Corner HUD Ticks */}
          <div className="absolute top-3 left-3 h-3 w-3 border-t-2 border-l-2 border-red-500" />
          <div className="absolute top-3 right-3 h-3 w-3 border-t-2 border-r-2 border-red-500" />
          <div className="absolute bottom-3 left-3 h-3 w-3 border-b-2 border-l-2 border-red-500" />
          <div className="absolute bottom-3 right-3 h-3 w-3 border-b-2 border-r-2 border-red-500" />

          {/* GTA WANTED LEVEL STARS (5 STARS) */}
          <div className="mb-6 flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.div
                key={star}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 * star, type: "spring" }}
                className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-red-500/60 bg-red-500/20 text-[#FFE8C7] shadow-[0_0_15px_rgba(255,0,60,0.6)]"
              >
                <Star className="h-5 w-5 sm:h-6 sm:w-6 fill-[#FFE8C7] text-[#FFE8C7] animate-pulse" />
              </motion.div>
            ))}
          </div>

          {/* Overline Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/50 bg-red-500/15 px-4 py-1.5 font-mono text-xs font-black tracking-[0.25em] text-red-300 uppercase shadow-[0_0_20px_rgba(255,0,60,0.4)] mb-4">
            <Lock className="h-3.5 w-3.5 text-red-400" />
            <span>ROBOVERSE &apos;26 // MAXIMUM CAPACITY REACHED</span>
          </div>

          {/* MASSIVE GTA STYLE TITLE */}
          <h1 className="font-mono text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tight leading-[0.9] text-white">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF003C] via-[#FF2D8D] to-[#FF7A3D] filter drop-shadow-[0_0_35px_rgba(255,0,60,0.7)]">
              REGISTRATION
            </span>
            <span className="block text-white drop-shadow-[0_6px_25px_rgba(0,0,0,0.95)]">
              CLOSED
            </span>
          </h1>

          {/* GTA Subtitle / Punchline */}
          <p className="mt-4 font-mono text-sm sm:text-lg font-black tracking-widest text-[#FFE8C7] uppercase drop-shadow-[0_0_10px_rgba(255,232,199,0.5)]">
            LOCKDOWN INITIATED // THE COMBAT GRID IS SEALED
          </p>

          <p className="mx-auto mt-2 max-w-2xl font-mono text-xs sm:text-sm text-zinc-300 leading-relaxed">
            All syndicate squads for RoboVerse &apos;26 have been drafted and locked in the arena. No further crew enlistment requests can be processed.
          </p>
        </motion.div>

        {/* ========================================================================= */}
        {/* 3. GTA DOSSIER: MISSION STATS & ARENA INTEL */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 font-mono"
        >
          <div className="rounded-2xl border border-white/10 bg-[#120B20]/80 p-4 backdrop-blur-xl shadow-lg">
            <div className="text-[10px] font-bold text-zinc-400 uppercase">GRID STATUS</div>
            <div className="mt-1 text-sm sm:text-base font-black text-red-400 flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-red-500" />
              <span>LOCKED</span>
            </div>
            <div className="text-[9px] text-zinc-500 mt-0.5">0 SLOTS REMAINING</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#120B20]/80 p-4 backdrop-blur-xl shadow-lg">
            <div className="text-[10px] font-bold text-zinc-400 uppercase">CASH BOUNTY</div>
            <div className="mt-1 text-sm sm:text-base font-black text-[#FFE8C7] drop-shadow-[0_0_8px_rgba(255,232,199,0.4)]">
              ₹12,000 POOL
            </div>
            <div className="text-[9px] text-zinc-500 mt-0.5">HEIST PRIZE VAULT</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#120B20]/80 p-4 backdrop-blur-xl shadow-lg">
            <div className="text-[10px] font-bold text-zinc-400 uppercase">COMBAT ARENA</div>
            <div className="mt-1 text-sm sm:text-base font-black text-[#35D9FF]">
              SECTOR 02
            </div>
            <div className="text-[9px] text-zinc-500 mt-0.5">TRACK TRAVERSAL</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#120B20]/80 p-4 backdrop-blur-xl shadow-lg">
            <div className="text-[10px] font-bold text-zinc-400 uppercase">NEXT PHASE</div>
            <div className="mt-1 text-sm sm:text-base font-black text-emerald-400">
              SCRUTINY &amp; WARS
            </div>
            <div className="text-[9px] text-zinc-500 mt-0.5">OCTOBER 2026</div>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* 4. GTA ACTION HUB: EXPLORE ROBO CITY */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-400 uppercase">
            <Radio className="h-4 w-4 text-[#FF7A3D]" />
            <span>CHOOSE YOUR NEXT ACTION OPERATIVE</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1: Live Leaderboard */}
            <Link
              href="/leaderboard"
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#120B20]/85 p-5 backdrop-blur-xl transition-all duration-300 hover:border-[#35D9FF] hover:shadow-[0_0_25px_rgba(53,217,255,0.3)] hover:-translate-y-1"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#35D9FF]/20 text-[#35D9FF] mb-3">
                  <Trophy className="h-5 w-5" />
                </div>
                <h3 className="font-mono text-base font-black text-white uppercase group-hover:text-[#35D9FF] transition-colors">
                  THE MOST WANTED
                </h3>
                <p className="mt-1 font-mono text-xs text-zinc-400 leading-relaxed">
                  Track live syndicate rankings, match XP scores, and arena leaderboard broadcasts.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 font-mono text-xs font-bold text-[#35D9FF]">
                <span>VIEW LEADERBOARD</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Card 2: Media Posters & Gallery */}
            <Link
              href="/gallery"
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#120B20]/85 p-5 backdrop-blur-xl transition-all duration-300 hover:border-[#FF2D8D] hover:shadow-[0_0_25px_rgba(255,45,141,0.3)] hover:-translate-y-1"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF2D8D]/20 text-[#FF2D8D] mb-3">
                  <Camera className="h-5 w-5" />
                </div>
                <h3 className="font-mono text-base font-black text-white uppercase group-hover:text-[#FF2D8D] transition-colors">
                  POSTERS &amp; GALLERY
                </h3>
                <p className="mt-1 font-mono text-xs text-zinc-400 leading-relaxed">
                  Download official high-resolution festival posters and explore arena action snapshots.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 font-mono text-xs font-bold text-[#FF2D8D]">
                <span>EXPLORE MEDIA ARCHIVES</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Card 3: Arena Missions */}
            <Link
              href="/missions"
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#120B20]/85 p-5 backdrop-blur-xl transition-all duration-300 hover:border-[#FF7A3D] hover:shadow-[0_0_25px_rgba(255,122,61,0.3)] hover:-translate-y-1 sm:col-span-2 lg:col-span-1"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF7A3D]/20 text-[#FF7A3D] mb-3">
                  <Flag className="h-5 w-5" />
                </div>
                <h3 className="font-mono text-base font-black text-white uppercase group-hover:text-[#FF7A3D] transition-colors">
                  ARENA MISSIONS
                </h3>
                <p className="mt-1 font-mono text-xs text-zinc-400 leading-relaxed">
                  Inspect the obstacle track blueprints, scoring criteria, and Grand Prix race parameters.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 font-mono text-xs font-bold text-[#FF7A3D]">
                <span>INSPECT MISSIONS</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. ORGANISING CREW & CONTACT DISPATCH FOOTER BAR */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0E071A]/90 p-5 backdrop-blur-xl font-mono">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#35D9FF]/15 text-[#35D9FF]">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-black uppercase text-white">
                NEED ASSISTANCE OR HAVE QUERIES?
              </div>
              <div className="text-[11px] text-zinc-400">
                Contact the student coordinators at IEEE Student Branch MMMUT.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/team"
              className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              Meet Organizing Team
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#FF2D8D] to-[#FF7A3D] px-4 py-2 text-xs font-black uppercase text-white shadow-lg hover:scale-105 transition-all"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              <span>Contact Dispatch</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
