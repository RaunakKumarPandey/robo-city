"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Cpu,
  BatteryCharging,
  Radio,
  Sparkles,
  Shield,
  ArrowRight,
  Gauge,
  Layers,
  Sliders,
  Trophy,
  ExternalLink,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Copy,
  Users,
  Award,
  BookOpen,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { eventData } from "@/data/eventData";

const UNSTOP_QUIZ_URL =
  "https://unstop.com/o/3pxybfF?lb=YOVQQqwW&utm_medium=Share&utm_source=WhatsApp";

const garageModules = [
  {
    code: "MOD-01",
    title: "MICROCONTROLLER & FIRMWARE",
    desc: "Arduino & ESP32 core architecture, real-time motor PID loops, and latency optimization for instant pilot reflexes.",
    icon: Cpu,
    color: "pink",
    border: "border-[#FF2D8D]/40 hover:border-[#FF2D8D]",
    badge: "bg-[#FF2D8D]/15 text-[#FF4FB3]",
  },
  {
    code: "MOD-02",
    title: "HIGH-CURRENT POWER & MOTOR DRIVES",
    desc: "LiPo battery management, high-torque DC geared motor selection, and dual H-Bridge driver circuitry under continuous load.",
    icon: BatteryCharging,
    color: "orange",
    border: "border-[#FF7A3D]/40 hover:border-[#FF7A3D]",
    badge: "bg-[#FF7A3D]/15 text-[#FF7A3D]",
  },
  {
    code: "MOD-03",
    title: "CHASSIS GEOMETRY & TRACTION",
    desc: "Lightweight aluminum & acrylic chassis fabrication, center-of-gravity tuning for 35° incline ramp stability, and high-grip tire compounds.",
    icon: Layers,
    color: "cyan",
    border: "border-[#35D9FF]/40 hover:border-[#35D9FF]",
    badge: "bg-[#35D9FF]/15 text-[#35D9FF]",
  },
  {
    code: "MOD-04",
    title: "2.4GHz RF & TELEMETRY PROTOCOLS",
    desc: "Long-range multi-channel transmitter binding, anti-interference pairing, and fail-safe kill switches mandated by arena rules.",
    icon: Radio,
    color: "purple",
    border: "border-[#FF4FB3]/40 hover:border-[#FF4FB3]",
    badge: "bg-[#FF4FB3]/15 text-[#FF4FB3]",
  },
];

