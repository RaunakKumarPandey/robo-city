"use client";

import { useState, useMemo } from "react";
import { LeaderboardEntry } from "@/types/database";
import { Search, Trophy, Filter, Eye, X, Bot, Clock, Sparkles } from "lucide-react";

interface LeaderboardTableProps {
  teams: LeaderboardEntry[];
  recentlyUpdatedId: string | null;
}

export default function LeaderboardTable({
  teams,
  recentlyUpdatedId,
}: LeaderboardTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "top10">("all");
  const [inspectingTeam, setInspectingTeam] = useState<LeaderboardEntry | null>(null);

  // Filter & Search computation
  const displayedTeams = useMemo(() => {
    let list = teams.filter((t) =>
      t.team_name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    if (filterMode === "top10") {
      list = list.slice(0, 10);
    }

    return list;
  }, [teams, searchQuery, filterMode]);

  const getRankBadge = (rank: number) => {
    const formatted = `#${String(rank).padStart(2, "0")}`;
    if (rank === 1) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#FFAA00]/20 border border-[#FFAA00]/60 px-2.5 py-0.5 font-mono text-xs font-black text-[#FFAA00] shadow-[0_0_12px_rgba(255,170,0,0.35)]">
          {formatted}
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#FF6B35]/20 border border-[#FF6B35]/60 px-2.5 py-0.5 font-mono text-xs font-black text-[#FF6B35] shadow-[0_0_10px_rgba(255,107,53,0.3)]">
          {formatted}
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#00F0FF]/20 border border-[#00F0FF]/60 px-2.5 py-0.5 font-mono text-xs font-black text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.3)]">
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
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teams..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-3.5 text-xs text-white placeholder-zinc-500 backdrop-blur-sm transition-colors focus:border-[#00F0FF] focus:outline-none"
          />
        </div>

        {/* Filter Toggle Buttons */}
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#0A0718] p-1 text-xs font-mono">
          <button
            onClick={() => setFilterMode("all")}
            className={`rounded-md px-3.5 py-1 font-bold uppercase transition-colors cursor-pointer ${
              filterMode === "all"
                ? "bg-[#00F0FF]/20 text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            ALL TEAMS ({teams.length})
          </button>
          <button
            onClick={() => setFilterMode("top10")}
            className={`rounded-md px-3.5 py-1 font-bold uppercase transition-colors cursor-pointer ${
              filterMode === "top10"
                ? "bg-[#FF2A85]/20 text-[#FF2A85] shadow-[0_0_10px_rgba(255,42,133,0.3)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            TOP 10
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden overflow-hidden rounded-xl border border-white/10 bg-[#0A0718]/85 backdrop-blur-md md:block shadow-[0_0_30px_rgba(0,0,0,0.6)]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="border-b border-white/10 bg-white/5 text-zinc-400 uppercase tracking-widest">
            <tr>
              <th className="py-4 px-4 font-bold w-20">RANK</th>
              <th className="py-4 px-4 font-bold">TEAM</th>
              <th className="py-4 px-4 font-bold text-center">R1</th>
              <th className="py-4 px-4 font-bold text-center">R2</th>
              <th className="py-4 px-4 font-bold text-center">R3</th>
              <th className="py-4 px-4 font-bold text-center text-[#00F0FF]">TOTAL</th>
              <th className="py-4 px-4 text-right font-bold w-24">INSPECT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-zinc-300">
            {displayedTeams.map((team) => {
              const isRecentlyUpdated = recentlyUpdatedId === team.id;
              return (
                <tr
                  key={team.id}
                  onClick={() => setInspectingTeam(team)}
                  className={`group transition-all duration-300 hover:bg-white/[0.04] cursor-pointer ${
                    isRecentlyUpdated
                      ? "bg-[#00F0FF]/15 shadow-[0_0_20px_rgba(0,240,255,0.25)] animate-pulse"
                      : ""
                  }`}
                >
                  {/* Rank */}
                  <td className="py-4 px-4 font-bold">
                    {getRankBadge(team.rank)}
                  </td>

                  {/* Team */}
                  <td className="py-4 px-4 font-bold text-white font-sans text-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF2A85]/10 text-[#FF2A85] text-xs font-mono font-black border border-[#FF2A85]/20 group-hover:scale-105 transition-transform">
                        {team.team_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="group-hover:text-[#00F0FF] transition-colors">
                        {team.team_name}
                      </span>
                    </div>
                  </td>

                  {/* R1 */}
                  <td className="py-4 px-4 text-center font-mono">
                    <span
                      className={`rounded px-2.5 py-1 ${
                        team.round1_score > 0
                          ? "bg-white/5 text-white font-bold"
                          : "text-zinc-600"
                      }`}
                    >
                      {team.round1_score}
                    </span>
                  </td>

                  {/* R2 */}
                  <td className="py-4 px-4 text-center font-mono">
                    <span
                      className={`rounded px-2.5 py-1 ${
                        team.round2_score > 0
                          ? "bg-white/5 text-white font-bold"
                          : "text-zinc-600"
                      }`}
                    >
                      {team.round2_score}
                    </span>
                  </td>

                  {/* R3 */}
                  <td className="py-4 px-4 text-center font-mono">
                    <span
                      className={`rounded px-2.5 py-1 ${
                        team.round3_score > 0
                          ? "bg-white/5 text-white font-bold"
                          : "text-zinc-600"
                      }`}
                    >
                      {team.round3_score}
                    </span>
                  </td>

                  {/* Total */}
                  <td className="py-4 px-4 text-center font-bold font-mono">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/10 px-3 py-1 text-sm text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.2)]">
                      <Trophy className="h-3.5 w-3.5" />
                      <span>{team.total_score} PTS</span>
                    </span>
                  </td>

                  {/* Inspect Action */}
                  <td className="py-4 px-4 text-right">
                    <div className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-mono text-zinc-400 group-hover:border-[#00F0FF]/40 group-hover:text-white transition-colors">
                      <Eye className="h-3 w-3" />
                      <span>VIEW</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card List */}
      <div className="grid grid-cols-1 gap-3.5 md:hidden">
        {displayedTeams.map((team) => {
          const isRecentlyUpdated = recentlyUpdatedId === team.id;
          return (
            <div
              key={team.id}
              onClick={() => setInspectingTeam(team)}
              className={`rounded-xl border border-white/10 bg-[#0A0718]/90 p-4 backdrop-blur-md space-y-3 transition-all cursor-pointer ${
                isRecentlyUpdated
                  ? "border-[#00F0FF] bg-[#00F0FF]/10 shadow-[0_0_20px_rgba(0,240,255,0.25)]"
                  : ""
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getRankBadge(team.rank)}
                  <h3 className="font-black text-white text-base truncate max-w-[200px]">
                    {team.team_name}
                  </h3>
                </div>

                <span className="font-mono text-sm font-black text-[#00F0FF]">
                  {team.total_score} PTS
                </span>
              </div>

              {/* Score Chips */}
              <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                <div className="rounded border border-white/5 bg-black/40 p-2">
                  <span className="text-[10px] text-zinc-400 block">R1</span>
                  <span className="font-bold text-white">{team.round1_score}</span>
                </div>
                <div className="rounded border border-white/5 bg-black/40 p-2">
                  <span className="text-[10px] text-zinc-400 block">R2</span>
                  <span className="font-bold text-white">{team.round2_score}</span>
                </div>
                <div className="rounded border border-white/5 bg-black/40 p-2">
                  <span className="text-[10px] text-zinc-400 block">R3</span>
                  <span className="font-bold text-white">{team.round3_score}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TEAM DETAILS INSPECTION MODAL (READ ONLY) */}
      {/* ========================================================================= */}
      {inspectingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0A0718] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <span className="font-mono text-xs font-bold text-[#00F0FF] uppercase">
                  RANK #{String(inspectingTeam.rank).padStart(2, "0")} // DOSSIER
                </span>
                <h2 className="text-xl font-black uppercase text-white tracking-tight">
                  {inspectingTeam.team_name}
                </h2>
              </div>
              <button
                onClick={() => setInspectingTeam(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Media Asset Preview */}
              {inspectingTeam.robot_image_url && (
                <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-center">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase block mb-1">
                    ROBOT ASSET
                  </span>
                  <p className="text-xs text-zinc-400 break-all font-mono">
                    {inspectingTeam.robot_image_url}
                  </p>
                </div>
              )}

              {/* Tournament Scores Breakdown */}
              <div className="rounded-xl border border-[#00F0FF]/30 bg-[#00F0FF]/5 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#00F0FF]/20 pb-2">
                  <span className="font-mono text-xs font-black text-[#00F0FF] uppercase">
                    COMPETITION STANDINGS
                  </span>
                  <Trophy className="h-4 w-4 text-[#00F0FF]" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="rounded bg-black/40 p-2.5">
                    <span className="text-[10px] text-zinc-400 uppercase block">ROUND 1</span>
                    <span className="font-bold text-white text-base">
                      {inspectingTeam.round1_score}
                    </span>
                  </div>
                  <div className="rounded bg-black/40 p-2.5">
                    <span className="text-[10px] text-zinc-400 uppercase block">ROUND 2</span>
                    <span className="font-bold text-white text-base">
                      {inspectingTeam.round2_score}
                    </span>
                  </div>
                  <div className="rounded bg-black/40 p-2.5">
                    <span className="text-[10px] text-zinc-400 uppercase block">ROUND 3</span>
                    <span className="font-bold text-white text-base">
                      {inspectingTeam.round3_score}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-[#00F0FF]/15 border border-[#00F0FF]/40 p-3 flex items-center justify-between font-mono">
                  <span className="text-xs font-bold text-zinc-300 uppercase">
                    OFFICIAL TOTAL
                  </span>
                  <span className="text-xl font-black text-[#00F0FF]">
                    {inspectingTeam.total_score} PTS
                  </span>
                </div>
              </div>

              {/* Timestamp */}
              {inspectingTeam.updated_at && (
                <div className="flex items-center justify-center gap-1.5 font-mono text-[11px] text-zinc-500">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Last Updated:{" "}
                    {new Date(inspectingTeam.updated_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setInspectingTeam(null)}
                className="rounded-lg border border-white/10 bg-white/5 px-5 py-2 text-xs font-mono font-bold text-zinc-300 uppercase hover:bg-white/10 cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
