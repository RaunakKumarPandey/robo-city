"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { TeamScoreItem, fetchTeamsWithScores, updateTeamScores } from "@/lib/scores";
import {
  Trophy,
  Search,
  ArrowUpDown,
  Edit3,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Users,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export default function AdminScoresPage() {
  const [teams, setTeams] = useState<TeamScoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"highest" | "lowest" | "name" | "updated">("highest");

  // Notifications
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Edit Modal State
  const [selectedTeam, setSelectedTeam] = useState<TeamScoreItem | null>(null);
  const [round1, setRound1] = useState<string>("0");
  const [round2, setRound2] = useState<string>("0");
  const [round3, setRound3] = useState<string>("0");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    setLoading(true);
    const data = await fetchTeamsWithScores();
    setTeams(data);
    setLoading(false);
  };

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  const handleOpenEditModal = (team: TeamScoreItem) => {
    setSelectedTeam(team);
    setRound1(String(team.score?.round1_score ?? 0));
    setRound2(String(team.score?.round2_score ?? 0));
    setRound3(String(team.score?.round3_score ?? 0));
    setFormError(null);
  };

  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;
    setFormError(null);

    // 1. Validation
    const r1 = parseInt(round1, 10);
    const r2 = parseInt(round2, 10);
    const r3 = parseInt(round3, 10);

    if (isNaN(r1) || isNaN(r2) || isNaN(r3)) {
      setFormError("ALL ROUND SCORES MUST BE VALID NUMBERS");
      return;
    }

    if (r1 < 0 || r2 < 0 || r3 < 0) {
      setFormError("ROUND SCORES CANNOT BE NEGATIVE");
      return;
    }

    setSubmitting(true);

    // 2. Execute secure update
    const res = await updateTeamScores(selectedTeam.id, r1, r2, r3);

    if (!res.success) {
      setFormError(res.error || "FAILED TO UPDATE SCORE");
      setSubmitting(false);
      return;
    }

    const updatedTotal = res.score?.total_score ?? r1 + r2 + r3;
    showFeedback(
      "success",
      `SCORE UPDATED FOR ${selectedTeam.team_name} (TOTAL: ${updatedTotal} PTS)`
    );

    setSubmitting(false);
    setSelectedTeam(null);
    await loadScores();
  };

  // Preview total in modal (Read only calculation preview)
  const previewTotal = useMemo(() => {
    const r1 = parseInt(round1, 10) || 0;
    const r2 = parseInt(round2, 10) || 0;
    const r3 = parseInt(round3, 10) || 0;
    return r1 >= 0 && r2 >= 0 && r3 >= 0 ? r1 + r2 + r3 : 0;
  }, [round1, round2, round3]);

  // Filtered & Sorted Teams
  const filteredTeams = useMemo(() => {
    let result = teams.filter((t) =>
      t.team_name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    if (sortBy === "highest") {
      result.sort((a, b) => (b.score?.total_score ?? 0) - (a.score?.total_score ?? 0));
    } else if (sortBy === "lowest") {
      result.sort((a, b) => (a.score?.total_score ?? 0) - (b.score?.total_score ?? 0));
    } else if (sortBy === "name") {
      result.sort((a, b) => a.team_name.localeCompare(b.team_name));
    } else if (sortBy === "updated") {
      result.sort(
        (a, b) =>
          new Date(b.score?.updated_at || b.updated_at).getTime() -
          new Date(a.score?.updated_at || a.updated_at).getTime()
      );
    }

    return result;
  }, [teams, searchQuery, sortBy]);

  return (
    <div className="space-y-8">
      {/* 1. HEADER & NOTIFICATIONS */}
      <div>
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
          <div>
            <span className="font-mono text-xs font-bold tracking-widest text-[#FF6B35] uppercase">
              ADMIN // SCORE CONTROL
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1">
              SCORE CONTROL
            </h1>
            <p className="mt-1 text-xs text-zinc-400 font-mono">
              UPDATE THE CITY&apos;S COMPETITION SCORES &middot; TOTAL IS GENERATED AUTOMATICALLY BY POSTGRESQL
            </p>
          </div>

          <button
            onClick={loadScores}
            disabled={loading}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-mono font-bold tracking-wider text-zinc-300 uppercase transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>REFRESH SCORES</span>
          </button>
        </div>

        {/* Feedback Alert Banner */}
        {feedback && (
          <div
            className={`mt-4 flex items-center gap-2.5 rounded-lg border p-3.5 text-xs font-mono font-bold tracking-wider uppercase transition-all ${
              feedback.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/40 bg-red-500/10 text-red-400"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      {/* 2. SEARCH & SORT TOOLBAR */}
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
            placeholder="Search teams by name..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-3.5 text-xs text-white placeholder-zinc-500 backdrop-blur-sm transition-colors focus:border-[#FF6B35] focus:outline-none"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-[11px] font-mono text-zinc-400 uppercase">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-white/10 bg-[#0A0718] py-1.5 px-3 text-xs text-zinc-300 focus:border-[#FF6B35] focus:outline-none"
          >
            <option value="highest">Highest Total Score</option>
            <option value="lowest">Lowest Total Score</option>
            <option value="name">Team Name (A-Z)</option>
            <option value="updated">Recently Updated</option>
          </select>
        </div>
      </div>

      {/* 3. SCORES LIST TABLE / CARDS */}
      {loading ? (
        <div className="flex h-60 flex-col items-center justify-center space-y-3">
          <Loader2 className="h-7 w-7 animate-spin text-[#FF6B35]" />
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">
            LOADING SCORES...
          </span>
        </div>
      ) : filteredTeams.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-white/10 bg-[#0A0718]/80 p-12 text-center backdrop-blur-md">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF6B35]/10 text-[#FF6B35] mb-4 shadow-[0_0_20px_rgba(255,107,53,0.2)]">
            <Trophy className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-black uppercase tracking-wider text-white font-mono">
            NO TEAMS FOUND
          </h2>
          <p className="mt-2 text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Go to the Team Garage to register teams before entering tournament scores.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/teams"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FF2A85] to-[#FF6B35] px-6 py-2.5 text-xs font-black tracking-widest text-white uppercase shadow-[0_0_15px_rgba(255,42,133,0.3)] transition-all hover:scale-105 font-mono"
            >
              <Users className="h-4 w-4" />
              <span>OPEN TEAM GARAGE</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Scoreboard Table */}
          <div className="hidden overflow-hidden rounded-xl border border-white/10 bg-[#0A0718]/80 backdrop-blur-md md:block">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-white/10 bg-white/5 text-zinc-400 uppercase tracking-widest">
                <tr>
                  <th className="py-3.5 px-4 font-bold">TEAM</th>
                  <th className="py-3.5 px-4 font-bold text-center">ROUND 1</th>
                  <th className="py-3.5 px-4 font-bold text-center">ROUND 2</th>
                  <th className="py-3.5 px-4 font-bold text-center">ROUND 3</th>
                  <th className="py-3.5 px-4 font-bold text-center text-[#00F0FF]">TOTAL</th>
                  <th className="py-3.5 px-4 font-bold text-center">LAST UPDATED</th>
                  <th className="py-3.5 px-4 text-right font-bold">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {filteredTeams.map((team) => {
                  const r1 = team.score?.round1_score ?? 0;
                  const r2 = team.score?.round2_score ?? 0;
                  const r3 = team.score?.round3_score ?? 0;
                  const total = team.score?.total_score ?? 0;
                  const updatedAt = team.score?.updated_at || team.updated_at;

                  return (
                    <tr
                      key={team.id}
                      className="transition-colors hover:bg-white/[0.02]"
                    >
                      {/* Team Name */}
                      <td className="py-4 px-4 font-bold text-white font-sans text-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FF6B35]/10 text-[#FF6B35] text-xs font-mono font-black">
                            {team.team_name.charAt(0).toUpperCase()}
                          </div>
                          <span>{team.team_name}</span>
                        </div>
                      </td>

                      {/* R1 */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`rounded px-2 py-0.5 font-mono ${
                            r1 > 0 ? "bg-white/10 text-white font-bold" : "text-zinc-500"
                          }`}
                        >
                          {r1}
                        </span>
                      </td>

                      {/* R2 */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`rounded px-2 py-0.5 font-mono ${
                            r2 > 0 ? "bg-white/10 text-white font-bold" : "text-zinc-500"
                          }`}
                        >
                          {r2}
                        </span>
                      </td>

                      {/* R3 */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`rounded px-2 py-0.5 font-mono ${
                            r3 > 0 ? "bg-white/10 text-white font-bold" : "text-zinc-500"
                          }`}
                        >
                          {r3}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-4 px-4 text-center font-bold">
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/10 px-3 py-1 font-mono text-sm text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                          <Trophy className="h-3 w-3" />
                          <span>{total} pts</span>
                        </span>
                      </td>

                      {/* Last Updated */}
                      <td className="py-4 px-4 text-center text-zinc-500 text-[11px]">
                        {updatedAt ? new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleOpenEditModal(team)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#FF6B35]/40 bg-[#FF6B35]/10 px-3 py-1.5 text-xs font-mono font-bold text-[#FF6B35] transition-all hover:bg-[#FF6B35] hover:text-white cursor-pointer uppercase"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>UPDATE</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Score Cards */}
          <div className="grid grid-cols-1 gap-3.5 md:hidden">
            {filteredTeams.map((team) => {
              const r1 = team.score?.round1_score ?? 0;
              const r2 = team.score?.round2_score ?? 0;
              const r3 = team.score?.round3_score ?? 0;
              const total = team.score?.total_score ?? 0;

              return (
                <div
                  key={team.id}
                  className="rounded-xl border border-white/10 bg-[#0A0718]/90 p-4 backdrop-blur-md space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-white text-base">
                      {team.team_name}
                    </h3>
                    <span className="font-mono text-xs font-black text-[#00F0FF]">
                      {total} pts
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                    <div className="rounded border border-white/5 bg-black/40 p-2">
                      <span className="text-[10px] text-zinc-400 block">R1</span>
                      <span className="font-bold text-white">{r1}</span>
                    </div>
                    <div className="rounded border border-white/5 bg-black/40 p-2">
                      <span className="text-[10px] text-zinc-400 block">R2</span>
                      <span className="font-bold text-white">{r2}</span>
                    </div>
                    <div className="rounded border border-white/5 bg-black/40 p-2">
                      <span className="text-[10px] text-zinc-400 block">R3</span>
                      <span className="font-bold text-white">{r3}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEditModal(team)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#FF6B35]/40 bg-[#FF6B35]/10 py-2 text-xs font-mono font-bold text-[#FF6B35] uppercase hover:bg-[#FF6B35] hover:text-white"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>UPDATE SCORE</span>
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 4. UPDATE SCORE MODAL (READ ONLY TOTAL) */}
      {/* ========================================================================= */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0A0718] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <span className="font-mono text-xs font-bold text-[#FF6B35] uppercase">
                  SCORE CONTROL // ROUND ENTRY
                </span>
                <h2 className="text-xl font-black uppercase text-white tracking-tight">
                  UPDATE SCORE
                </h2>
                <p className="mt-1 text-xs font-mono text-[#00F0FF]">
                  TEAM: {selectedTeam.team_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Message inside modal */}
            {formError && (
              <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400 font-mono">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveScore} className="space-y-4 font-mono">
              {/* Round 1 */}
              <div>
                <label className="block text-xs font-bold tracking-wider text-zinc-300 uppercase mb-1.5">
                  ROUND 1 SCORE (THE BUILD & ENDURANCE)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={round1}
                  onChange={(e) => setRound1(e.target.value)}
                  placeholder="0"
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 px-3.5 text-sm font-bold text-white focus:border-[#FF6B35] focus:outline-none"
                />
              </div>

              {/* Round 2 */}
              <div>
                <label className="block text-xs font-bold tracking-wider text-zinc-300 uppercase mb-1.5">
                  ROUND 2 SCORE (RAMPAGE & OBSTACLES)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={round2}
                  onChange={(e) => setRound2(e.target.value)}
                  placeholder="0"
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 px-3.5 text-sm font-bold text-white focus:border-[#FF6B35] focus:outline-none"
                />
              </div>

              {/* Round 3 */}
              <div>
                <label className="block text-xs font-bold tracking-wider text-zinc-300 uppercase mb-1.5">
                  ROUND 3 SCORE (OBSTACLE RUN RACE)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={round3}
                  onChange={(e) => setRound3(e.target.value)}
                  placeholder="0"
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 px-3.5 text-sm font-bold text-white focus:border-[#FF6B35] focus:outline-none"
                />
              </div>

              {/* Total Score Readout (Read Only) */}
              <div className="rounded-xl border border-[#00F0FF]/30 bg-[#00F0FF]/5 p-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase block">
                      TOTAL (READ ONLY // POSTGRESQL GENERATED)
                    </span>
                    <span className="text-2xl font-black text-[#00F0FF]">
                      {previewTotal} <span className="text-xs text-zinc-400 font-normal">PTS</span>
                    </span>
                  </div>
                  <Sparkles className="h-6 w-6 text-[#00F0FF]" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-5 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedTeam(null)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs font-bold uppercase text-zinc-400 hover:bg-white/5 cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#FF2A85] px-6 py-2 text-xs font-black tracking-widest text-white uppercase shadow-[0_0_15px_rgba(255,107,53,0.3)] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>UPDATING...</span>
                    </>
                  ) : (
                    <span>SAVE SCORE</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
