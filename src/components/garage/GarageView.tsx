"use client";

import { motion } from "framer-motion";
import { Wrench, Cpu, BatteryCharging, Radio, Sparkles, Shield, ArrowRight, Gauge, Layers, Sliders } from "lucide-react";
import Link from "next/link";
import { eventData } from "@/data/eventData";

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
  return (
    <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7A3D]/40 bg-[#120B20]/80 px-4 py-1.5 font-mono text-xs font-bold tracking-widest text-[#FF7A3D] uppercase mb-4 shadow-[0_0_20px_rgba(255,122,61,0.25)] backdrop-blur-xl">
          <Wrench className="h-3.5 w-3.5 text-[#35D9FF]" />
          <span>UNDERGROUND WORKSHOP // THE GARAGE</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white">
          THE{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D8D] via-[#FF7A3D] to-[#35D9FF]">
            GARAGE
          </span>
        </h1>

        <p className="mt-4 mx-auto max-w-2xl font-sans text-sm sm:text-base text-zinc-300 leading-relaxed">
          Where raw engineering meets competitive racing. Hands-on expert training conducted by <strong className="text-white">{eventData.organizer}</strong> to turn spare parts into championship machines.
        </p>
      </div>

      {/* Workshop Modules Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-16">
        {garageModules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.code}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-[#120B20]/85 p-6 sm:p-8 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 shadow-[0_15px_40px_rgba(0,0,0,0.7)] ${mod.border}`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className={`font-mono text-xs font-black tracking-widest uppercase rounded-full border px-2.5 py-0.5 ${mod.badge}`}>
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
                    <h3 className="text-xl font-black uppercase tracking-tight text-white">
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
                <span className="text-emerald-400">INCLUDED WITH REGISTRATION</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Garage Spec Banner */}
      <div className="rounded-3xl border border-[#35D9FF]/40 bg-[#08070D]/90 p-8 sm:p-10 backdrop-blur-2xl text-center space-y-6 shadow-[0_0_40px_rgba(53,217,255,0.2)]">
        <div className="font-mono text-xs font-black tracking-widest text-[#35D9FF] uppercase">
          HARDWARE & REGULATION CHECKLIST
        </div>
        <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
          BUILD SPECS FOR ARENA CLEARANCE
        </h2>
        <p className="max-w-3xl mx-auto font-sans text-xs sm:text-sm text-zinc-300 leading-relaxed">
          All machines entering Rampage Arena or Obstacle Run must undergo official mechanical and wireless safety clearance at The Garage desk prior to round 1.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF2D8D] to-[#FF7A3D] px-8 py-4 font-mono text-xs sm:text-sm font-black uppercase tracking-widest text-white shadow-[0_0_25px_rgba(255,45,141,0.5)] hover:shadow-[0_0_35px_rgba(255,45,141,0.8)] transition-all hover:scale-105"
          >
            <span>REGISTER YOUR MACHINE</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/missions"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 font-mono text-xs sm:text-sm font-black uppercase tracking-widest text-zinc-200 hover:border-[#35D9FF] hover:text-white transition-colors"
          >
            <span>VIEW MISSION RULES</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
