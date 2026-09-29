"use client";

import { motion, useReducedMotion } from "framer-motion";
import { missions } from "@/data/missionsData";
import { Flag, Zap, ShieldAlert, Trophy, ArrowRight, Flame, Target, Crosshair } from "lucide-react";
import Link from "next/link";

export default function RaceArena() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  const getMissionTheme = (themeColor: string, isBonus?: boolean) => {
    if (isBonus) {
      return {
        cardBorder: "border-[#FF4FB3]/50 hover:border-[#FF2D8D] hover:shadow-[0_0_35px_rgba(255,45,141,0.4)]",
        badge: "bg-gradient-to-r from-[#120B20] to-[#FF2D8D]/25 text-[#FF4FB3] border-[#FF2D8D]/50",
        numberColor: "text-transparent bg-clip-text bg-gradient-to-r from-[#FF4FB3] to-[#FF2D8D]",
        iconBg: "bg-[#FF4FB3]/15 text-[#FF4FB3]",
        nodeDot: "bg-[#FF4FB3]",
        diffBadge: "bg-[#FF4FB3]/20 text-[#FF4FB3] border-[#FF4FB3]/40",
      };
    }
    switch (themeColor) {
      case "pink":
        return {
          cardBorder: "border-[#FF2D8D]/30 hover:border-[#FF2D8D] hover:shadow-[0_0_30px_rgba(255,45,141,0.35)]",
          badge: "bg-[#FF2D8D]/15 text-[#FF4FB3] border-[#FF2D8D]/40",
          numberColor: "text-[#FF2D8D]",
          iconBg: "bg-[#FF2D8D]/15 text-[#FF4FB3]",
          nodeDot: "bg-[#FF2D8D]",
          diffBadge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        };
      case "orange":
        return {
          cardBorder: "border-[#FF7A3D]/30 hover:border-[#FF7A3D] hover:shadow-[0_0_30px_rgba(255,122,61,0.35)]",
          badge: "bg-[#FF7A3D]/15 text-[#FF7A3D] border-[#FF7A3D]/40",
          numberColor: "text-[#FF7A3D]",
          iconBg: "bg-[#FF7A3D]/15 text-[#FF7A3D]",
          nodeDot: "bg-[#FF7A3D]",
          diffBadge: "bg-[#FF7A3D]/20 text-[#FF7A3D] border-[#FF7A3D]/30",
        };
      case "cyan":
        return {
          cardBorder: "border-[#35D9FF]/30 hover:border-[#35D9FF] hover:shadow-[0_0_30px_rgba(53,217,255,0.35)]",
          badge: "bg-[#35D9FF]/15 text-[#35D9FF] border-[#35D9FF]/40",
          numberColor: "text-[#35D9FF]",
          iconBg: "bg-[#35D9FF]/15 text-[#35D9FF]",
          nodeDot: "bg-[#35D9FF]",
          diffBadge: "bg-[#35D9FF]/20 text-[#35D9FF] border-[#35D9FF]/30",
        };
      default:
        return {
          cardBorder: "border-white/20 hover:border-white/50",
          badge: "bg-white/10 text-white border-white/20",
          numberColor: "text-white",
          iconBg: "bg-white/10 text-white",
          nodeDot: "bg-white",
          diffBadge: "bg-white/10 text-white border-white/20",
        };
    }
  };

  return (
    <section
      id="race-arena"
      className="relative z-10 w-full overflow-hidden py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7A3D]/40 bg-[#120B20]/80 px-4 py-1.5 font-mono text-xs font-bold tracking-widest text-[#FF7A3D] uppercase mb-4 shadow-[0_0_20px_rgba(255,122,61,0.25)] backdrop-blur-xl">
            <Target className="h-3.5 w-3.5 text-[#FF2D8D]" />
            <span>OPERATIONAL BRIEFING // COMPETITION MISSIONS</span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white">
            MISSION{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D8D] via-[#FF7A3D] to-[#35D9FF]">
              PROTOCOL
            </span>
          </h2>

          <p className="mt-4 mx-auto max-w-2xl font-sans text-sm sm:text-base text-zinc-300 leading-relaxed">
            Four high-octane stages. Each mission tests machine durability, pilot reaction speeds, and tactical obstacle navigation.
          </p>
        </div>

        {/* Missions Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {missions.map((mission) => {
            const theme = getMissionTheme(mission.themeColor, mission.isBonus);
            return (
              <motion.div
                key={mission.number}
                variants={cardVariants}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-[#120B20]/85 p-6 sm:p-8 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 shadow-[0_15px_40px_rgba(0,0,0,0.7)] ${theme.cardBorder}`}
              >
                {/* Bonus Badge Banner */}
                {mission.isBonus && (
                  <div className="absolute top-0 right-0 rounded-bl-xl border-l border-b border-[#FF4FB3]/50 bg-gradient-to-r from-[#FF2D8D] to-[#FF4FB3] px-3.5 py-1 font-mono text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_15px_rgba(255,45,141,0.6)]">
                    ★ {mission.highlightLabel || "BONUS HEIST"}
                  </div>
                )}

                <div>
                  {/* Top Bar: Number & Difficulty */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-white">
                        {mission.number}
                      </span>
                      <span className="h-4 w-[1px] bg-white/20" />
                      <span className="font-mono text-xs font-black tracking-widest text-zinc-300 uppercase">
                        {mission.codeName}
                      </span>
                    </div>

                    <div className={`rounded-full border px-3 py-0.5 font-mono text-[10px] font-black tracking-wider uppercase ${theme.diffBadge}`}>
                      {mission.difficulty}
                    </div>
                  </div>

                  {/* Mission Title & Tagline */}
                  <div className="mt-5 space-y-2">
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white group-hover:text-white">
                      {mission.title}
                    </h3>
                    {mission.tagline && (
                      <p className="font-mono text-xs font-black text-[#FFE8C7] drop-shadow-[0_0_8px_rgba(255,232,199,0.5)]">
                        {mission.tagline}
                      </p>
                    )}
                    <p className="font-sans text-xs sm:text-sm text-zinc-300 leading-relaxed pt-1">
                      {mission.description}
                    </p>
                  </div>

                  {/* Mission Specifications Strip */}
                  <div className="mt-6 rounded-xl border border-white/10 bg-[#08070D]/70 p-3.5 space-y-1.5">
                    <div className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      MISSION TELEMETRY SPECS
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-xs text-zinc-300">
                      {mission.specs.map((spec, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-[#35D9FF]" />
                          <span className="truncate">{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="font-mono text-xs font-bold text-zinc-400 uppercase">
                    STATUS: READY FOR DEPLOYMENT
                  </span>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1.5 font-mono text-xs font-black tracking-wider text-[#35D9FF] hover:text-white group-hover:translate-x-1 transition-all uppercase"
                  >
                    <span>JOIN MISSION</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
