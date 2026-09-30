"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  Copy,
  Check,
  ExternalLink,
  Radio,
  Building2,
  User,
  ShieldCheck,
  Sparkles,
  Zap,
  MapPin,
  Clock,
  Flame,
  Send,
  Headphones,
} from "lucide-react";

// Official Crisp Brand SVG Icons
function LinkedInIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function FacebookIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
    </svg>
  );
}

function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43-.14-.01-.31-.01-.47-.01-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.12-.22-.19-.47-.31z" />
    </svg>
  );
}

export default function ContactView() {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    setTimeout(() => {
      setCopiedItem(null);
    }, 2500);
  };

  return (
    <div className="relative min-h-screen w-full px-4 pt-28 pb-24 sm:px-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {copiedItem && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-500/50 bg-[#0A0718]/95 px-5 py-3 font-mono text-xs font-bold text-emerald-400 backdrop-blur-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)]"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="h-3.5 w-3.5" />
            </div>
            <span>COPIED {copiedItem.toUpperCase()} TO CLIPBOARD</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 75% Centered Content Container so the Dynamic Background Wallpaper remains clearly visible on sides */}
      <div className="relative mx-auto w-[94%] sm:w-[90%] md:w-[85%] lg:w-[75%] max-w-6xl space-y-8">
        
        {/* ========================================================================= */}
        {/* 1. GTA VICE CITY HEADER & WANTED / TELEMETRY BADGE */}
        {/* ========================================================================= */}
        <div className="mx-auto max-w-4xl text-center space-y-3">
          
          {/* GTA Wanted & Radio Telemetry Badge */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[#35D9FF]/40 bg-[#120B20]/80 px-4 py-1.5 font-mono text-[11px] font-bold tracking-widest text-[#35D9FF] uppercase shadow-[0_0_25px_rgba(53,217,255,0.25)] backdrop-blur-xl">
            <div className="flex items-center gap-1 text-[#FF7A3D]">
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
            </div>
            <span className="text-zinc-500 font-normal">|</span>
            <span className="flex items-center gap-1.5 text-white">
              <Radio className="h-3.5 w-3.5 animate-pulse text-[#FF2D8D]" />
              <span>VICE CITY // CENTRAL DISPATCH</span>
            </span>
            <span className="text-zinc-500 font-normal hidden sm:inline">|</span>
            <span className="text-[#35D9FF] hidden sm:inline">FREQ: 104.5 MHz</span>
          </div>

          {/* Epic Hot Pink / Sunset Orange GTA Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-[0.95]">
            <span className="block text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
              CENTRAL
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D8D] via-[#FF7A3D] to-[#35D9FF] filter drop-shadow-[0_0_30px_rgba(255,45,141,0.5)]">
              DISPATCH
            </span>
          </h1>

          <p className="mx-auto max-w-2xl font-mono text-xs sm:text-sm text-zinc-300 tracking-wider uppercase leading-relaxed pt-1">
            FOR COMPETITION PROTOCOLS, SPONSORSHIPS, OR DIRECT COORDINATOR DISPATCH — CONNECT VIA OFFICIAL CHANNELS.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 2. DUAL GTA CYBERPUNK DOSSIER CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          {/* ----------------------------------------------------------------------- */}
          {/* CARD 1: IEEE STUDENT BRANCH (HQ & SOCIETY QUERIES) */}
          {/* ----------------------------------------------------------------------- */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-[#160E2E]/85 to-[#0A0714]/90 p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 hover:border-[#35D9FF]/70 hover:shadow-[0_0_40px_rgba(53,217,255,0.25)]">
            
            {/* Top Laser Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#35D9FF] to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />

            {/* Corner HUD Ticks */}
            <div className="absolute top-2 left-2 h-2 w-2 border-t-2 border-l-2 border-[#35D9FF]/60" />
            <div className="absolute top-2 right-2 h-2 w-2 border-t-2 border-r-2 border-[#35D9FF]/60" />
            <div className="absolute bottom-2 left-2 h-2 w-2 border-b-2 border-l-2 border-[#35D9FF]/60" />
            <div className="absolute bottom-2 right-2 h-2 w-2 border-b-2 border-r-2 border-[#35D9FF]/60" />

            <div className="space-y-6">
              {/* Card Header & Status */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="inline-flex items-center gap-2 rounded-xl border border-[#35D9FF]/40 bg-[#35D9FF]/15 px-3 py-1 font-mono text-[11px] font-extrabold text-[#35D9FF] uppercase tracking-wider">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>SECTOR HQ // OFFICIAL DISPATCH</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>HQ ONLINE</span>
                </div>
              </div>

              {/* Logo & Identity */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                {/* Glowing Avatar Frame */}
                <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#35D9FF] via-[#FF2D8D] to-[#FF7A3D] p-[2px] shadow-[0_0_25px_rgba(53,217,255,0.4)] group-hover:scale-105 transition-transform duration-300">
                  <div className="relative h-full w-full overflow-hidden rounded-[14px] bg-[#0A0718]">
                    <Image
                      src="/images/ieee_stb_logo.jpg"
                      alt="IEEE Student Branch MMMUT Logo"
                      fill
                      className="object-cover p-1"
                      priority
                    />
                  </div>
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-mono leading-tight group-hover:text-[#35D9FF] transition-colors">
                    IEEE STUDENT BRANCH
                  </h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                    <span className="rounded-md border border-[#35D9FF]/30 bg-[#35D9FF]/10 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-[#35D9FF] uppercase">
                      MMMUT GORAKHPUR
                    </span>
                    <span className="rounded-md border border-[#FF7A3D]/30 bg-[#FF7A3D]/10 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-[#FF7A3D] uppercase">
                      ORGANIZING BODY
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 font-mono leading-relaxed pt-1.5">
                    Official command for RoboVerse &apos;26 competition protocols, society collaborations, arena scheduling, and sponsorships.
                  </p>
                </div>
              </div>

              {/* Interactive Channel Links */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-400 flex items-center gap-1.5">
                    <Zap className="h-3 w-3 text-[#35D9FF]" />
                    <span>DIRECT ACCESS TERMINALS</span>
                  </span>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase">
                    ENCRYPTED UPLINK
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Official Email */}
                  <a
                    href="mailto:ieee.stb.mmmut@gmail.com"
                    className="group/link flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-200 transition-all hover:border-[#35D9FF] hover:bg-[#35D9FF]/15 hover:shadow-[0_0_20px_rgba(53,217,255,0.25)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 group-hover/link:scale-110 group-hover/link:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <span className="block text-[9px] font-mono font-bold text-zinc-400 uppercase">
                          OFFICIAL EMAIL
                        </span>
                        <span className="block text-xs font-mono font-semibold truncate text-white">
                          ieee.stb.mmmut@gmail.com
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-zinc-500 group-hover/link:text-[#35D9FF] transition-colors ml-2" />
                  </a>

                  {/* LinkedIn */}
                  <a
                    href="https://www.linkedin.com/company/ieee-stb-mmmut/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-200 transition-all hover:border-[#0077B5] hover:bg-[#0077B5]/20 hover:shadow-[0_0_20px_rgba(0,119,181,0.3)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0077B5]/20 border border-[#0077B5]/40 text-[#0077B5] group-hover/link:scale-110 group-hover/link:shadow-[0_0_15px_rgba(0,119,181,0.5)] transition-all">
                        <LinkedInIcon className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <span className="block text-[9px] font-mono font-bold text-zinc-400 uppercase">
                          LINKEDIN
                        </span>
                        <span className="block text-xs font-mono font-semibold truncate text-white">
                          IEEE STB MMMUT
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-zinc-500 group-hover/link:text-[#0077B5] transition-colors ml-2" />
                  </a>

                  {/* Facebook */}
                  <a
                    href="https://www.facebook.com/share/1H5pQmRJE5/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-200 transition-all hover:border-[#1877F2] hover:bg-[#1877F2]/20 hover:shadow-[0_0_20px_rgba(24,119,242,0.3)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1877F2]/20 border border-[#1877F2]/40 text-[#1877F2] group-hover/link:scale-110 group-hover/link:shadow-[0_0_15px_rgba(24,119,242,0.5)] transition-all">
                        <FacebookIcon className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <span className="block text-[9px] font-mono font-bold text-zinc-400 uppercase">
                          FACEBOOK
                        </span>
                        <span className="block text-xs font-mono font-semibold truncate text-white">
                          IEEE SB MMMUT
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-zinc-500 group-hover/link:text-[#1877F2] transition-colors ml-2" />
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://instagram.com/ieeesb.mmmut"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-200 transition-all hover:border-[#E1306C] hover:bg-[#E1306C]/20 hover:shadow-[0_0_20px_rgba(225,48,108,0.3)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E1306C]/20 border border-[#E1306C]/40 text-[#E1306C] group-hover/link:scale-110 group-hover/link:shadow-[0_0_15px_rgba(225,48,108,0.5)] transition-all">
                        <InstagramIcon className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <span className="block text-[9px] font-mono font-bold text-zinc-400 uppercase">
                          INSTAGRAM
                        </span>
                        <span className="block text-xs font-mono font-semibold truncate text-white">
                          @ieeesb.mmmut
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-zinc-500 group-hover/link:text-[#E1306C] transition-colors ml-2" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400">
                <ShieldCheck className="h-4 w-4 text-[#35D9FF]" />
                <span>OFFICIAL VERIFIED COMMAND DESK</span>
              </div>

              <button
                type="button"
                onClick={() => handleCopy("ieee.stb.mmmut@gmail.com", "IEEE Email")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#35D9FF]/40 bg-[#35D9FF]/10 px-3.5 py-1.5 font-mono text-xs font-bold text-[#35D9FF] hover:bg-[#35D9FF]/25 hover:border-[#35D9FF] transition-all cursor-pointer shadow-[0_0_15px_rgba(53,217,255,0.2)]"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>COPY EMAIL</span>
              </button>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* CARD 2: RAUNAK PANDEY (CONVENER & LEAD DIRECT DISPATCH) */}
          {/* ----------------------------------------------------------------------- */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-[#160E2E]/85 to-[#0A0714]/90 p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 hover:border-[#FF2D8D]/70 hover:shadow-[0_0_40px_rgba(255,45,141,0.25)]">
            
            {/* Top Laser Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF2D8D] to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />

            {/* Corner HUD Ticks */}
            <div className="absolute top-2 left-2 h-2 w-2 border-t-2 border-l-2 border-[#FF2D8D]/60" />
            <div className="absolute top-2 right-2 h-2 w-2 border-t-2 border-r-2 border-[#FF2D8D]/60" />
            <div className="absolute bottom-2 left-2 h-2 w-2 border-b-2 border-l-2 border-[#FF2D8D]/60" />
            <div className="absolute bottom-2 right-2 h-2 w-2 border-b-2 border-r-2 border-[#FF2D8D]/60" />

            <div className="space-y-6">
              {/* Card Header & Status */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="inline-flex items-center gap-2 rounded-xl border border-[#FF2D8D]/40 bg-[#FF2D8D]/15 px-3 py-1 font-mono text-[11px] font-extrabold text-[#FF4FB3] uppercase tracking-wider">
                  <User className="h-3.5 w-3.5" />
                  <span>DIRECT DISPATCH // CONVENER</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#35D9FF]">
                  <span className="h-2 w-2 rounded-full bg-[#35D9FF] animate-ping" />
                  <span>RADAR ACTIVE</span>
                </div>
              </div>

              {/* Photo & Identity */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                {/* Glowing Avatar Frame */}
                <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF2D8D] via-[#FF7A3D] to-[#35D9FF] p-[2px] shadow-[0_0_25px_rgba(255,45,141,0.4)] group-hover:scale-105 transition-transform duration-300">
                  <div className="relative h-full w-full overflow-hidden rounded-[14px] bg-[#0A0718]">
                    <Image
                      src="/images/raunak_pandey.png"
                      alt="Raunak Pandey - Festival Lead"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-mono leading-tight group-hover:text-[#FF4FB3] transition-colors">
                    RAUNAK PANDEY
                  </h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                    <span className="rounded-md border border-[#FF7A3D]/40 bg-[#FF7A3D]/15 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-[#FF7A3D] uppercase">
                      FESTIVAL LEAD &amp; CONVENER
                    </span>
                    <span className="rounded-md border border-[#35D9FF]/40 bg-[#35D9FF]/15 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-[#35D9FF] uppercase">
                      FINAL YEAR
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 font-mono leading-relaxed pt-1.5">
                    Direct coordinator for team registrations, bot scrutinizing clearances, technical rule clarifications, and urgent arena escalations.
                  </p>
                </div>
              </div>

              {/* Interactive Channel Links */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-400 flex items-center gap-1.5">
                    <Flame className="h-3 w-3 text-[#FF7A3D]" />
                    <span>RAPID COMMS FREQUENCIES</span>
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold">
                    FAST RESPONSE
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Phone Call */}
                  <a
                    href="tel:+918789432955"
                    className="group/link flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-200 transition-all hover:border-emerald-500 hover:bg-emerald-500/15 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 group-hover/link:scale-110 group-hover/link:shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <span className="block text-[9px] font-mono font-bold text-zinc-400 uppercase">
                          DIRECT CALL // HOTLINE
                        </span>
                        <span className="block text-xs font-mono font-semibold truncate text-white">
                          +91 87894 32955
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-zinc-500 group-hover/link:text-emerald-400 transition-colors ml-2" />
                  </a>

                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/918789432955?text=Hi%20Raunak,%20I%20have%20a%20query%20regarding%20RoboVerse'26"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-200 transition-all hover:border-emerald-500 hover:bg-emerald-500/15 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 group-hover/link:scale-110 group-hover/link:shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all">
                        <WhatsAppIcon className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <span className="block text-[9px] font-mono font-bold text-zinc-400 uppercase">
                          WHATSAPP COMMS
                        </span>
                        <span className="block text-xs font-mono font-semibold truncate text-white">
                          Chat on WhatsApp
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-zinc-500 group-hover/link:text-emerald-400 transition-colors ml-2" />
                  </a>

                  {/* Personal Email */}
                  <a
                    href="mailto:rk87894329@gmail.com"
                    className="group/link flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-200 transition-all hover:border-[#FF2D8D] hover:bg-[#FF2D8D]/15 hover:shadow-[0_0_20px_rgba(255,45,141,0.25)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF2D8D]/20 border border-[#FF2D8D]/40 text-[#FF4FB3] group-hover/link:scale-110 group-hover/link:shadow-[0_0_15px_rgba(255,45,141,0.5)] transition-all">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <span className="block text-[9px] font-mono font-bold text-zinc-400 uppercase">
                          PERSONAL EMAIL
                        </span>
                        <span className="block text-xs font-mono font-semibold truncate text-white">
                          rk87894329@gmail.com
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-zinc-500 group-hover/link:text-[#FF2D8D] transition-colors ml-2" />
                  </a>

                  {/* LinkedIn */}
                  <a
                    href="https://www.linkedin.com/in/raunak-kumar-pandey-652a1b303"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-200 transition-all hover:border-[#0077B5] hover:bg-[#0077B5]/20 hover:shadow-[0_0_20px_rgba(0,119,181,0.3)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0077B5]/20 border border-[#0077B5]/40 text-[#0077B5] group-hover/link:scale-110 group-hover/link:shadow-[0_0_15px_rgba(0,119,181,0.5)] transition-all">
                        <LinkedInIcon className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <span className="block text-[9px] font-mono font-bold text-zinc-400 uppercase">
                          LINKEDIN PROFILE
                        </span>
                        <span className="block text-xs font-mono font-semibold truncate text-white">
                          Raunak Kumar Pandey
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-zinc-500 group-hover/link:text-[#0077B5] transition-colors ml-2" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400">
                <Sparkles className="h-4 w-4 text-[#FF2D8D]" />
                <span>DIRECT LINE &amp; WHATSAPP</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy("8789432955", "Phone Number")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 font-mono text-xs font-bold text-emerald-400 hover:bg-emerald-500/25 hover:border-emerald-500 transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>COPY PHONE</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy("rk87894329@gmail.com", "Email")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#FF2D8D]/40 bg-[#FF2D8D]/10 px-3 py-1.5 font-mono text-xs font-bold text-[#FF4FB3] hover:bg-[#FF2D8D]/25 hover:border-[#FF2D8D] transition-all cursor-pointer shadow-[0_0_15px_rgba(255,45,141,0.2)]"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>COPY EMAIL</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. GTA EMERGENCY DISPATCH PROTOCOL / HOTLINE TICKER */}
        {/* ========================================================================= */}
        <div className="overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-r from-[#120B20]/90 via-[#1A0B2E]/90 to-[#120B20]/90 p-5 sm:p-6 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.7)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#FF7A3D]/40 bg-gradient-to-br from-[#FF2D8D]/20 to-[#FF7A3D]/30 text-[#FF7A3D] shadow-[0_0_20px_rgba(255,122,61,0.3)]">
                <Headphones className="h-6 w-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2 font-mono text-xs font-black tracking-wider text-white uppercase">
                  <span>EMERGENCY DISPATCH PROTOCOL</span>
                  <span className="rounded bg-[#FF2D8D] px-1.5 py-0.2 text-[9px] font-black text-white">
                    LIVE
                  </span>
                </div>
                <p className="font-mono text-xs text-zinc-300 pt-0.5">
                  Need immediate clearance or on-ground arena assistance? Connect to the live dispatch desk now.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="tel:+918789432955"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF2D8D] to-[#FF7A3D] px-4 py-2.5 font-mono text-xs font-black tracking-wider uppercase text-white shadow-[0_0_20px_rgba(255,45,141,0.5)] transition-all hover:scale-105"
              >
                <Phone className="h-4 w-4" />
                <span>INSTANT CALL</span>
              </a>

              <a
                href="https://wa.me/918789432955?text=Hi%20Raunak,%20I%20have%20an%20urgent%20query%20for%20RoboVerse'26"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/20 px-4 py-2.5 font-mono text-xs font-black tracking-wider uppercase text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-500/30 hover:scale-105"
              >
                <WhatsAppIcon className="h-4 w-4" />
                <span>WHATSAPP DISPATCH</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
