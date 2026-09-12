"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, Radio, Sparkles } from "lucide-react";
import { eventData } from "@/data/eventData";

export default function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  // Lightweight Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
        delayChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  const handleEnterCity = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById("city-overview");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "/about";
    }
  };

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-between overflow-hidden pt-24 pb-8 sm:pt-28 sm:pb-12 bg-grain">
      {/* 1. VICE CITY SUNSET ATMOSPHERE & SKYLINE (Pure CSS & Original SVG) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Sky Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0418] via-[#1A0A2E] via-50% to-[#07070F]" />

        {/* Retro Sunset Sun Aura */}
        <div className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2">
          <div className="h-64 w-64 sm:h-96 sm:w-96 rounded-full bg-gradient-to-t from-[#FF2A85] via-[#FF6B35] to-[#FFAA00] opacity-35 blur-3xl filter" />
        </div>

        {/* Neon Ambient Fog / Spotlights */}
        <div className="absolute top-1/3 left-1/4 h-72 w-72 rounded-full bg-[#8A2BE2]/25 blur-[90px]" />
        <div className="absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-[#00F0FF]/20 blur-[90px]" />

        {/* Original Stylized City Skyline Silhouette */}
        <svg
          className="absolute bottom-16 sm:bottom-24 left-0 right-0 w-full opacity-35"
          viewBox="0 0 1440 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 260V190L40 190V160L80 160V190L130 190V140L160 140V120L190 120V140L210 140V210L270 210V110L320 110V90L340 90V70L360 70V90L380 90V110L420 110V220L480 220V150L530 150V130L580 130V230L630 230V100L660 100V60L670 60V20L680 20V60L690 60V100L740 100V210L790 210V140L840 140V120L870 120V140L900 140V240L960 240V90L1000 90V50L1020 50V90L1060 90V210L1120 210V130L1180 130V160L1220 160V230L1280 230V110L1320 110V80L1350 80V110L1400 110V180L1440 180V260H0Z"
            fill="#090514"
          />
          {/* Subtle Skyline Lit Window Dots */}
          <rect x="330" y="100" width="4" height="4" fill="#00F0FF" opacity="0.8" />
          <rect x="350" y="120" width="4" height="4" fill="#FF2A85" opacity="0.9" />
          <rect x="670" y="70" width="3" height="12" fill="#FFAA00" opacity="0.8" />
          <rect x="1010" y="60" width="3" height="3" fill="#FF2A85" opacity="0.9" />
          <rect x="1010" y="75" width="3" height="3" fill="#00F0FF" opacity="0.8" />
          <rect x="1335" y="90" width="4" height="4" fill="#FFAA00" opacity="0.7" />
        </svg>

        {/* Original Palm Tree Silhouettes (Left & Right Flanks) */}
        <svg
          className="absolute -bottom-4 -left-10 h-72 w-72 sm:h-96 sm:w-96 opacity-30 text-[#090514]"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <path d="M70 200 C75 140 85 80 110 30 C108 30 95 36 80 48 C65 60 55 75 50 90 C52 75 60 55 78 40 C95 25 110 20 115 20 C115 15 125 10 135 15 C130 25 135 35 145 42 C160 55 175 65 190 70 C175 60 155 50 145 35 C155 30 170 30 185 35 C165 25 140 22 120 25 C118 20 110 10 95 8 C105 14 110 22 110 28 C90 28 70 35 55 48 C68 40 85 35 105 32 C85 80 75 140 70 200 Z" />
        </svg>
        <svg
          className="absolute -bottom-4 -right-10 h-72 w-72 sm:h-96 sm:w-96 -scale-x-100 opacity-30 text-[#090514]"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <path d="M70 200 C75 140 85 80 110 30 C108 30 95 36 80 48 C65 60 55 75 50 90 C52 75 60 55 78 40 C95 25 110 20 115 20 C115 15 125 10 135 15 C130 25 135 35 145 42 C160 55 175 65 190 70 C175 60 155 50 145 35 C155 30 170 30 185 35 C165 25 140 22 120 25 C118 20 110 10 95 8 C105 14 110 22 110 28 C90 28 70 35 55 48 C68 40 85 35 105 32 C85 80 75 140 70 200 Z" />
        </svg>

        {/* Perspective Road Floor Grid */}
        <div className="perspective-grid absolute bottom-0 left-0 right-0 h-44 sm:h-60 overflow-hidden">
          <div className="grid-plane" />
        </div>
      </div>

      {/* 2. HERO CONTENT CONTAINER */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto flex max-w-5xl flex-1 flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8"
      >
        {/* TOP SIGNAL: 🔴 LIVE SIGNAL | ROBOVERSE'26 */}
        <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#FF2A85]/40 bg-[#FF2A85]/10 px-4 py-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(255,42,133,0.2)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            <span className="text-xs font-black tracking-widest text-red-400 uppercase">
              LIVE SIGNAL
            </span>
            <span className="h-3 w-[1px] bg-white/20" />
            <span className="text-xs font-bold tracking-wider text-zinc-300">
              {eventData.eventName}
            </span>
          </div>
        </motion.div>

        {/* BRAND OVERLINE */}
        <motion.div variants={itemVariants} className="mb-2">
          <span className="text-xs sm:text-sm font-black tracking-[0.3em] uppercase text-zinc-400">
            IEEE STUDENT BRANCH MMMUT PRESENTS
          </span>
        </motion.div>

        {/* ROBOVERSE'26 (Large & Bold Display) */}
        <motion.div variants={itemVariants} className="mb-2 sm:mb-3">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A85] via-[#FF6B35] to-[#FFAA00] uppercase filter drop-shadow-[0_0_20px_rgba(255,42,133,0.4)]">
            ROBOVERSE &apos;26
          </h2>
        </motion.div>

        {/* MAIN HEADING: WELCOME TO ROBO CITY */}
        <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl uppercase leading-[0.95]">
            <span className="block text-white font-extrabold drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              WELCOME TO
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A85] via-[#FF6B35] via-50% to-[#00F0FF] filter drop-shadow-[0_0_25px_rgba(255,42,133,0.5)]">
              ROBO CITY
            </span>
          </h1>
        </motion.div>

        {/* TAGLINE BLOCK */}
        <motion.div
          variants={itemVariants}
          className="mb-8 flex flex-col items-center space-y-1 sm:space-y-1.5 text-base sm:text-xl md:text-2xl font-black tracking-wider uppercase"
        >
          <span className="text-[#FF2A85] drop-shadow-[0_0_8px_rgba(255,42,133,0.5)]">
            BUILD YOUR CREW.
          </span>
          <span className="text-[#FF6B35] drop-shadow-[0_0_8px_rgba(255,107,53,0.5)]">
            BUILD YOUR BOT.
          </span>
          <span className="text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">
            OWN THE CITY.
          </span>
        </motion.div>

        {/* CTA BUTTONS */}
        <motion.div
          variants={itemVariants}
          className="flex w-full max-w-md flex-col items-center justify-center gap-3.5 sm:max-w-none sm:flex-row sm:gap-5"
        >
          {/* PRIMARY: ENTER ROBO CITY */}
          <motion.a
            href="#city-overview"
            onClick={handleEnterCity}
            whileHover={shouldReduceMotion ? {} : { scale: 1.04 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            className="group relative flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-lg bg-gradient-to-r from-[#FF2A85] via-[#FF6B35] to-[#8A2BE2] px-8 py-3.5 text-sm sm:text-base font-black tracking-widest text-white shadow-[0_0_25px_rgba(255,42,133,0.5)] transition-all duration-300 hover:shadow-[0_0_35px_rgba(255,42,133,0.75)] cursor-pointer uppercase"
          >
            <span>ENTER ROBO CITY</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </motion.a>

          {/* SECONDARY: REGISTER YOUR CREW */}
          <motion.div
            whileHover={shouldReduceMotion ? {} : { scale: 1.04 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            className="w-full sm:w-auto"
          >
            <Link
              href="/register"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-8 py-3.5 text-sm sm:text-base font-black tracking-widest text-zinc-200 backdrop-blur-md transition-all duration-300 hover:border-[#00F0FF]/60 hover:bg-[#00F0FF]/10 hover:text-white hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] uppercase"
            >
              <Sparkles className="h-4 w-4 text-[#00F0FF]" />
              <span>REGISTER YOUR CREW</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* SUBTLE OFFICIAL QUOTE */}
        <motion.div
          variants={itemVariants}
          className="mt-8 sm:mt-10 max-w-xl px-4 text-center text-xs sm:text-sm text-zinc-400 italic"
        >
          <p className="leading-relaxed">
            &ldquo;{eventData.quote.text}&rdquo;
          </p>
          <p className="mt-1 text-[11px] font-bold tracking-wider text-zinc-500 uppercase not-italic">
            — {eventData.quote.author}
          </p>
        </motion.div>
      </motion.div>

      {/* 3. SCROLL DOWN INDICATOR */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="relative z-10 mt-6 flex flex-col items-center"
      >
        <a
          href="#city-overview"
          onClick={handleEnterCity}
          className="group flex flex-col items-center gap-1 text-[10px] font-black tracking-[0.25em] text-zinc-400 uppercase transition-colors hover:text-[#00F0FF]"
        >
          <span>SCROLL TO ENTER THE CITY</span>
          <ChevronDown className="h-4 w-4 animate-bounce text-[#FF2A85] group-hover:text-[#00F0FF]" />
        </a>
      </motion.div>
    </section>
  );
}
