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
        <div className="h-72 w-96 rounded-full bg-gradient-to-r from-[#FF2A85] via-[#00F0FF] to-[#FFAA00] blur-[100px]" />
      </div>

      <div className="relative z-10 rounded-2xl border border-emerald-500/30 bg-[#0A0718]/95 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_0_50px_rgba(16,185,129,0.2)] text-center space-y-8">
        {/* Success Icon Badge */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.35)]">
          <CheckCircle2 className="h-9 w-9" />
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/10 px-3 py-0.5 text-[11px] font-mono font-bold tracking-widest text-[#00F0FF] uppercase">
            <Sparkles className="h-3 w-3" />
            <span>WELCOME TO ROBO CITY</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white font-mono">
            REGISTRATION SUCCESSFUL
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            YOUR CREW HAS ENTERED THE CITY.
          </p>
        </div>

        {/* Registration ID Banner */}
        <div className="rounded-xl border border-white/10 bg-black/50 p-6 space-y-3">
          <span className="text-[11px] font-mono font-bold tracking-widest text-zinc-400 uppercase block">
            REGISTRATION ID
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-3xl sm:text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#FF2A85] to-[#FFAA00] filter drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              {registrationNumber}
            </span>
            <button
              onClick={copyToClipboard}
              title="Copy Registration ID"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          {copied && (
            <p className="text-[11px] font-mono font-bold text-emerald-400">
              COPIED TO CLIPBOARD!
            </p>
          )}
          <p className="text-[11px] font-mono text-zinc-400">
            SAVE THIS REGISTRATION ID FOR CHECK-IN & TOURNAMENT VERIFICATION
          </p>
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-xs font-mono font-bold text-amber-400">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span>STATUS: PENDING APPROVAL</span>
        </div>

        {/* Crew Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left font-mono text-xs">
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3.5 space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-zinc-400 uppercase">
              <Users className="h-3 w-3 text-[#FF2A85]" />
              <span>TEAM CREW</span>
            </div>
            <p className="font-bold text-white truncate">{formData.teamName}</p>
            <p className="text-[10px] text-zinc-400">{formData.members.length} Members</p>
          </div>

          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3.5 space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-zinc-400 uppercase">
              <Bot className="h-3 w-3 text-[#00F0FF]" />
              <span>ROBOT ENTRY</span>
            </div>
            <p className="font-bold text-white truncate">{formData.robotName}</p>
            <p className="text-[10px] text-zinc-400">Rookie Bot</p>
          </div>

          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3.5 space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-zinc-400 uppercase">
              <Trophy className="h-3 w-3 text-[#FFAA00]" />
              <span>CAPTAIN</span>
            </div>
            <p className="font-bold text-white truncate">{formData.captainName}</p>
            <p className="text-[10px] text-zinc-400 truncate">{formData.captainPhone}</p>
          </div>
        </div>

        {/* Next Steps Notice */}
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4 text-xs font-mono text-zinc-400 text-left space-y-2">
          <div className="flex items-center gap-2 text-zinc-300 font-bold uppercase text-[11px]">
            <ShieldAlert className="h-3.5 w-3.5 text-[#00F0FF]" />
            <span>WHAT HAPPENS NEXT?</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            1. RoboVerse&apos;26 organizers at IEEE-SB MMMUT will verify your crew roster and bot specifications.
          </p>
          <p className="text-[11px] leading-relaxed">
            2. Once approved, your crew will be activated on the official tournament registry and score tracker.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={copyToClipboard}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-mono font-bold text-zinc-300 uppercase hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            SAVE REGISTRATION ID
          </button>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF2A85] via-[#FF6B35] to-[#FFAA00] py-3 text-xs font-mono font-black uppercase text-white shadow-[0_0_20px_rgba(255,42,133,0.35)] hover:scale-[1.02] transition-transform"
          >
            <span>BACK TO ROBO CITY</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
