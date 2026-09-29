"use client";

import { motion, useReducedMotion } from "framer-motion";
import { missions } from "@/data/missionsData";
import { ArrowRight, Target } from "lucide-react";
import Link from "next/link";

export default function RaceArena() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" as const },
    },
  };

  const getMissionTheme = (themeColor: string, isBonus?: boolean) => {
    if (isBonus) {
      return {
        cardBorder: "border-[#FF4FB3]/50 hover:border-[#FF2D8D] hover:shadow-[0_0_30px_rgba(255,45,141,0.35)]",
        diffBadge: "bg-[#FF4FB3]/20 text-[#FF4FB3] border-[#FF4FB3]/40",
      };
    }
    switch (themeColor) {
      case "pink":
        return {
          cardBorder: "border-[#FF2D8D]/30 hover:border-[#FF2D8D] hover:shadow-[0_0_25px_rgba(255,45,141,0.3)]",
          diffBadge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        };
      case "orange":
        return {
          cardBorder: "border-[#FF7A3D]/30 hover:border-[#FF7A3D] hover:shadow-[0_0_25px_rgba(255,122,61,0.3)]",
          diffBadge: "bg-[#FF7A3D]/20 text-[#FF7A3D] border-[#FF7A3D]/30",
        };
      case "cyan":
        return {
          cardBorder: "border-[#35D9FF]/30 hover:border-[#35D9FF] hover:shadow-[0_0_25px_rgba(53,217,255,0.3)]",
          diffBadge: "bg-[#35D9FF]/20 text-[#35D9FF] border-[#35D9FF]/30",
        };
      default:
        return {
          cardBorder: "border-white/20 hover:border-white/50",
          diffBadge: "bg-white/10 text-white border-white/20",
        };
    }
  };

  return (
    <section
      id="race-arena"
      className="relative z-10 w-full overflow-hidden py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7A3D]/40 bg-[#120B20]/80 px-4 py-1.5 font-mono text-xs font-bold tracking-widest text-[#FF7A3D] uppercase mb-4 shadow-[0_0_20px_rgba(255,122,61,0.25)] backdrop-blur-xl">
            <Target className="h-3.5 w-3.5 text-[#FF2D8D]" />
            <span>OPERATIONAL BRIEFING // COMPETITION MISSIONS</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white">
            MISSION{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D8D] via-[#FF7A3D] to-[#35D9FF]">
              PROTOCOL
            </span>
          </h2>

          <p className="mt-3 mx-auto max-w-2xl font-sans text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Four high-octane stages testing machine durability, pilot control, and tactical arena traversal.
          </p>
        </div>

        {/* Compact Missions Grid (Only essential circled info) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-5 md:grid-cols-2"
        >
          {missions.map((mission) => {
            const theme = getMissionTheme(mission.themeColor, mission.isBonus);
            return (
              <motion.div
                key={mission.number}
                variants={cardVariants}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-[#120B20]/80 p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.6)] ${theme.cardBorder}`}
              >
                {/* Bonus Badge Banner */}
                {mission.isBonus && (
                  <div className="absolute top-0 right-0 rounded-bl-xl border-l border-b border-[#FF4FB3]/50 bg-gradient-to-r from-[#FF2D8D] to-[#FF4FB3] px-3 py-0.5 font-mono text-[9px] font-black uppercase tracking-widest text-white shadow-[0_0_12px_rgba(255,45,141,0.6)]">
                    ★ {mission.highlightLabel || "BONUS"}
                  </div>
                )}

                <div>
                  {/* Top Bar: Number, Codename & Difficulty Badge */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-2xl sm:text-3xl font-black tracking-tight text-white">
                        {mission.number}
                      </span>
                      <span className="h-3.5 w-[1px] bg-white/20" />
                      <span className="font-mono text-xs font-black tracking-widest text-zinc-300 uppercase">
                        {mission.codeName}
                      </span>
                    </div>

                    <div
                      className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-black tracking-wider uppercase ${theme.diffBadge}`}
                    >
                      {mission.difficulty}
                    </div>
                  </div>

                  {/* Mission Title & Description */}
                  <div className="mt-4 space-y-1.5">
                    <h3 className="font-mono text-lg sm:text-xl font-black uppercase tracking-wide text-white group-hover:text-[#FFE8C7] transition-colors">
                      {mission.title}
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-zinc-300 leading-relaxed">
                      {mission.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-5 flex items-center justify-end border-t border-white/10 pt-3">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#35D9FF]/40 bg-[#35D9FF]/10 px-3.5 py-1.5 font-mono text-xs font-black tracking-wider text-[#35D9FF] hover:bg-[#35D9FF]/20 hover:text-white transition-all uppercase"
                  >
                    <span>JOIN MISSION</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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
