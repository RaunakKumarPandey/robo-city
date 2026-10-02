"use client";

import { useState, useMemo } from "react";
import { LeaderboardEntry } from "@/types/database";
import { Search, Trophy, Eye, X, Clock, Zap, Crosshair } from "lucide-react";

interface LeaderboardTableProps {
  teams: LeaderboardEntry[];
  recentlyUpdatedId: string | null;
}

export default function LeaderboardTable({
  teams,
  recentlyUpdatedId,
}: LeaderboardTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [inspectingTeam, setInspectingTeam] = useState<LeaderboardEntry | null>(null);

  // Search computation: displays all teams matching search query
  const displayedTeams = useMemo(() => {
    if (!searchQuery.trim()) return teams;
    return teams.filter((t) =>
      (t.team_name || "").toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [teams, searchQuery]);

  const getRankBadge = (rank: number) => {
    const formatted = `#${String(rank).padStart(2, "0")}`;
    if (rank === 1) {
      return (
        <span className="inline-flex items-center gap-1 rounded-lg bg-[#FFE8C7]/20 border border-[#FFE8C7]/60 px-2.5 py-1 font-mono text-xs font-black text-[#FFE8C7] shadow-[0_0_12px_rgba(255,232,199,0.35)]">
          {formatted}
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 rounded-lg bg-[#FF7A3D]/20 border border-[#FF7A3D]/60 px-2.5 py-1 font-mono text-xs font-black text-[#FF7A3D] shadow-[0_0_10px_rgba(255,122,61,0.3)]">
          {formatted}
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 rounded-lg bg-[#35D9FF]/20 border border-[#35D9FF]/60 px-2.5 py-1 font-mono text-xs font-black text-[#35D9FF] shadow-[0_0_10px_rgba(53,217,255,0.3)]">
          {formatted}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-lg bg-white/5 border border-white/10 font-mono text-xs font-bold text-zinc-400 px-2.5 py-1">
        {formatted}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Toolbar & Team Counter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search syndicate / team name..."
            className="w-full rounded-xl border border-white/15 bg-[#120B20]/80 py-2.5 pl-10 pr-10 font-mono text-xs text-white placeholder-zinc-500 backdrop-blur-md transition-colors focus:border-[#35D9FF] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Total Teams Pill */}
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#120B20]/80 px-4 py-2 text-xs font-mono backdrop-blur-md shadow-md">
          <span className="text-zinc-400 font-bold uppercase">SYNDICATES:</span>
          <span className="text-[#35D9FF] font-black">{displayedTeams.length} / {teams.length}</span>
        </div>
      </div>

      {/* Desktop Table View with Separated Strips and Gaps */}
      <div className="hidden md:block">
        <table className="w-full text-left text-xs font-mono border-separate border-spacing-y-2.5">
          <thead className="text-zinc-400 uppercase tracking-widest text-[11px]">
            <tr>
              <th className="py-2 px-4 font-bold w-20">RANK</th>
              <th className="py-2 px-4 font-bold">CREW / SYNDICATE</th>
              <th className="py-2 px-4 font-bold text-center">R1 BUILD</th>
              <th className="py-2 px-4 font-bold text-center">R2 RAMPAGE</th>
              <th className="py-2 px-4 font-bold text-center">R3 RUN</th>
              <th className="py-2 px-4 font-bold text-center text-[#35D9FF]">TOTAL XP</th>
              <th className="py-2 px-4 font-bold text-center w-24">INTEL</th>
            </tr>
          </thead>
          <tbody>
            {displayedTeams.map((team) => {
              const isUpdated = recentlyUpdatedId === team.id;
              return (
                <tr
                  key={team.id}
                  className={`group transition-all duration-200 bg-gradient-to-r from-[#160E2E]/85 via-[#120B20]/90 to-[#160E2E]/85 backdrop-blur-xl hover:from-[#1E133D] hover:via-[#191033] hover:to-[#1E133D] shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(53,217,255,0.2)] ${
                    isUpdated ? "bg-[#35D9FF]/20 ring-1 ring-[#35D9FF] animate-pulse" : ""
                  }`}
                >
                  {/* Rank Cell */}
                  <td className="py-3.5 px-4 rounded-l-2xl border-y border-l border-white/10 group-hover:border-[#35D9FF]/40">
                    {getRankBadge(team.rank)}
                  </td>

                  {/* Crew Name & Captain Cell */}
                  <td className="py-3.5 px-4 border-y border-white/10 group-hover:border-[#35D9FF]/40">
                    <div className="font-bold text-white text-sm group-hover:text-[#FFE8C7] transition-colors">
                      {team.team_name}
                    </div>
                    {(team.leader_name || team.members?.[0]?.name) && (
                      <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                        Cap: <span className="text-zinc-300 font-semibold">{team.leader_name || team.members?.[0]?.name}</span>
                      </div>
                    )}
                  </td>

                  {/* R1 Build */}
                  <td className="py-3.5 px-4 text-center text-zinc-300 border-y border-white/10 group-hover:border-[#35D9FF]/40">
                    {team.round1_score !== null && team.round1_score !== undefined ? team.round1_score : "—"}
                  </td>

                  {/* R2 Rampage */}
                  <td className="py-3.5 px-4 text-center text-zinc-300 border-y border-white/10 group-hover:border-[#35D9FF]/40">
                    {team.round2_score !== null && team.round2_score !== undefined ? team.round2_score : "—"}
                  </td>

                  {/* R3 Run */}
                  <td className="py-3.5 px-4 text-center text-zinc-300 border-y border-white/10 group-hover:border-[#35D9FF]/40">
                    {team.round3_score !== null && team.round3_score !== undefined ? team.round3_score : "—"}
                  </td>

                  {/* Total XP */}
                  <td className="py-3.5 px-4 text-center border-y border-white/10 group-hover:border-[#35D9FF]/40">
                    <span className="font-black text-sm text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D8D] via-[#FF7A3D] to-[#35D9FF]">
                      {team.total_score}
                    </span>
                  </td>

                  {/* Action Intel Button */}
                  <td className="py-3.5 px-4 text-center rounded-r-2xl border-y border-r border-white/10 group-hover:border-[#35D9FF]/40">
                    <button
                      onClick={() => setInspectingTeam(team)}
                      title="Inspect Team Scores"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:border-[#35D9FF] hover:bg-[#35D9FF]/15 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View with Gaps */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {displayedTeams.map((team) => (
          <div
            key={team.id}
            onClick={() => setInspectingTeam(team)}
            className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#160E2E]/90 to-[#120B20]/90 p-4 font-mono shadow-lg cursor-pointer hover:border-[#35D9FF]/50 transition-all backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getRankBadge(team.rank)}
                <div>
                  <div className="font-bold text-white text-sm">
                    {team.team_name}
                  </div>
                  {(team.leader_name || team.members?.[0]?.name) && (
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      Cap: <span className="text-zinc-300 font-semibold">{team.leader_name || team.members?.[0]?.name}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D8D] to-[#35D9FF]">
                  XP {team.total_score}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Team Inspection Modal */}
      {inspectingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-gradient-to-b from-[#160E2E] to-[#0A0714] p-6 shadow-[0_0_50px_rgba(0,0,0,0.9)] space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="font-mono text-[10px] font-bold tracking-widest text-[#35D9FF] uppercase">
                  CREW TELEMETRY DOSSIER
                </div>
                <h3 className="font-mono text-xl font-black text-white">
                  {inspectingTeam.team_name}
                </h3>
              </div>
              <button
                onClick={() => setInspectingTeam(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-white/10 bg-[#08070D] p-3 font-mono">
                <div className="text-[10px] text-zinc-400">R1 BUILD</div>
                <div className="mt-1 text-lg font-black text-white">
                  {inspectingTeam.round1_score ?? "—"}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#08070D] p-3 font-mono">
                <div className="text-[10px] text-zinc-400">R2 RAMPAGE</div>
                <div className="mt-1 text-lg font-black text-[#FF7A3D]">
                  {inspectingTeam.round2_score ?? "—"}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#08070D] p-3 font-mono">
                <div className="text-[10px] text-zinc-400">R3 RUN</div>
                <div className="mt-1 text-lg font-black text-[#35D9FF]">
                  {inspectingTeam.round3_score ?? "—"}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#35D9FF]/30 bg-[#35D9FF]/10 p-4 text-center font-mono">
              <div className="text-xs text-zinc-300">TOTAL ACCUMULATED SCORE</div>
              <div className="mt-1 text-3xl font-black text-white">
                XP {inspectingTeam.total_score}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
