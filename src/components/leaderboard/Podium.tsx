"use client";

import { LeaderboardEntry } from "@/types/database";
import { Trophy, Crown, Medal, Flame, Zap } from "lucide-react";

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
    <div className="relative mx-auto my-8 max-w-4xl px-2 sm:px-4">
      {/* Background Aura */}
      <div className="pointer-events-none absolute inset-0 -top-10 flex justify-center opacity-30">
        <div className="h-64 w-96 rounded-full bg-gradient-to-r from-[#FF2D8D] via-[#FF7A3D] to-[#35D9FF] blur-[110px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-center">
        {/* 2ND PLACE (SILVER / ORANGE) */}
        {second && (
          <div
            onClick={() => onSelectTeam(second)}
            className="group order-2 sm:order-1 flex w-full sm:w-1/3 flex-col items-center rounded-2xl border border-[#FF7A3D]/40 bg-[#120B20]/85 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-[#FF7A3D] hover:shadow-[0_0_30px_rgba(255,122,61,0.4)] cursor-pointer shadow-lg"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FF7A3D]/20 text-[#FF7A3D] border border-[#FF7A3D]/40 mb-3 shadow-[0_0_15px_rgba(255,122,61,0.3)]">
              <Medal className="h-5 w-5" />
            </div>
            <span className="font-mono text-xs font-black tracking-widest text-[#FF7A3D]">
              #02
            </span>
            <h3 className="mt-1 text-center font-black uppercase tracking-tight text-white text-base truncate max-w-full">
              {second.team_name}
            </h3>
            {(second.leader_name || second.members?.[0]?.name) && (
              <span className="text-[11px] font-mono text-zinc-400 font-normal truncate max-w-full">
                Captain: <span className="text-zinc-200">{second.leader_name || second.members?.[0]?.name}</span>
              </span>
            )}
            <div className="mt-4 rounded-full border border-[#FF7A3D]/40 bg-[#FF7A3D]/15 px-3.5 py-1 font-mono text-xs font-black text-[#FF7A3D] shadow-sm">
              XP {second.total_score}
            </div>
          </div>
        )}

        {/* 1ST PLACE (GOLD / CHAMPION) */}
        {first && (
          <div
            onClick={() => onSelectTeam(first)}
            className="group order-1 sm:order-2 flex w-full sm:w-1/3 flex-col items-center rounded-2xl border-2 border-[#FFE8C7] bg-gradient-to-b from-[#1E1233]/95 to-[#08070D]/95 p-7 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_0_45px_rgba(255,232,199,0.5)] cursor-pointer shadow-[0_0_30px_rgba(255,45,141,0.3)]"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#FFE8C7] via-[#FF7A3D] to-[#FF2D8D] text-black mb-3 shadow-[0_0_25px_rgba(255,232,199,0.7)]">
              <Crown className="h-7 w-7 fill-current" />
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-[#FFE8C7]/20 border border-[#FFE8C7]/60 px-3 py-0.5 text-[10px] font-mono font-black tracking-widest text-[#FFE8C7] uppercase mb-1 shadow-[0_0_10px_rgba(255,232,199,0.4)]">
              ★ MOST WANTED
            </div>
            <span className="font-mono text-sm font-black tracking-widest text-[#FFE8C7]">
              #01
            </span>
            <h3 className="mt-1 text-center font-black uppercase tracking-tight text-white text-lg truncate max-w-full">
              {first.team_name}
            </h3>
            {(first.leader_name || first.members?.[0]?.name) && (
              <span className="text-[11px] font-mono text-zinc-300 font-normal truncate max-w-full">
                Captain: <span className="text-[#35D9FF] font-semibold">{first.leader_name || first.members?.[0]?.name}</span>
              </span>
            )}
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#35D9FF]/50 bg-[#35D9FF]/20 px-4 py-1.5 font-mono text-sm font-black text-[#35D9FF] shadow-[0_0_20px_rgba(53,217,255,0.4)]">
              <Trophy className="h-4 w-4" />
              <span>XP {first.total_score}</span>
            </div>
          </div>
        )}

        {/* 3RD PLACE (CYAN / BLUE) */}
        {third && (
          <div
            onClick={() => onSelectTeam(third)}
            className="group order-3 sm:order-3 flex w-full sm:w-1/3 flex-col items-center rounded-2xl border border-[#35D9FF]/40 bg-[#120B20]/85 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-[#35D9FF] hover:shadow-[0_0_30px_rgba(53,217,255,0.4)] cursor-pointer shadow-lg"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#35D9FF]/20 text-[#35D9FF] border border-[#35D9FF]/40 mb-3 shadow-[0_0_15px_rgba(53,217,255,0.3)]">
              <Medal className="h-5 w-5" />
            </div>
            <span className="font-mono text-xs font-black tracking-widest text-[#35D9FF]">
              #03
            </span>
            <h3 className="mt-1 text-center font-black uppercase tracking-tight text-white text-base truncate max-w-full">
              {third.team_name}
            </h3>
            {(third.leader_name || third.members?.[0]?.name) && (
              <span className="text-[11px] font-mono text-zinc-400 font-normal truncate max-w-full">
                Captain: <span className="text-zinc-200">{third.leader_name || third.members?.[0]?.name}</span>
              </span>
            )}
            <div className="mt-4 rounded-full border border-[#35D9FF]/40 bg-[#35D9FF]/15 px-3.5 py-1 font-mono text-xs font-black text-[#35D9FF] shadow-sm">
              XP {third.total_score}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