export default function GarageView() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(UNSTOP_QUIZ_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="relative z-10 mx-auto w-[94%] sm:w-[90%] md:w-[85%] lg:w-[75%] max-w-6xl px-4 py-16 sm:px-6 space-y-14">
      {/* Toast Notification for Copied Link */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-[#0A0718]/95 px-4 py-3 font-mono text-xs font-bold text-emerald-400 backdrop-blur-2xl shadow-[0_0_25px_rgba(16,185,129,0.4)]"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>UNSTOP QUIZ REGISTRATION LINK COPIED!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 1. HEADER */}
      {/* ========================================================================= */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7A3D]/40 bg-[#120B20]/80 px-4 py-1.5 font-mono text-xs font-bold tracking-widest text-[#FF7A3D] uppercase shadow-[0_0_20px_rgba(255,122,61,0.25)] backdrop-blur-xl">
          <Wrench className="h-3.5 w-3.5 text-[#35D9FF]" />
          <span>UNDERGROUND WORKSHOP // THE GARAGE</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-[0.95]">
          THE{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D8D] via-[#FF7A3D] to-[#35D9FF]">
            GARAGE
          </span>
        </h1>

        <p className="mx-auto max-w-2xl font-mono text-xs sm:text-sm text-zinc-300 tracking-wider uppercase leading-relaxed">
          Where raw engineering meets competitive robotics. Hands-on masterclasses conducted by{" "}
          <strong className="text-white">{eventData.organizer}</strong> to turn spare parts into championship bots.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 2. OFFICIAL WORKSHOP TECHNICAL QUIZ SHOWCASE CARD */}
      {/* ========================================================================= */}
      <motion.div
        id="workshop-quiz"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl border-2 border-[#FFE8C7]/50 bg-gradient-to-b from-[#1C0E28]/95 via-[#12071A]/95 to-[#08020E]/98 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_0_50px_rgba(255,122,61,0.3)]"
      >
        {/* Glow Halo */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-[500px] rounded-full bg-gradient-to-r from-[#FF2D8D]/25 via-[#FF7A3D]/30 to-[#35D9FF]/25 blur-[100px]" />

        {/* Corner HUD Ticks */}
        <div className="absolute top-3 left-3 h-3 w-3 border-t-2 border-l-2 border-[#FF7A3D]" />
        <div className="absolute top-3 right-3 h-3 w-3 border-t-2 border-r-2 border-[#FF7A3D]" />
        <div className="absolute bottom-3 left-3 h-3 w-3 border-b-2 border-l-2 border-[#FF7A3D]" />
        <div className="absolute bottom-3 right-3 h-3 w-3 border-b-2 border-r-2 border-[#FF7A3D]" />

        <div className="relative z-10 space-y-6">
          {/* Top Pill Bar: Date & Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 font-mono">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-500/15 px-3.5 py-1 text-xs font-bold text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span>UNSTOP QUIZ REGISTRATION OPEN</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl border border-[#FFE8C7]/30 bg-[#FFE8C7]/10 px-3 py-1 text-xs font-bold text-[#FFE8C7]">
              <Calendar className="h-3.5 w-3.5 text-[#FF7A3D]" />
              <span>DATE: 2ND OCTOBER 2026 (AFTER WORKSHOP)</span>
            </div>
          </div>

          {/* Main Title & Invitation */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs font-black tracking-widest text-[#FF7A3D] uppercase">
              <Trophy className="h-4 w-4 text-[#FFE8C7]" />
              <span>ATTENTION JUNIORS // INDIVIDUAL COMPETITION</span>
            </div>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white font-mono leading-tight">
              WORKSHOP TECHNICAL{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFE8C7] via-[#FF7A3D] to-[#FF2D8D] filter drop-shadow-[0_0_25px_rgba(255,122,61,0.5)]">
                QUIZ 2026
              </span>
            </h2>

            <p className="font-sans text-sm sm:text-base text-zinc-200 leading-relaxed max-w-3xl">
              A great opportunity to test your technical knowledge, compete with fellow roboticists, and win exciting recognition! The quiz will be conducted individually immediately following the workshop on <strong>2nd October</strong>.
            </p>
          </div>

          {/* Key Quiz Parameters Dossier Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 font-mono">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase">
                <BookOpen className="h-3.5 w-3.5 text-[#35D9FF]" />
                <span>SYLLABUS &amp; SCOPE</span>
              </div>
              <div className="text-sm font-black text-white">WORKSHOP CONCEPTS</div>
              <div className="text-[11px] text-zinc-400 leading-tight">
                Tests hardware, microcontrollers, motor drive, and RF telemetry fundamentals taught in the workshop.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase">
                <Users className="h-3.5 w-3.5 text-[#FF2D8D]" />
                <span>FORMAT &amp; ELIGIBILITY</span>
              </div>
              <div className="text-sm font-black text-[#FFE8C7]">INDIVIDUAL CONTEST</div>
              <div className="text-[11px] text-zinc-400 leading-tight">
                Every member of each robotics team must register and attempt the quiz individually.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase">
                <Award className="h-3.5 w-3.5 text-emerald-400" />
                <span>REWARDS &amp; HONORS</span>
              </div>
              <div className="text-sm font-black text-emerald-400">EXCITING PRIZES</div>
              <div className="text-[11px] text-zinc-400 leading-tight">
                Official certificates of distinction, special recognition, and podium honors.
              </div>
            </div>
          </div>

          {/* Mandatory Individual Registration Notice Callout */}
          <div className="flex items-start gap-3 rounded-2xl border border-[#FF7A3D]/40 bg-[#FF7A3D]/10 p-4 text-xs font-mono text-[#FFE8C7]">
            <AlertCircle className="h-5 w-5 shrink-0 text-[#FF7A3D] mt-0.5" />
            <div className="space-y-0.5 leading-relaxed">
              <strong className="block uppercase text-white font-black tracking-wider">
                IMPORTANT MANDATORY INSTRUCTION:
              </strong>
              <span>
                All team members must register individually for the quiz now on Unstop. Please ensure that every single member of your syndicate completes their individual registration.
              </span>
            </div>
          </div>

          {/* CTA Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 font-mono">
            <a
              href={UNSTOP_QUIZ_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#FF2D8D] via-[#FF7A3D] to-[#35D9FF] px-8 py-4 text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-[0_0_30px_rgba(255,122,61,0.5)] hover:shadow-[0_0_45px_rgba(255,122,61,0.8)] hover:scale-[1.02] transition-all cursor-pointer"
            >
              <span>REGISTER FOR QUIZ ON UNSTOP</span>
              <ExternalLink className="h-4 w-4" />
            </a>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-200 hover:border-white hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              <Copy className="h-4 w-4 text-[#35D9FF]" />
              <span>{copied ? "LINK COPIED ✓" : "COPY UNSTOP LINK"}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* 3. WORKSHOP MODULES GRID */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 font-mono">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#35D9FF] shadow-[0_0_8px_#35D9FF]" />
            <h3 className="text-base sm:text-lg font-black uppercase text-white">
              CORE CURRICULUM MODULES
            </h3>
          </div>
          <span className="text-xs text-zinc-400 font-bold uppercase">
            4 TECHNICAL TRACKS
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {garageModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.code}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-[#120B20]/85 p-6 sm:p-8 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 shadow-[0_15px_40px_rgba(0,0,0,0.7)] ${mod.border}`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span
                      className={`font-mono text-xs font-black tracking-widest uppercase rounded-full border px-2.5 py-0.5 ${mod.badge}`}
                    >
                      {mod.code}
                    </span>
                    <span className="font-mono text-xs font-bold text-zinc-400 uppercase">
                      WORKSHOP MODULE
                    </span>
                  </div>

                  <div className="mt-5 flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#08070D] text-[#35D9FF] shadow-md group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight text-white font-mono">
                        {mod.title}
                      </h3>
                      <p className="mt-2 font-sans text-xs sm:text-sm text-zinc-300 leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 font-mono text-xs font-bold uppercase text-zinc-400">
                  <span>HANDS-ON LABORATORY</span>
                  <span className="text-emerald-400">TESTED IN QUIZ</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. HARDWARE SPECS FOR ARENA CLEARANCE */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-[#35D9FF]/40 bg-[#08070D]/90 p-8 sm:p-10 backdrop-blur-2xl text-center space-y-6 shadow-[0_0_40px_rgba(53,217,255,0.2)]">
        <div className="font-mono text-xs font-black tracking-widest text-[#35D9FF] uppercase">
          HARDWARE &amp; REGULATION CHECKLIST
        </div>
        <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white font-mono">
          BUILD SPECS FOR ARENA CLEARANCE
        </h2>
        <p className="max-w-3xl mx-auto font-sans text-xs sm:text-sm text-zinc-300 leading-relaxed">
          All machines entering Rampage Arena or Obstacle Run must undergo official mechanical and wireless safety clearance at The Garage desk prior to round 1.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 font-mono">
          <a
            href={UNSTOP_QUIZ_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF2D8D] to-[#FF7A3D] px-8 py-4 text-xs sm:text-sm font-black uppercase tracking-widest text-white shadow-[0_0_25px_rgba(255,45,141,0.5)] hover:shadow-[0_0_35px_rgba(255,45,141,0.8)] transition-all hover:scale-105"
          >
            <Trophy className="h-4 w-4" />
            <span>ENROLL FOR 2ND OCT QUIZ</span>
          </a>
          <Link
            href="/missions"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-xs sm:text-sm font-black uppercase tracking-widest text-zinc-200 hover:border-[#35D9FF] hover:text-white transition-colors"
          >
            <span>VIEW MISSION RULES</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
