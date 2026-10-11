import { Metadata } from "next";
import { Lock, Shield, Cpu, Activity, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "RoboVerse '26 // Portal Under Audit",
  description: "Official competition portal is temporarily under compilation and audit.",
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden bg-[#07060B]">
      {/* Background Cyber Ambient Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-[#FF2A85]/20 via-[#35D9FF]/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#FF6B35]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="relative z-10 max-w-xl w-full text-center">
        {/* IEEE + ROBOVERSE Brand Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md mb-8">
          <div className="h-2 w-2 rounded-full bg-[#35D9FF] animate-pulse" />
          <span className="font-mono text-[11px] font-black tracking-widest text-[#35D9FF] uppercase">
            IEEE Student Branch MMMUT
          </span>
          <span className="text-white/20">|</span>
          <span className="font-mono text-[11px] font-bold tracking-widest text-white/70 uppercase">
            ROBOVERSE &apos;26
          </span>
        </div>

        {/* Lock / Security Shield Icon */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#FF2A85] to-[#FF6B35] blur-2xl opacity-40 animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl border border-white/20 bg-[#0E0C18]/90 backdrop-blur-2xl flex items-center justify-center shadow-[0_0_50px_rgba(255,42,133,0.3)]">
            <Lock className="w-11 h-11 text-[#FF6B35]" />
          </div>
        </div>

        {/* Audit Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono text-[11px] font-bold tracking-widest uppercase mb-5 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          OFFICIAL NOTICE // AUDIT & COMPILATION IN PROGRESS
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-wider font-mono mb-6 leading-tight">
          PORTAL UNDER <br />
          <span className="bg-gradient-to-r from-[#FF6B35] via-[#FF2A85] to-[#35D9FF] bg-clip-text text-transparent">
            OFFICIAL AUDIT
          </span>
        </h1>

        {/* Explanatory Message */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 mb-8 text-left space-y-4">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-[#35D9FF] mt-0.5 shrink-0" />
            <p className="text-sm text-gray-300 font-mono leading-relaxed">
              The competition portal and arena records are currently locked while round scores, track timings, and qualification statuses are being compiled and verified by the Organizing Team.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-300 font-mono leading-relaxed">
              Verified standings and arena portal access will be restored once audit compilation is completed.
            </p>
          </div>
        </div>

        {/* Technical Reference Code */}
        <div className="inline-flex items-center justify-center gap-3 px-4 py-2 rounded-lg border border-white/5 bg-black/40 font-mono text-xs text-gray-500">
          <Cpu className="w-3.5 h-3.5 text-gray-400" />
          <span>SECURITY REF: RV26-AUDIT-LOCK-V2</span>
          <span>•</span>
          <span className="text-[#35D9FF]">MMMUT GORAKHPUR</span>
        </div>
      </div>
    </div>
  );
}
