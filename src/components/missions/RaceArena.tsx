"use client";

import { motion, useReducedMotion } from "framer-motion";
import { missions } from "@/data/missionsData";
import { Flag, Zap, ShieldAlert, Trophy, ArrowRight, Flame } from "lucide-react";

export default function RaceArena() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  const getMissionTheme = (themeColor: string, isBonus?: boolean) => {
    if (isBonus) {
      return {
        cardBorder: "border-[#8A2BE2]/50 hover:border-[#FF2A85] hover:shadow-[0_0_30px_rgba(255,42,133,0.3)]",
        badge: "bg-gradient-to-r from-[#8A2BE2]/20 to-[#FF2A85]/20 text-[#FF2A85] border-[#FF2A85]/40",
        numberColor: "text-transparent bg-clip-text bg-gradient-to-r from-[#8A2BE2] to-[#FF2A85]",
        iconBg: "bg-[#8A2BE2]/15 text-[#FF2A85]",
        nodeDot: "bg-[#FF2A85]",
      };
    }
    switch (themeColor) {
      case "pink":
        return {
          cardBorder: "border-[#FF2A85]/30 hover:border-[#FF2A85] hover:shadow-[0_0_25px_rgba(255,42,133,0.25)]",
          badge: "bg-[#FF2A85]/10 text-[#FF2A85] border-[#FF2A85]/30",
          numberColor: "text-[#FF2A85]",
          iconBg: "bg-[#FF2A85]/10 text-[#FF2A85]",
          nodeDot: "bg-[#FF2A85]",
        };
      case "orange":
        return {
          cardBorder: "border-[#FF6B35]/30 hover:border-[#FF6B35] hover:shadow-[0_0_25px_rgba(255,107,53,0.25)]",
          badge: "bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/30",
          numberColor: "text-[#FF6B35]",
          iconBg: "bg-[#FF6B35]/10 text-[#FF6B35]",
          nodeDot: "bg-[#FF6B35]",
        };
      case "cyan":
        return {
          cardBorder: "border-[#00F0FF]/30 hover:border-[#00F0FF] hover:shadow-[0_0_25px_rgba(0,240,255,0.25)]",
          badge: "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30",
          numberColor: "text-[#00F0FF]",
          iconBg: "bg-[#00F0FF]/10 text-[#00F0FF]",
          nodeDot: "bg-[#00F0FF]",
        };
      default:
        return {
          cardBorder: "border-white/15 hover:border-white/40",
          badge: "bg-white/10 text-white border-white/20",
          numberColor: "text-white",
          iconBg: "bg-white/10 text-white",
          nodeDot: "bg-white",
        };
    }
  };

  return (
    <section
      id="race-arena"
      className="relative z-10 w-full overflow-hidden border-t border-white/10 bg-[#080514] py-20 px-4 sm:px-6 lg:px-8"
    >
      {/* Background Atmosphere */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-1/4 right-1/4 h-80 w-80 rounded-full bg-[#FF6B35]/10 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 h-80 w-80 rounded-full bg-[#00F0FF]/10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/30 bg-[#FF6B35]/10 px-4 py-1 text-xs font-mono font-bold tracking-widest text-[#FF6B35] uppercase mb-4 shadow-[0_0_15px_rgba(255,107,53,0.2)]">
            <Flag className="h-3.5 w-3.5 text-[#FF2A85]" />
            <span>DISTRICT 02 // RACE ARENA</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            RACE{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] via-[#FF2A85] to-[#00F0FF]">
              ARENA
            </span>
          </h2>

          <p className="mt-4 mx-auto max-w-2xl text-sm sm:text-base font-bold tracking-wider text-zinc-400 uppercase">
            COMPLETE THE MISSIONS. CLIMB THE CITY.
          </p>
        </div>

        {/* Missions Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2"
        >
          {missions.map((mission) => {
            const theme = getMissionTheme(mission.themeColor, mission.isBonus);
            return (
              <motion.div
                key={mission.codeName}
                variants={cardVariants}
                whileHover={shouldReduceMotion ? {} : { y: -4 }}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-[#0A0718]/90 p-6 sm:p-8 backdrop-blur-md transition-all duration-300 ${theme.cardBorder}`}
              >
                <div>
                  {/* Top Node Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${theme.nodeDot} shadow-[0_0_10px_currentColor]`}
                      />
                      <span className="font-mono text-xs font-black tracking-widest text-zinc-400 uppercase">
                        {mission.status}
                      </span>
                    </div>

                    {mission.isBonus && (
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-[#FF2A85]/40 bg-[#FF2A85]/15 px-3 py-0.5 text-[10px] font-black tracking-wider text-[#FF2A85] uppercase animate-pulse">
                        <Flame className="h-3 w-3" />
                        <span>{mission.highlightLabel}</span>
                      </div>
                    )}
                  </div>

                  {/* Mission Codename & Title */}
                  <div className="mt-6 space-y-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-mono text-xs font-bold tracking-widest text-zinc-500 uppercase">
                        CODENAME
                      </span>
                      <span className={`font-mono text-xs font-black tracking-widest ${theme.numberColor}`}>
                        NODE {mission.number}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white group-hover:text-white">
                      {mission.codeName}
                    </h3>

                    <p className="text-xs sm:text-sm font-bold tracking-wider text-zinc-300 uppercase">
                      {mission.title}
                    </p>
                  </div>

                  {/* Mission Description */}
                  <p className="mt-4 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {mission.description}
                  </p>

                  {/* Bonus Special Tagline */}
                  {mission.tagline && (
                    <div className="mt-4 rounded-lg border border-[#FF2A85]/20 bg-[#FF2A85]/5 p-3 text-center">
                      <span className="font-mono text-xs font-black tracking-widest text-[#FF2A85] uppercase">
                        &ldquo;{mission.tagline}&rdquo;
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Action / Footer */}
                <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="font-mono text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                    COMPETITION STAGE
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-black tracking-wider text-white">
                    <span>MISSION BRIEF</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
