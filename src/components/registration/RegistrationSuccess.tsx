"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, Check, ArrowRight, ShieldAlert, Sparkles, Trophy, Users, Bot } from "lucide-react";
import { RegistrationSubmission } from "@/types/database";

interface RegistrationSuccessProps {
  registrationNumber: string;
  formData: RegistrationSubmission;
  onReset: () => void;
}

export default function RegistrationSuccess({
  registrationNumber,
  formData,
  onReset,
}: RegistrationSuccessProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(registrationNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="relative mx-auto max-w-2xl px-4 py-8 sm:py-12">
      {/* Background Aura */}
      <div className="pointer-events-none absolute inset-0 -top-10 flex justify-center opacity-30">
        <div className="h-72 w-96 rounded-full bg-gradient-to-r from-[#FF2D8D] via-[#FF7A3D] to-[#35D9FF] blur-[100px]" />
      </div>

      <div className="relative z-10 rounded-3xl border border-emerald-500/40 bg-[#120B20]/95 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_0_60px_rgba(16,185,129,0.25)] text-center space-y-8">
        {/* Success Icon Badge */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.35)]">
          <CheckCircle2 className="h-9 w-9" />
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#35D9FF]/40 bg-[#35D9FF]/10 px-3.5 py-0.5 text-xs font-mono font-bold tracking-widest text-[#35D9FF] uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>WELCOME TO VICE CITY &apos;26</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-mono">
            SYNDICATE REGISTERED
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 font-mono">
            YOUR SQUAD HAS ENTERED THE ROBO CITY GRAND PRIX.
          </p>
        </div>

        {/* Registration ID Banner */}
        <div className="rounded-2xl border border-white/10 bg-[#08070D]/80 p-6 space-y-3 shadow-inner">
          <span className="text-[11px] font-mono font-bold tracking-widest text-zinc-400 uppercase block">
            VICE CITY REGISTRATION ID
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-3xl sm:text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#35D9FF] via-[#FF2D8D] to-[#FFE8C7] filter drop-shadow-[0_0_15px_rgba(53,217,255,0.4)]">
              {registrationNumber}
            </span>
            <button
              onClick={copyToClipboard}
              title="Copy Registration ID"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-zinc-300 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          {copied && (
            <p className="text-xs font-mono font-bold text-emerald-400">
              COPIED TO CLIPBOARD!
            </p>
          )}
          <p className="text-[11px] font-mono text-zinc-400">
            SAVE THIS ID FOR CHECK-IN & SATELLITE TELEMETRY VERIFICATION
          </p>
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-xs font-mono font-bold text-amber-400">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span>STATUS: PENDING SQUAD VERIFICATION</span>
        </div>

        {/* Crew Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left font-mono text-xs">
          <div className="rounded-xl border border-white/10 bg-[#08070D]/60 p-4 space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-zinc-400 uppercase">
              <Users className="h-3.5 w-3.5 text-[#FF2D8D]" />
              <span>CREW NAME</span>
            </div>
            <p className="font-bold text-white truncate">{formData.teamName}</p>
            <p className="text-[10px] text-zinc-400">{formData.members.length} Members</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#08070D]/60 p-4 space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-zinc-400 uppercase">
              <Bot className="h-3.5 w-3.5 text-[#35D9FF]" />
              <span>MACHINE</span>
            </div>
            <p className="font-bold text-white truncate">{formData.robotName || "Custom Chassis"}</p>
            <p className="text-[10px] text-zinc-400">Pilot: {formData.captainName}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#08070D]/60 p-4 space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-zinc-400 uppercase">
              <Trophy className="h-3.5 w-3.5 text-[#FFE8C7]" />
              <span>HEIST POOL</span>
            </div>
            <p className="font-bold text-[#FFE8C7] truncate">₹12,000</p>
            <p className="text-[10px] text-emerald-400 font-bold">100% Free Entry</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Link
            href="/leaderboard"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF2D8D] to-[#FF7A3D] py-4 text-xs font-mono font-black uppercase tracking-wider text-white shadow-[0_0_25px_rgba(255,45,141,0.4)] hover:scale-[1.02] transition-transform"
          >
            <span>VIEW MOST WANTED LEADERBOARD</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            onClick={onReset}
            className="rounded-xl border border-white/15 bg-white/5 px-6 py-4 text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            REGISTER ANOTHER CREW
          </button>
        </div>
      </div>
    </div>
  );
}
