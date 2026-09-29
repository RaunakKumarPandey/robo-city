"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Trophy, Zap, Shield, Play, ChevronDown, Radio } from "lucide-react";
import { eventData } from "@/data/eventData";

export default function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  const handleEnterCity = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById("city-overview");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
        delayChildren: shouldReduceMotion ? 0 : 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  return (
    <section className="relative flex min-h-[92vh] w-full flex-col items-center justify-center overflow-hidden pt-28 pb-16">
      {/* 1. HERO CONTENT CONTAINER */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto flex max-w-5xl flex-1 flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8"
      >
        {/* TOP STATUS PILL: 🔴 VICE CITY // GRAND PRIX 2026 */}
        <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#FF2D8D]/40 bg-[#120B20]/80 px-4 py-1.5 backdrop-blur-xl shadow-[0_0_20px_rgba(255,45,141,0.3)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF2D8D] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#FF2D8D]" />
            </span>
            <span className="font-mono text-xs font-black tracking-widest text-[#FF4FB3] uppercase">
              LIVE SIGNAL
            </span>
            <span className="h-3 w-[1px] bg-white/20" />
            <span className="font-mono text-xs font-bold tracking-wider text-[#35D9FF]">
              VICE CITY &apos;26 // GRAND PRIX
            </span>
          </div>
        </motion.div>

        {/* BRAND OVERLINE */}
        <motion.div variants={itemVariants} className="mb-2">
          <span className="font-mono text-xs sm:text-sm font-black tracking-[0.35em] uppercase text-[#FFE8C7]/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            IEEE STUDENT BRANCH MMMUT PRESENTS
          </span>
        </motion.div>

        {/* MAIN DISPLAY HEADLINE: ROBO CITY // VICE CITY '26 */}
        <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
          <h1 className="text-5xl font-black tracking-tight sm:text-7xl md:text-8xl lg:text-9xl uppercase leading-[0.9]">
            <span className="block text-white font-extrabold drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
              ROBO CITY
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D8D] via-[#FF7A3D] to-[#35D9FF] filter drop-shadow-[0_0_35px_rgba(255,45,141,0.6)]">
              VICE CITY &apos;26
            </span>
          </h1>
        </motion.div>

        {/* CINEMATIC TAGLINE BLOCK */}
        <motion.div
          variants={itemVariants}
          className="mb-8 flex flex-col items-center space-y-1 sm:space-y-1.5 font-mono text-lg sm:text-2xl md:text-3xl font-black tracking-wider uppercase"
        >
          <span className="text-[#FF2D8D] drop-shadow-[0_0_12px_rgba(255,45,141,0.6)]">
            THE CITY NEVER SLEEPS.
          </span>
          <span className="text-[#35D9FF] drop-shadow-[0_0_12px_rgba(53,217,255,0.6)]">
            NEITHER DO THE BOTS.
          </span>
        </motion.div>

        {/* SUBTITLE SPEC */}
        <motion.div variants={itemVariants} className="mb-10 max-w-2xl">
          <p className="font-sans text-sm sm:text-base text-zinc-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-relaxed">
            Engineered for high-stakes competition. Assemble your 3–5 player crew, construct your machine, and compete for the <span className="text-[#FFE8C7] font-bold">₹12,000 cash bounty</span> in the ultimate robotic arena.
          </p>
        </motion.div>

        {/* CTA BUTTONS */}
        <motion.div
          variants={itemVariants}
          className="flex w-full max-w-md flex-col items-center justify-center gap-3.5 sm:max-w-none sm:flex-row sm:gap-5"
        >
          {/* PRIMARY: ENTER THE CITY */}
          <motion.a
            href="#city-overview"
            onClick={handleEnterCity}
            whileHover={shouldReduceMotion ? {} : { scale: 1.04 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            className="group relative flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#FF2D8D] via-[#FF7A3D] to-[#35D9FF] px-8 py-4 font-mono text-sm sm:text-base font-black tracking-widest text-white shadow-[0_0_30px_rgba(255,45,141,0.55)] transition-all duration-300 hover:shadow-[0_0_45px_rgba(255,45,141,0.85)] cursor-pointer uppercase"
          >
            <span>ENTER THE CITY</span>
            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-1" />
          </motion.a>

          {/* SECONDARY: BUILD YOUR CREW */}
          <motion.div
            whileHover={shouldReduceMotion ? {} : { scale: 1.04 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            className="w-full sm:w-auto"
          >
            <Link
              href="/register"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-[#120B20]/80 px-8 py-4 font-mono text-sm sm:text-base font-black tracking-widest text-zinc-100 backdrop-blur-xl transition-all duration-300 hover:border-[#35D9FF]/70 hover:bg-[#35D9FF]/15 hover:text-white hover:shadow-[0_0_25px_rgba(53,217,255,0.4)] uppercase"
            >
              <Sparkles className="h-4 w-4 text-[#35D9FF]" />
              <span>BUILD YOUR CREW</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* LIVE HUD SPECS STRIP */}
        <motion.div
          variants={itemVariants}
          className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 w-full max-w-4xl"
        >
          <div className="rounded-xl border border-white/10 bg-[#120B20]/60 p-3.5 backdrop-blur-md">
            <div className="font-mono text-[10px] font-bold text-zinc-400 uppercase">PRIZE POOL</div>
            <div className="font-mono text-lg sm:text-xl font-black text-[#FFE8C7] drop-shadow-[0_0_10px_rgba(255,232,199,0.4)]">₹12,000</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#120B20]/60 p-3.5 backdrop-blur-md">
            <div className="font-mono text-[10px] font-bold text-zinc-400 uppercase">CREW SIZE</div>
            <div className="font-mono text-lg sm:text-xl font-black text-[#35D9FF]">3–5 MEMBERS</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#120B20]/60 p-3.5 backdrop-blur-md">
            <div className="font-mono text-[10px] font-bold text-zinc-400 uppercase">ENTRY FEE</div>
            <div className="font-mono text-lg sm:text-xl font-black text-emerald-400">100% FREE</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#120B20]/60 p-3.5 backdrop-blur-md">
            <div className="font-mono text-[10px] font-bold text-zinc-400 uppercase">EVENT STATUS</div>
            <div className="font-mono text-lg sm:text-xl font-black text-[#FF2D8D]">REGISTRATION OPEN</div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
