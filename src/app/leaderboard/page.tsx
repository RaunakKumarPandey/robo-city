import { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert, RefreshCw, ArrowLeft, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Leaderboard // Standings Under Audit | RoboVerse'26",
  description: "Official scores are currently undergoing compilation and audit.",
};

export default function LeaderboardPage() {
  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-16 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF2A85]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-[#FF6B35]/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Radar / Shield Icon */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FF2A85] blur-xl opacity-50 animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl border border-white/15 bg-[#0D0B18]/90 backdrop-blur-xl flex items-center justify-center shadow-[0_0_30px_rgba(255,107,53,0.3)]">
            <Lock className="w-9 h-9 text-[#FF6B35]" />
          </div>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono text-[11px] font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          Official Notice // Standings Under Audit
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-wider font-mono mb-4">
          Scores Under Compilation
        </h1>

        {/* Message */}
        <p className="text-sm sm:text-base text-gray-400 font-mono leading-relaxed mb-8">
          The arena leaderboard is currently locked while round scores and timings are being officially audited and verified by the RoboVerse &apos;26 Organizing Team.
          <br /><br />
          <span className="text-white/80 font-bold">
            Live standings will be published once verification is completed.
          </span>
        </p>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FF2A85] text-white font-mono text-xs font-black tracking-widest uppercase shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:scale-105 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
