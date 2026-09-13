"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Mail,
  Phone,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Radio,
  Building2,
  User,
  ShieldCheck,
  Sparkles,
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
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
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
    <div className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden bg-[#07070F] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Background Neon Gradients */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-30">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-[#FF2A85]/15 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-[#00F0FF]/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#8A2BE2]/10 blur-[150px]" />
      </div>

      {/* Toast Notification */}
      {copiedItem && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-[#0A0718]/95 px-4 py-3 font-mono text-xs font-bold text-emerald-400 backdrop-blur-xl shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-in fade-in slide-in-from-bottom-5">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>COPIED {copiedItem.toUpperCase()} TO CLIPBOARD</span>
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* ========================================================================= */}
        {/* PAGE HEADER */}
        {/* ========================================================================= */}
        <div className="mb-12 text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/10 px-4 py-1 text-xs font-mono font-bold tracking-widest text-[#00F0FF] uppercase shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Radio className="h-3.5 w-3.5 animate-pulse text-[#00F0FF]" />
            <span>ROBO CITY // COMMS &amp; DISPATCH</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-mono leading-tight">
            CONTACT{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A85] via-[#FF6B35] to-[#00F0FF] filter drop-shadow-[0_0_20px_rgba(255,42,133,0.4)]">
              CONTROL DESK
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-zinc-400 font-mono tracking-wider">
            FOR EVENT REGULATIONS, SOCIETY INQUIRIES, OR DIRECT COORDINATOR SUPPORT — CONNECT THROUGH ANY OFFICIAL CHANNEL BELOW.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* DUAL CONTACT CARDS GRID */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* ----------------------------------------------------------------------- */}
          {/* CARD 1: IEEE STUDENT BRANCH (SOCIETY & EVENT QUERIES) */}
          {/* ----------------------------------------------------------------------- */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0A0718]/90 p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 hover:border-[#00F0FF]/60 hover:shadow-[0_0_35px_rgba(0,240,255,0.25)]">
            {/* Top Accent Glow */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#00F0FF]/15 blur-3xl transition-opacity group-hover:opacity-100" />

            <div className="space-y-6">
              {/* Card Header & Badge */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/10 px-3 py-1 text-[11px] font-mono font-bold text-[#00F0FF] uppercase">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>EVENT &amp; SOCIETY QUERIES</span>
                </div>
                <span className="font-mono text-[11px] font-black text-zinc-500 uppercase">
                  OFFICIAL ORGANIZER
                </span>
              </div>

              {/* Logo & Identity */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00F0FF] via-[#8A2BE2] to-[#FF2A85] p-[2px] shadow-[0_0_20px_rgba(0,240,255,0.35)] group-hover:scale-105 transition-transform duration-300">
                  <div className="relative h-full w-full overflow-hidden rounded-full bg-[#07070F]">
                    <Image
                      src="/images/ieee_stb_logo.jpg"
                      alt="IEEE Student Branch MMMUT Logo"
                      fill
                      className="object-cover p-1"
                      priority
                    />
                  </div>
                </div>

                <div className="space-y-1.5 flex-1">
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-mono">
                    IEEE STUDENT BRANCH
                  </h2>
                  <p className="font-mono text-xs font-bold tracking-widest text-[#00F0FF] uppercase">
                    MMMUT GORAKHPUR
                  </p>
                  <p className="text-xs text-zinc-400 font-mono leading-relaxed pt-1">
                    For RoboVerse&apos;26 competition rules, society collaborations, venue schedules, and official sponsorships.
                  </p>
                </div>
              </div>

              {/* Interactive Channel Links with Clickable Logos */}
              <div className="space-y-3 pt-2">
                <span className="block text-[11px] font-mono font-bold tracking-widest uppercase text-zinc-400">
                  CLICK LOGOS TO CONNECT // SOCIAL &amp; COMMS
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Email Channel */}
                  <a
                    href="mailto:ieee.stb.mmmut@gmail.com"
                    className="group/link flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-200 transition-all hover:border-[#00F0FF]/60 hover:bg-[#00F0FF]/10 hover:text-white"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 group-hover/link:scale-110 group-hover/link:shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-all">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <span className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">
                          OFFICIAL EMAIL
                        </span>
                        <span className="block text-xs font-mono font-semibold truncate">
                          ieee.stb.mmmut@gmail.com
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-zinc-500 group-hover/link:text-[#00F0FF] transition-colors ml-2" />
                  </a>

                  {/* LinkedIn Channel */}
                  <a
                    href="https://www.linkedin.com/company/ieee-stb-mmmut/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-200 transition-all hover:border-[#0A66C2]/60 hover:bg-[#0A66C2]/15 hover:text-white"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A66C2]/20 border border-[#0A66C2]/40 text-[#0A66C2] group-hover/link:scale-110 group-hover/link:shadow-[0_0_12px_rgba(10,102,194,0.5)] transition-all">
                        <LinkedInIcon className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <span className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">
                          LINKEDIN
                        </span>
                        <span className="block text-xs font-mono font-semibold truncate">
                          IEEE STB MMMUT
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-zinc-500 group-hover/link:text-[#0A66C2] transition-colors ml-2" />
                  </a>

                  {/* Facebook Channel */}
                  <a
                    href="https://www.facebook.com/share/1H5pQmRJE5/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-200 transition-all hover:border-[#1877F2]/60 hover:bg-[#1877F2]/15 hover:text-white"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1877F2]/20 border border-[#1877F2]/40 text-[#1877F2] group-hover/link:scale-110 group-hover/link:shadow-[0_0_12px_rgba(24,119,242,0.5)] transition-all">
                        <FacebookIcon className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <span className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">
                          FACEBOOK
                        </span>
                        <span className="block text-xs font-mono font-semibold truncate">
                          IEEE SB MMMUT
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-zinc-500 group-hover/link:text-[#1877F2] transition-colors ml-2" />
                  </a>

                  {/* Instagram Channel */}
                  <a
                    href="https://instagram.com/ieeesb.mmmut"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-200 transition-all hover:border-[#E1306C]/60 hover:bg-[#E1306C]/15 hover:text-white"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E1306C]/20 border border-[#E1306C]/40 text-[#E1306C] group-hover/link:scale-110 group-hover/link:shadow-[0_0_12px_rgba(225,48,108,0.5)] transition-all">
                        <InstagramIcon className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <span className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">
                          INSTAGRAM
                        </span>
                        <span className="block text-xs font-mono font-semibold truncate">
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
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                <ShieldCheck className="h-4 w-4 text-[#00F0FF]" />
                <span>OFFICIAL BRANCH DESK</span>
              </div>

              <button
                type="button"
                onClick={() => handleCopy("ieee.stb.mmmut@gmail.com", "IEEE Email")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono font-bold text-zinc-300 hover:border-[#00F0FF] hover:bg-[#00F0FF]/10 hover:text-white transition-colors cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>COPY EMAIL</span>
              </button>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* CARD 2: RAUNAK PANDEY (PERSONAL & DIRECT QUERIES) */}
          {/* ----------------------------------------------------------------------- */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0A0718]/90 p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 hover:border-[#FF2A85]/60 hover:shadow-[0_0_35px_rgba(255,42,133,0.25)]">
            {/* Top Accent Glow */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#FF2A85]/15 blur-3xl transition-opacity group-hover:opacity-100" />

            <div className="space-y-6">
              {/* Card Header & Badge */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#FF2A85]/30 bg-[#FF2A85]/10 px-3 py-1 text-[11px] font-mono font-bold text-[#FF2A85] uppercase">
                  <User className="h-3.5 w-3.5" />
                  <span>PERSONAL &amp; DIRECT QUERIES</span>
                </div>
                <span className="font-mono text-[11px] font-black text-zinc-500 uppercase">
                  TEAM MEMBER
                </span>
              </div>

              {/* Photo & Identity */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF2A85] via-[#FF6B35] to-[#FFAA00] p-[2px] shadow-[0_0_20px_rgba(255,42,133,0.35)] group-hover:scale-105 transition-transform duration-300">
                  <div className="relative h-full w-full overflow-hidden rounded-full bg-[#07070F]">
                    <Image
                      src="/images/raunak_pandey.png"
                      alt="Raunak Pandey - Team Member"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>

                <div className="space-y-1.5 flex-1">
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-mono">
                    RAUNAK PANDEY
                  </h2>
                  <p className="font-mono text-xs font-bold tracking-widest text-[#FF2A85] uppercase">
                    TEAM MEMBER
                  </p>
                  <p className="text-xs text-zinc-400 font-mono leading-relaxed pt-1">
                    For individual registration support, technical bot specs, squad verification, or emergency inquiries.
                  </p>
                </div>
              </div>

              {/* Interactive Channel Links with Clickable Logos */}
              <div className="space-y-3 pt-2">
                <span className="block text-[11px] font-mono font-bold tracking-widest uppercase text-zinc-400">
                  CLICK LOGOS TO CONNECT // DIRECT DISPATCH
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Phone Call Channel */}
                  <a
                    href="tel:+918789432955"
                    className="group/link flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-200 transition-all hover:border-[#00F0FF]/60 hover:bg-[#00F0FF]/10 hover:text-white"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 group-hover/link:scale-110 group-hover/link:shadow-[0_0_12px_rgba(16,185,129,0.5)] transition-all">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <span className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">
                          DIRECT CALL
                        </span>
                        <span className="block text-xs font-mono font-semibold truncate">
                          +91 87894 32955
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-zinc-500 group-hover/link:text-emerald-400 transition-colors ml-2" />
                  </a>

                  {/* WhatsApp Channel */}
                  <a
                    href="https://wa.me/918789432955?text=Hi%20Raunak,%20I%20have%20a%20query%20regarding%20RoboVerse'26"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-200 transition-all hover:border-emerald-500/60 hover:bg-emerald-500/15 hover:text-white"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 group-hover/link:scale-110 group-hover/link:shadow-[0_0_12px_rgba(16,185,129,0.5)] transition-all">
                        <WhatsAppIcon className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <span className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">
                          WHATSAPP CHAT
                        </span>
                        <span className="block text-xs font-mono font-semibold truncate">
                          Chat on WhatsApp
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-zinc-500 group-hover/link:text-emerald-400 transition-colors ml-2" />
                  </a>

                  {/* Personal Email Channel */}
                  <a
                    href="mailto:rk87894329@gmail.com"
                    className="group/link flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-200 transition-all hover:border-[#FF2A85]/60 hover:bg-[#FF2A85]/10 hover:text-white"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 group-hover/link:scale-110 group-hover/link:shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-all">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <span className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">
                          PERSONAL EMAIL
                        </span>
                        <span className="block text-xs font-mono font-semibold truncate">
                          rk87894329@gmail.com
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-zinc-500 group-hover/link:text-[#FF2A85] transition-colors ml-2" />
                  </a>

                  {/* LinkedIn Channel */}
                  <a
                    href="https://www.linkedin.com/in/raunak-kumar-pandey-652a1b303"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-200 transition-all hover:border-[#0A66C2]/60 hover:bg-[#0A66C2]/15 hover:text-white"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A66C2]/20 border border-[#0A66C2]/40 text-[#0A66C2] group-hover/link:scale-110 group-hover/link:shadow-[0_0_12px_rgba(10,102,194,0.5)] transition-all">
                        <LinkedInIcon className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <span className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">
                          LINKEDIN PROFILE
                        </span>
                        <span className="block text-xs font-mono font-semibold truncate">
                          Raunak Kumar Pandey
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-zinc-500 group-hover/link:text-[#0A66C2] transition-colors ml-2" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                <Sparkles className="h-4 w-4 text-[#FF2A85]" />
                <span>DIRECT PHONE &amp; WHATSAPP</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy("8789432955", "Phone Number")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono font-bold text-zinc-300 hover:border-[#FF2A85] hover:bg-[#FF2A85]/10 hover:text-white transition-colors cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>COPY PHONE</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy("rk87894329@gmail.com", "Email")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono font-bold text-zinc-300 hover:border-[#FF2A85] hover:bg-[#FF2A85]/10 hover:text-white transition-colors cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>COPY EMAIL</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
