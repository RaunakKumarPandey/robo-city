import { LeaderboardEntry } from "@/types/database";
import { Trophy, Crown, Medal, Bot } from "lucide-react";

interface PodiumProps {
  topTeams: LeaderboardEntry[];
  onSelectTeam: (team: LeaderboardEntry) => void;
}

export default function Podium({ topTeams, onSelectTeam }: PodiumProps) {
  if (!topTeams || topTeams.length === 0) return null;

  const first = topTeams[0];
  const second = topTeams.length > 1 ? topTeams[1] : null;
  const third = topTeams.length > 2 ? topTeams[2] : null;

  return (
    <div className="relative mx-auto my-8 max-w-4xl px-4">
      {/* Background Aura */}
      <div className="pointer-events-none absolute inset-0 -top-10 flex justify-center opacity-30">
        <div className="h-64 w-96 rounded-full bg-gradient-to-r from-[#FF2A85] via-[#FFAA00] to-[#00F0FF] blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-center">
        {/* 2ND PLACE (SILVER / ORANGE) */}
        {second && (
          <div
            onClick={() => onSelectTeam(second)}
            className="group order-2 sm:order-1 flex w-full sm:w-1/3 flex-col items-center rounded-2xl border border-[#FF6B35]/40 bg-[#0A0718]/85 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-[#FF6B35] hover:shadow-[0_0_25px_rgba(255,107,53,0.35)] cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/40 mb-3 shadow-[0_0_12px_rgba(255,107,53,0.3)]">
              <Medal className="h-5 w-5" />
            </div>
            <span className="font-mono text-xs font-black tracking-widest text-[#FF6B35]">
              #02
            </span>
            <h3 className="mt-1 text-center font-black uppercase tracking-tight text-white text-base truncate max-w-full">
              {second.team_name}
            </h3>
            {second.leader_name && (
              <span className="text-[11px] font-mono text-zinc-400 font-normal truncate max-w-full">
                Lead: <span className="text-zinc-200">{second.leader_name}</span>
              </span>
            )}
            <div className="mt-3 rounded-full border border-[#FF6B35]/30 bg-[#FF6B35]/10 px-3 py-1 font-mono text-xs font-bold text-[#FF6B35]">
              {second.total_score} PTS
            </div>
          </div>
        )}

        {/* 1ST PLACE (GOLD / CHAMPION - HIGHEST VISUAL EMPHASIS) */}
        {first && (
          <div
            onClick={() => onSelectTeam(first)}
            className="group order-1 sm:order-2 flex w-full sm:w-1/3 flex-col items-center rounded-2xl border-2 border-[#FFAA00] bg-gradient-to-b from-[#1C142E]/90 to-[#0A0718]/95 p-6 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_0_35px_rgba(255,170,0,0.45)] cursor-pointer shadow-[0_0_25px_rgba(255,170,0,0.2)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#FFAA00] to-[#FF2A85] text-black mb-3 shadow-[0_0_20px_rgba(255,170,0,0.6)]">
              <Crown className="h-6 w-6 fill-current" />
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-[#FFAA00]/20 border border-[#FFAA00]/50 px-2.5 py-0.5 text-[10px] font-mono font-black tracking-widest text-[#FFAA00] uppercase mb-1">
              CHAMPION
            </div>
            <span className="font-mono text-sm font-black tracking-widest text-[#FFAA00]">
              #01
            </span>
            <h3 className="mt-1 text-center font-black uppercase tracking-tight text-white text-lg truncate max-w-full">
              {first.team_name}
            </h3>
            {first.leader_name && (
              <span className="text-[11px] font-mono text-zinc-300 font-normal truncate max-w-full">
                Lead: <span className="text-[#00F0FF] font-medium">{first.leader_name}</span>
              </span>
            )}
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#00F0FF]/40 bg-[#00F0FF]/15 px-4 py-1.5 font-mono text-sm font-black text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Trophy className="h-4 w-4" />
              <span>{first.total_score} PTS</span>
            </div>
          </div>
        )}

        {/* 3RD PLACE (BRONZE / PURPLE / CYAN) */}
        {third && (
          <div
            onClick={() => onSelectTeam(third)}
            className="group order-3 sm:order-3 flex w-full sm:w-1/3 flex-col items-center rounded-2xl border border-[#00F0FF]/40 bg-[#0A0718]/85 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-[#00F0FF] hover:shadow-[0_0_25px_rgba(0,240,255,0.35)] cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 mb-3 shadow-[0_0_12px_rgba(0,240,255,0.3)]">
              <Medal className="h-5 w-5" />
            </div>
            <span className="font-mono text-xs font-black tracking-widest text-[#00F0FF]">
              #03
            </span>
            <h3 className="mt-1 text-center font-black uppercase tracking-tight text-white text-base truncate max-w-full">
              {third.team_name}
            </h3>
            {third.leader_name && (
              <span className="text-[11px] font-mono text-zinc-400 font-normal truncate max-w-full">
                Lead: <span className="text-zinc-200">{third.leader_name}</span>
              </span>
            )}
            <div className="mt-3 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/10 px-3 py-1 font-mono text-xs font-bold text-[#00F0FF]">
              {third.total_score} PTS
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
