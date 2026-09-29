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
        <span className="inline-flex items-center gap-1 rounded-md bg-[#FFE8C7]/20 border border-[#FFE8C7]/60 px-2.5 py-0.5 font-mono text-xs font-black text-[#FFE8C7] shadow-[0_0_12px_rgba(255,232,199,0.35)]">
          {formatted}
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#FF7A3D]/20 border border-[#FF7A3D]/60 px-2.5 py-0.5 font-mono text-xs font-black text-[#FF7A3D] shadow-[0_0_10px_rgba(255,122,61,0.3)]">
          {formatted}
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#35D9FF]/20 border border-[#35D9FF]/60 px-2.5 py-0.5 font-mono text-xs font-black text-[#35D9FF] shadow-[0_0_10px_rgba(53,217,255,0.3)]">
          {formatted}
        </span>
      );
    }
    return (
      <span className="font-mono text-xs font-bold text-zinc-400 px-2.5 py-0.5">
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
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#120B20]/80 px-4 py-2 text-xs font-mono backdrop-blur-md">
          <span className="text-zinc-400 font-bold uppercase">SYNDICATES:</span>
          <span className="text-[#35D9FF] font-black">{displayedTeams.length} / {teams.length}</span>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-[#120B20]/85 backdrop-blur-xl md:block shadow-[0_15px_40px_rgba(0,0,0,0.7)]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="border-b border-white/10 bg-white/5 text-zinc-400 uppercase tracking-widest">
            <tr>
              <th className="py-4 px-4 font-bold w-20">RANK</th>
              <th className="py-4 px-4 font-bold">CREW / SYNDICATE</th>
              <th className="py-4 px-4 font-bold text-center">R1 BUILD</th>
              <th className="py-4 px-4 font-bold text-center">R2 RAMPAGE</th>
              <th className="py-4 px-4 font-bold text-center">R3 RUN</th>
              <th className="py-4 px-4 font-bold text-center text-[#35D9FF]">TOTAL XP</th>
              <th className="py-4 px-4 font-bold text-center w-24">INTEL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {displayedTeams.map((team) => {
              const isUpdated = recentlyUpdatedId === team.id;
              return (
                <tr
                  key={team.id}
                  className={`transition-colors duration-200 hover:bg-white/5 ${
                    isUpdated ? "bg-[#35D9FF]/15 animate-pulse" : ""
                  }`}
                >
                  <td className="py-4 px-4">{getRankBadge(team.rank)}</td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-white text-sm">
                      {team.team_name}
                    </div>
                    {team.leader_name && (
                      <div className="text-[11px] text-zinc-400">
                        Cap: {team.leader_name}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center text-zinc-300">
                    {team.round1_score !== null && team.round1_score !== undefined ? team.round1_score : "—"}
                  </td>
                  <td className="py-4 px-4 text-center text-zinc-300">
                    {team.round2_score !== null && team.round2_score !== undefined ? team.round2_score : "—"}
                  </td>
                  <td className="py-4 px-4 text-center text-zinc-300">
                    {team.round3_score !== null && team.round3_score !== undefined ? team.round3_score : "—"}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-black text-sm text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D8D] to-[#35D9FF]">
                      {team.total_score}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => setInspectingTeam(team)}
                      title="Inspect Team Scores"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:border-[#35D9FF] hover:bg-[#35D9FF]/10 hover:text-white transition-colors cursor-pointer"
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

      {/* Mobile Cards View */}
      <div className="grid grid-cols-1 gap-3.5 md:hidden">
        {displayedTeams.map((team) => (
          <div
            key={team.id}
            onClick={() => setInspectingTeam(team)}
            className="rounded-xl border border-white/10 bg-[#120B20]/90 p-4 font-mono shadow-md cursor-pointer hover:border-[#35D9FF]/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {getRankBadge(team.rank)}
                <div>
                  <div className="font-bold text-white text-sm">
                    {team.team_name}
                  </div>
                  {team.leader_name && (
                    <div className="text-[10px] text-zinc-400">
                      Cap: {team.leader_name}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-base font-black text-[#35D9FF]">
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
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#120B20] p-6 shadow-2xl space-y-6">
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
