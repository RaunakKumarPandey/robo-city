"use client";

import { useState, useMemo } from "react";
import { LeaderboardEntry } from "@/types/database";
import {
  Search,
  Trophy,
  Eye,
  X,
  Clock,
  Zap,
  Crosshair,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Timer,
  Layers,
  Sparkles,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

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
  const [modalActiveTab, setModalActiveTab] = useState<"overview" | "round1" | "round2" | "round3">("overview");

  // Filter teams by search query
  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return teams;
    return teams.filter(
      (t) =>
        (t.team_name || "").toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (t.leader_name || "").toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [teams, searchQuery]);

  const qualifiedTeams = useMemo(
    () => filteredTeams.filter((t) => t.screening_status === "qualified"),
    [filteredTeams]
  );

  const notQualifiedTeams = useMemo(
    () => filteredTeams.filter((t) => t.screening_status === "not_qualified"),
    [filteredTeams]
  );

  const getRankBadge = (rank: number, isQualified: boolean) => {
    if (!isQualified) {
      return (
        <span className="inline-flex items-center rounded-lg bg-red-500/10 border border-red-500/30 font-mono text-[10px] font-black text-red-400 px-2 py-0.5">
          NQ
        </span>
      );
    }

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

  const handleOpenRoundModal = (
    team: LeaderboardEntry,
    tab: "overview" | "round1" | "round2" | "round3"
  ) => {
    setInspectingTeam(team);
    setModalActiveTab(tab);
  };

  return (
    <div className="space-y-6">
      {/* Search Toolbar & Crew Counters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search syndicate or captain..."
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

        {/* Counter Pills */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-400 backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="font-bold">QUALIFIED: {qualifiedTeams.length}</span>
          </div>

          {notQualifiedTeams.length > 0 && (
            <div className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-red-400 backdrop-blur-md">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span className="font-bold">NOT QUALIFIED: {notQualifiedTeams.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <table className="w-full text-left text-xs font-mono border-separate border-spacing-y-2.5">
          <thead className="text-zinc-400 uppercase tracking-widest text-[11px]">
            <tr>
              <th className="py-2 px-3 font-bold w-14">RANK</th>
              <th className="py-2 px-3 font-bold">CREW / SYNDICATE</th>
              <th className="py-2 px-3 font-bold text-center">STATUS</th>
              <th className="py-2 px-3 font-bold text-center">ROUND 1</th>
              <th className="py-2 px-3 font-bold text-center">ROUND 2 TOTAL</th>
              <th className="py-2 px-3 font-bold text-center">ROUND 3 TOTAL</th>
              <th className="py-2 px-3 font-bold text-center text-[#FF6B35]">OVERALL C.T</th>
              <th className="py-2 px-3 font-bold text-center text-[#35D9FF]">OVERALL TOTAL</th>
              <th className="py-2 px-3 font-bold text-center w-16">INTEL</th>
            </tr>
          </thead>
          <tbody>
            {/* 1. QUALIFIED TEAMS (TOP OF LEADERBOARD) */}
            {qualifiedTeams.map((team) => {
              const isUpdated = recentlyUpdatedId === team.id;
              const r2 = team.round2_details;
              const r3 = team.round3_details;
              const overallTime = team.overall_time || "00:00";

              return (
                <tr
                  key={team.id}
                  className={`group transition-all duration-200 bg-gradient-to-r from-[#160E2E]/85 via-[#120B20]/90 to-[#160E2E]/85 backdrop-blur-xl hover:from-[#1E133D] hover:via-[#191033] hover:to-[#1E133D] shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(53,217,255,0.2)] ${
                    isUpdated ? "bg-[#35D9FF]/20 ring-1 ring-[#35D9FF] animate-pulse" : ""
                  }`}
                >
                  {/* Rank */}
                  <td className="py-3.5 px-3 rounded-l-2xl border-y border-l border-white/10 group-hover:border-[#35D9FF]/40">
                    {getRankBadge(team.rank, true)}
                  </td>

                  {/* Crew & Captain */}
                  <td className="py-3.5 px-3 border-y border-white/10 group-hover:border-[#35D9FF]/40">
                    <div className="font-bold text-white text-sm group-hover:text-[#FFE8C7] transition-colors">
                      {team.team_name}
                    </div>
                    {(team.leader_name || team.members?.[0]?.name) && (
                      <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                        Cap:{" "}
                        <span className="text-zinc-300 font-semibold">
                          {team.leader_name || team.members?.[0]?.name}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Status: Quiz & Kit buyer */}
                  <td className="py-3.5 px-3 text-center border-y border-white/10 group-hover:border-[#35D9FF]/40">
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                      <ShieldCheck className="h-3 w-3" />
                      <span>QUALIFIED</span>
                    </span>
                  </td>

                  {/* Round 1: Viva & Bot Assembly */}
                  <td className="py-3.5 px-3 text-center border-y border-white/10 group-hover:border-[#35D9FF]/40">
                    <button
                      onClick={() => handleOpenRoundModal(team, "round1")}
                      title="Inspect Round 1 Viva"
                      className="cursor-pointer"
                    >
                      {team.round1_status === "qualified" ? (
                        <span className="rounded bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          QUALIFIED
                        </span>
                      ) : team.round1_status === "not_qualified" ? (
                        <span className="rounded bg-red-500/20 border border-red-500/40 px-2 py-0.5 text-[10px] font-bold text-red-400">
                          NOT QUALIFIED
                        </span>
                      ) : (
                        <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-zinc-400">
                          PENDING
                        </span>
                      )}
                    </button>
                  </td>

                  {/* Round 2 Total: First Arena Marks (Clickable) */}
                  <td className="py-3.5 px-3 text-center border-y border-white/10 group-hover:border-[#35D9FF]/40">
                    <button
                      onClick={() => handleOpenRoundModal(team, "round2")}
                      title="Click to view First Arena details (Time, Marks, Penalties)"
                      className="inline-flex flex-col items-center rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 transition-all hover:border-[#FF7A3D] hover:bg-[#FF7A3D]/10 cursor-pointer shadow-sm"
                    >
                      <span className="font-bold text-white text-xs text-[#FF7A3D]">
                        {team.round2_score} PTS
                      </span>
                      {r2 && (
                        <span className="text-[9px] text-zinc-400">
                          {r2.completion_time !== "00:00" ? r2.completion_time : "Time"} &bull; -{r2.penalty_total}p
                        </span>
                      )}
                    </button>
                  </td>

                  {/* Round 3 Total: Second Arena Marks (3 Stages Clickable) */}
                  <td className="py-3.5 px-3 text-center border-y border-white/10 group-hover:border-[#35D9FF]/40">
                    <button
                      onClick={() => handleOpenRoundModal(team, "round3")}
                      title="Click to view Second Arena details (3 Stages breakdown)"
                      className="inline-flex flex-col items-center rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 transition-all hover:border-[#35D9FF] hover:bg-[#35D9FF]/10 cursor-pointer shadow-sm"
                    >
                      <span className="font-bold text-white text-xs text-[#35D9FF]">
                        {team.round3_score} PTS
                      </span>
                      {r3?.stages && (
                        <span className="text-[9px] text-zinc-400 flex items-center gap-0.5">
                          3 Stages
                        </span>
                      )}
                    </button>
                  </td>

                  {/* Overall C.T (Sum of 2nd & 3rd Round Completion Time) */}
                  <td className="py-3.5 px-3 text-center border-y border-white/10 group-hover:border-[#35D9FF]/40">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-black/40 border border-white/10 px-2.5 py-1 text-xs font-mono font-bold text-zinc-200">
                      <Timer className="h-3 w-3 text-[#FF6B35]" />
                      <span>{overallTime !== "00:00" ? overallTime : "00:00"}</span>
                    </span>
                  </td>

                  {/* Overall Total (Round 2 Total + Round 3 Total) */}
                  <td className="py-3.5 px-3 text-center border-y border-white/10 group-hover:border-[#35D9FF]/40">
                    <span className="font-black text-sm text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D8D] via-[#FF7A3D] to-[#35D9FF]">
                      {team.total_score} XP
                    </span>
                  </td>

                  {/* Action Intel Button */}
                  <td className="py-3.5 px-3 text-center rounded-r-2xl border-y border-r border-white/10 group-hover:border-[#35D9FF]/40">
                    <button
                      onClick={() => handleOpenRoundModal(team, "overview")}
                      title="Inspect Full Team Dossier"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:border-[#35D9FF] hover:bg-[#35D9FF]/15 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}

            {/* 2. NOT QUALIFIED TEAMS SECTION (BOTTOM OF LEADERBOARD) */}
            {notQualifiedTeams.length > 0 && (
              <>
                <tr>
                  <td colSpan={9} className="py-3 px-2">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-red-500/20" />
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-red-400/80">
                        &bull; NOT QUALIFIED CREWS (SCREENING PENDING) &bull;
                      </span>
                      <div className="h-px flex-1 bg-red-500/20" />
                    </div>
                  </td>
                </tr>

                {notQualifiedTeams.map((team) => (
                  <tr
                    key={team.id}
                    className="group transition-all duration-200 bg-red-950/15 border-dashed border-red-500/20 backdrop-blur-md opacity-75 hover:opacity-100"
                  >
                    {/* Rank */}
                    <td className="py-3 px-3 rounded-l-2xl border-y border-l border-red-500/20">
                      {getRankBadge(team.rank, false)}
                    </td>

                    {/* Crew Name */}
                    <td className="py-3 px-3 border-y border-red-500/20">
                      <div className="font-bold text-white/80 text-sm">
                        {team.team_name}
                      </div>
                      {(team.leader_name || team.members?.[0]?.name) && (
                        <div className="text-[10px] font-mono text-zinc-500">
                          Cap: {team.leader_name || team.members?.[0]?.name}
                        </div>
                      )}
                    </td>

                    {/* Status: Not Qualified */}
                    <td className="py-3 px-3 text-center border-y border-red-500/20">
                      <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400">
                        <ShieldAlert className="h-3 w-3" />
                        <span>NOT QUALIFIED</span>
                      </span>
                    </td>

                    {/* Locked Tournament Rounds */}
                    <td colSpan={3} className="py-3 px-3 text-center border-y border-red-500/20 text-zinc-500 text-[11px] font-mono">
                      <span className="inline-flex items-center gap-1.5 text-zinc-500">
                        <Lock className="h-3 w-3" />
                        <span>ROUNDS LOCKED (EVENT SCREENING REQUIRED)</span>
                      </span>
                    </td>

                    {/* Overall C.T */}
                    <td className="py-3 px-3 text-center border-y border-red-500/20 text-zinc-600 font-mono">
                      —
                    </td>

                    {/* XP */}
                    <td className="py-3 px-3 text-center border-y border-red-500/20 text-zinc-600 font-bold">
                      —
                    </td>

                    {/* Intel */}
                    <td className="py-3 px-3 text-center rounded-r-2xl border-y border-r border-red-500/20">
                      <button
                        onClick={() => handleOpenRoundModal(team, "overview")}
                        title="View Team Info"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-500 hover:text-white transition-all cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {/* Qualified */}
        {qualifiedTeams.map((team) => (
          <div
            key={team.id}
            onClick={() => handleOpenRoundModal(team, "overview")}
            className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#160E2E]/90 to-[#120B20]/90 p-4 font-mono shadow-lg cursor-pointer hover:border-[#35D9FF]/50 transition-all backdrop-blur-xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getRankBadge(team.rank, true)}
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
                <div className="text-[10px] text-zinc-400 flex items-center justify-end gap-1 mt-0.5">
                  <Timer className="h-2.5 w-2.5 text-[#FF6B35]" />
                  <span>C.T: {team.overall_time || "00:00"}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded bg-black/40 p-1.5 border border-white/5">
                <span className="text-[9px] text-zinc-400 block">R1 VIVA</span>
                <span className="font-bold text-emerald-400 text-[10px] uppercase">
                  {team.round1_status || "PENDING"}
                </span>
              </div>
              <div className="rounded bg-black/40 p-1.5 border border-white/5">
                <span className="text-[9px] text-zinc-400 block">R2 ARENA 1</span>
                <span className="font-bold text-[#FF7A3D] text-[11px]">
                  {team.round2_score} PTS
                </span>
              </div>
              <div className="rounded bg-black/40 p-1.5 border border-white/5">
                <span className="text-[9px] text-zinc-400 block">R3 ARENA 2</span>
                <span className="font-bold text-[#35D9FF] text-[11px]">
                  {team.round3_score} PTS
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Not Qualified Mobile */}
        {notQualifiedTeams.map((team) => (
          <div
            key={team.id}
            onClick={() => handleOpenRoundModal(team, "overview")}
            className="rounded-2xl border border-red-500/20 bg-red-950/15 p-4 font-mono shadow-md backdrop-blur-md opacity-80 space-y-2 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getRankBadge(team.rank, false)}
                <div>
                  <div className="font-bold text-white/90 text-sm">
                    {team.team_name}
                  </div>
                  <span className="text-[10px] text-red-400 font-bold">
                    NOT QUALIFIED (SCREENING PENDING)
                  </span>
                </div>
              </div>
              <span className="text-xs text-zinc-500 font-bold">—</span>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE ROUND & TELEMETRY DOSSIER MODAL */}
      {/* ========================================================================= */}
      {inspectingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl border border-white/15 bg-gradient-to-b from-[#160E2E] to-[#0A0714] p-6 shadow-[0_0_60px_rgba(0,0,0,0.95)] max-h-[90vh] overflow-y-auto my-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="font-mono text-[10px] font-bold tracking-widest text-[#35D9FF] uppercase flex items-center gap-1.5">
                  <Crosshair className="h-3 w-3 text-[#FF2D8D]" />
                  <span>CREW TELEMETRY &amp; ARENA DOSSIER</span>
                </div>
                <h3 className="font-mono text-xl sm:text-2xl font-black text-white">
                  {inspectingTeam.team_name}
                </h3>
                {(inspectingTeam.leader_name || inspectingTeam.members?.[0]?.name) && (
                  <p className="text-xs font-mono text-zinc-400">
                    Captain:{" "}
                    <span className="text-[#35D9FF] font-semibold">
                      {inspectingTeam.leader_name || inspectingTeam.members?.[0]?.name}
                    </span>
                  </p>
                )}
              </div>
              <button
                onClick={() => setInspectingTeam(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-white/10 pb-3 font-mono text-xs">
              <button
                onClick={() => setModalActiveTab("overview")}
                className={`rounded-lg px-3 py-1.5 font-bold uppercase transition-all cursor-pointer ${
                  modalActiveTab === "overview"
                    ? "bg-[#FF2D8D] text-white shadow-[0_0_12px_rgba(255,45,141,0.3)]"
                    : "bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                OVERVIEW
              </button>

              <button
                onClick={() => setModalActiveTab("round1")}
                className={`rounded-lg px-3 py-1.5 font-bold uppercase transition-all cursor-pointer ${
                  modalActiveTab === "round1"
                    ? "bg-[#FF6B35] text-white shadow-[0_0_12px_rgba(255,107,53,0.3)]"
                    : "bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                R1 VIVA
              </button>

              <button
                onClick={() => setModalActiveTab("round2")}
                className={`rounded-lg px-3 py-1.5 font-bold uppercase transition-all cursor-pointer ${
                  modalActiveTab === "round2"
                    ? "bg-[#FF7A3D] text-white shadow-[0_0_12px_rgba(255,122,61,0.3)]"
                    : "bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                R2 FIRST ARENA
              </button>

              <button
                onClick={() => setModalActiveTab("round3")}
                className={`rounded-lg px-3 py-1.5 font-bold uppercase transition-all cursor-pointer ${
                  modalActiveTab === "round3"
                    ? "bg-[#35D9FF] text-black shadow-[0_0_12px_rgba(53,217,255,0.3)]"
                    : "bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                R3 SECOND ARENA (3 STAGES)
              </button>
            </div>

            {/* TAB: OVERVIEW */}
            {modalActiveTab === "overview" && (
              <div className="space-y-4 font-mono">
                {/* Screening Status Banner */}
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#08070D] p-3.5">
                  <div className="flex items-center gap-2">
                    {inspectingTeam.screening_status === "qualified" ? (
                      <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="h-5 w-5 text-red-400" />
                    )}
                    <div>
                      <div className="text-[10px] text-zinc-400 uppercase">EVENT SCREENING (QUIZ &amp; KIT)</div>
                      <div className="font-bold text-sm text-white">
                        {inspectingTeam.screening_status === "qualified" ? "QUALIFIED" : "NOT QUALIFIED"}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      inspectingTeam.screening_status === "qualified"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-red-500/20 text-red-400 border border-red-500/40"
                    }`}
                  >
                    {inspectingTeam.screening_status === "qualified" ? "CLEARED" : "LOCKED"}
                  </span>
                </div>

                {/* 3 Rounds Summary Cards */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  {/* R1 */}
                  <div className="rounded-xl border border-white/10 bg-[#08070D] p-3.5">
                    <div className="text-[10px] text-zinc-400">R1 VIVA</div>
                    <div className="mt-1 text-xs font-black uppercase text-emerald-400">
                      {inspectingTeam.screening_status === "not_qualified"
                        ? "LOCKED"
                        : inspectingTeam.round1_status === "qualified"
                        ? "QUALIFIED"
                        : inspectingTeam.round1_status === "not_qualified"
                        ? "NOT QUALIFIED"
                        : "PENDING"}
                    </div>
                  </div>

                  {/* R2 */}
                  <div className="rounded-xl border border-white/10 bg-[#08070D] p-3.5">
                    <div className="text-[10px] text-zinc-400">R2 ARENA 1</div>
                    <div className="mt-1 text-base font-black text-[#FF7A3D]">
                      {inspectingTeam.screening_status === "not_qualified"
                        ? "—"
                        : `${inspectingTeam.round2_score} pts`}
                    </div>
                    {inspectingTeam.round2_details?.completion_time && (
                      <div className="text-[9px] text-zinc-500 mt-0.5">
                        Time: {inspectingTeam.round2_details.completion_time}
                      </div>
                    )}
                  </div>

                  {/* R3 */}
                  <div className="rounded-xl border border-white/10 bg-[#08070D] p-3.5">
                    <div className="text-[10px] text-zinc-400">R3 ARENA 2</div>
                    <div className="mt-1 text-base font-black text-[#35D9FF]">
                      {inspectingTeam.screening_status === "not_qualified"
                        ? "—"
                        : `${inspectingTeam.round3_score} pts`}
                    </div>
                    <div className="text-[9px] text-zinc-500 mt-0.5">
                      3 Stages Sum
                    </div>
                  </div>
                </div>

                {/* Overall C.T Card */}
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#08070D] p-3.5">
                  <div className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-[#FF6B35]" />
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase block">
                        TOTAL COMPLETION TIME (SUM OF R2 + R3 STAGES)
                      </span>
                      <span className="font-bold text-sm text-white">
                        {inspectingTeam.screening_status === "qualified"
                          ? inspectingTeam.overall_time || "00:00"
                          : "—"}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">
                    R2 ({inspectingTeam.round2_details?.completion_time || "00:00"}) + R3 Stages
                  </span>
                </div>

                {/* Grand Total XP Callout */}
                <div className="rounded-xl border border-[#35D9FF]/40 bg-gradient-to-r from-[#FF2D8D]/15 to-[#35D9FF]/15 p-5 text-center shadow-[0_0_25px_rgba(53,217,255,0.15)]">
                  <div className="text-xs text-zinc-300 uppercase tracking-widest">
                    OVERALL TOTAL (ROUND 2 TOTAL + ROUND 3 TOTAL)
                  </div>
                  <div className="mt-2 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D8D] via-[#FF7A3D] to-[#35D9FF]">
                    {inspectingTeam.total_score} XP
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Rank #{inspectingTeam.rank} on Global Leaderboard
                  </p>
                </div>
              </div>
            )}

            {/* TAB: ROUND 1 (VIVA & BOT) */}
            {modalActiveTab === "round1" && (
              <div className="space-y-4 font-mono">
                <div className="rounded-xl border border-white/10 bg-[#08070D] p-4 space-y-3">
                  <div className="text-xs font-bold text-[#FF6B35] uppercase">
                    ROUND 1: VIVA &amp; BOT ASSEMBLING
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Evaluates mechanical assembly accuracy, wire safety, component integration, and technical viva responses.
                  </p>

                  <div className="rounded-lg border border-white/10 bg-black/40 p-3 flex items-center justify-between">
                    <span className="text-xs text-zinc-400">EVALUATION RESULT:</span>
                    <span
                      className={`font-black text-xs uppercase px-2.5 py-1 rounded ${
                        inspectingTeam.round1_status === "qualified"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : inspectingTeam.round1_status === "not_qualified"
                          ? "bg-red-500/20 text-red-400 border border-red-500/40"
                          : "bg-white/10 text-zinc-300"
                      }`}
                    >
                      {inspectingTeam.round1_status === "qualified"
                        ? "QUALIFIED"
                        : inspectingTeam.round1_status === "not_qualified"
                        ? "NOT QUALIFIED"
                        : "PENDING EVALUATION"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ROUND 2 (FIRST ARENA MARKS BREAKDOWN) */}
            {modalActiveTab === "round2" && (
              <div className="space-y-4 font-mono">
                <div className="rounded-xl border border-white/10 bg-[#08070D] p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-bold text-[#FF7A3D] uppercase">
                      ROUND 2: FIRST ARENA SCORING TABLE
                    </span>
                    <span className="font-black text-sm text-[#FF7A3D]">
                      TOTAL: {inspectingTeam.round2_score} PTS
                    </span>
                  </div>

                  {/* Standard Parameter Table as specified */}
                  <div className="overflow-hidden rounded-lg border border-white/10 bg-black/40">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 text-zinc-400 uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">PARAMETER</th>
                          <th className="py-2.5 px-3 text-right">VALUE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-zinc-300">
                        <tr>
                          <td className="py-2 px-3 text-zinc-400">Completion Time</td>
                          <td className="py-2 px-3 text-right font-bold text-white">
                            {inspectingTeam.round2_details?.completion_time || "00:00"}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-zinc-400">Gain Marks</td>
                          <td className="py-2 px-3 text-right font-bold text-[#00F0FF]">
                            {inspectingTeam.round2_details?.gain_marks ?? inspectingTeam.round2_score}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-zinc-400">Full Marks / Maximum Score</td>
                          <td className="py-2 px-3 text-right font-bold text-white">
                            {inspectingTeam.round2_details?.max_marks ?? 100}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-zinc-400">Number of Penalties</td>
                          <td className="py-2 px-3 text-right font-bold text-red-400">
                            {inspectingTeam.round2_details?.penalty_count ?? 0}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-zinc-400">Negative Marks per Penalty</td>
                          <td className="py-2 px-3 text-right font-bold text-red-400">
                            {inspectingTeam.round2_details?.penalty_rate ?? 5}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-zinc-400">Total Penalty Marks</td>
                          <td className="py-2 px-3 text-right font-bold text-red-400">
                            {inspectingTeam.round2_details?.penalty_total ?? 0}
                          </td>
                        </tr>
                        <tr className="bg-[#FF7A3D]/10 font-bold">
                          <td className="py-2.5 px-3 text-[#FF7A3D]">ROUND 2 TOTAL MARKS</td>
                          <td className="py-2.5 px-3 text-right text-base text-[#FF7A3D]">
                            {inspectingTeam.round2_score}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Calculation Formula Note */}
                  <div className="rounded-lg border border-[#FF7A3D]/30 bg-[#FF7A3D]/5 p-3 text-xs text-zinc-300 space-y-1">
                    <span className="font-bold text-white block">Formula Calculation:</span>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      Gain Marks ({inspectingTeam.round2_details?.gain_marks ?? inspectingTeam.round2_score}) &minus; (Number of Penalties ({inspectingTeam.round2_details?.penalty_count ?? 0}) &times; Negative per Penalty ({inspectingTeam.round2_details?.penalty_rate ?? 5})) = <strong className="text-[#FF7A3D]">{inspectingTeam.round2_score} Total</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ROUND 3 (SECOND ARENA - 3 STAGES) */}
            {modalActiveTab === "round3" && (
              <div className="space-y-4 font-mono">
                <div className="rounded-xl border border-white/10 bg-[#08070D] p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-bold text-[#35D9FF] uppercase">
                      ROUND 3: SECOND ARENA (3 STAGES BREAKDOWN)
                    </span>
                    <span className="font-black text-sm text-[#35D9FF]">
                      ROUND 3 TOTAL: {inspectingTeam.round3_score}
                    </span>
                  </div>

                  {/* 3 Stages Table */}
                  <div className="overflow-hidden rounded-lg border border-white/10 bg-black/40">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 text-zinc-400 uppercase text-[10px]">
                        <tr>
                          <th className="py-2 px-2.5">STAGE</th>
                          <th className="py-2 px-2.5 text-center">TIME</th>
                          <th className="py-2 px-2.5 text-right">GAIN</th>
                          <th className="py-2 px-2.5 text-right">PENALTIES</th>
                          <th className="py-2 px-2.5 text-right">NEG/PEN</th>
                          <th className="py-2 px-2.5 text-right">STAGE TOTAL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-zinc-300">
                        {[1, 2, 3].map((stNum) => {
                          const st =
                            inspectingTeam.round3_details?.stages?.find(
                              (s) => s.stage_number === stNum
                            ) || inspectingTeam.round3_details?.stages?.[stNum - 1];

                          const gain = st?.gain_marks ?? (stNum === 1 ? inspectingTeam.round3_score : 0);
                          const time = st?.completion_time || "00:00";
                          const count = st?.penalty_count ?? 0;
                          const rate = st?.penalty_rate ?? 5;
                          const penTotal = st?.penalty_total ?? count * rate;
                          const stageTotal = st?.total_marks ?? Math.max(0, gain - penTotal);

                          return (
                            <tr key={stNum} className="hover:bg-white/[0.02]">
                              <td className="py-2 px-2.5 font-bold text-white">Stage {stNum}</td>
                              <td className="py-2 px-2.5 text-center font-mono text-zinc-400">{time}</td>
                              <td className="py-2 px-2.5 text-right font-bold text-[#00F0FF]">{gain}</td>
                              <td className="py-2 px-2.5 text-right text-red-400">{count}</td>
                              <td className="py-2 px-2.5 text-right text-red-400">{rate}</td>
                              <td className="py-2 px-2.5 text-right font-bold text-white text-sm">
                                {stageTotal}
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-[#35D9FF]/10 font-bold">
                          <td colSpan={5} className="py-2.5 px-2.5 text-[#35D9FF] uppercase">
                            ROUND 3 TOTAL (STAGE 1 + STAGE 2 + STAGE 3)
                          </td>
                          <td className="py-2.5 px-2.5 text-right text-base text-[#35D9FF]">
                            {inspectingTeam.round3_score}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Stage Calculation Breakdown List */}
                  <div className="space-y-2">
                    {[1, 2, 3].map((stNum) => {
                      const st =
                        inspectingTeam.round3_details?.stages?.find(
                          (s) => s.stage_number === stNum
                        ) || inspectingTeam.round3_details?.stages?.[stNum - 1];

                      const gain = st?.gain_marks ?? (stNum === 1 ? inspectingTeam.round3_score : 0);
                      const count = st?.penalty_count ?? 0;
                      const rate = st?.penalty_rate ?? 5;
                      const penTotal = st?.penalty_total ?? count * rate;
                      const stageTotal = st?.total_marks ?? Math.max(0, gain - penTotal);

                      return (
                        <div
                          key={stNum}
                          className="flex items-center justify-between rounded-lg bg-black/40 p-2 text-[11px] text-zinc-400 border border-white/5"
                        >
                          <span>Stage {stNum} Calculation: {gain} &minus; ({count} &times; {rate})</span>
                          <span className="font-bold text-white">= {stageTotal} pts</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-white/10 pt-4">
              <button
                onClick={() => setInspectingTeam(null)}
                className="rounded-lg border border-white/10 bg-white/5 px-5 py-2 text-xs font-mono font-bold text-zinc-300 uppercase hover:bg-white/10 cursor-pointer"
              >
                CLOSE DOSSIER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
