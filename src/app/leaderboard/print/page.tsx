"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { fetchLeaderboardData } from "@/lib/leaderboard";
import { LeaderboardEntry } from "@/types/database";
import { compareRound2ArenaTeams, formatSecondsToReadable } from "@/lib/scoringUtils";
import { Printer, ArrowLeft, Download, Filter, CheckCircle2, AlertTriangle, Shield, RefreshCw } from "lucide-react";

export default function LeaderboardPrintPage() {
  const [teams, setTeams] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "qualified" | "evaluated" | "not_qualified">("all");
  const [printDate, setPrintDate] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLeaderboardData();
      if (Array.isArray(data) && data.length > 0) {
        setTeams(data);
      } else {
        setError("No leaderboard records found in database.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load leaderboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const now = new Date();
    setPrintDate(
      now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) +
        ", " +
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
    );
  }, []);

  // Sort qualified teams by Arena performance (lowest time first), then un-qualified
  const rankedTeams = useMemo(() => {
    const qualified = teams.filter((t) => t.screening_status === "qualified");
    const notQualified = teams.filter((t) => t.screening_status === "not_qualified");

    const sortedQualified = [...qualified].sort((a, b) => {
      const aR2 = a.round2_details;
      const bR2 = b.round2_details;

      return compareRound2ArenaTeams(
        {
          overall_time_seconds: aR2?.overall_time_seconds ?? a.round2_score,
          viva_marks: aR2?.viva_marks ?? 0,
          completion_time_seconds: aR2?.completion_time_seconds ?? (aR2?.time_taken_seconds ?? 0),
          skip_penalties: aR2?.skip_penalties ?? 0,
          touch_penalties: aR2?.touch_penalties ?? aR2?.hand_touches ?? 0,
          team_name: a.team_name,
          id: a.id,
        },
        {
          overall_time_seconds: bR2?.overall_time_seconds ?? b.round2_score,
          viva_marks: bR2?.viva_marks ?? 0,
          completion_time_seconds: bR2?.completion_time_seconds ?? (bR2?.time_taken_seconds ?? 0),
          skip_penalties: bR2?.skip_penalties ?? 0,
          touch_penalties: bR2?.touch_penalties ?? bR2?.hand_touches ?? 0,
          team_name: b.team_name,
          id: b.id,
        }
      );
    });

    const rankedQual = sortedQualified.map((t, idx) => ({ ...t, rank: idx + 1 }));
    const rankedNotQual = notQualified.map((t, idx) => ({ ...t, rank: rankedQual.length + idx + 1 }));

    return [...rankedQual, ...rankedNotQual];
  }, [teams]);

  // Apply chosen filter
  const displayedTeams = useMemo(() => {
    if (filterMode === "qualified") {
      return rankedTeams.filter((t) => t.screening_status === "qualified");
    }
    if (filterMode === "not_qualified") {
      return rankedTeams.filter((t) => t.screening_status === "not_qualified");
    }
    if (filterMode === "evaluated") {
      return rankedTeams.filter(
        (t) => t.round2_score > 0 || (t.round2_details && (t.round2_details.overall_time_seconds ?? 0) > 0)
      );
    }
    return rankedTeams;
  }, [rankedTeams, filterMode]);

  const stats = useMemo(() => {
    const total = teams.length;
    const qualified = teams.filter((t) => t.screening_status === "qualified").length;
    const notQualified = teams.filter((t) => t.screening_status === "not_qualified").length;
    const evaluated = teams.filter(
      (t) => t.round2_score > 0 || (t.round2_details && (t.round2_details.overall_time_seconds ?? 0) > 0)
    ).length;
    return { total, qualified, notQualified, evaluated };
  }, [teams]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans print:p-0 print:m-0">
      {/* 1. TOP ACTION BAR (Hidden in print) */}
      <header className="sticky top-0 z-50 bg-[#0E0C18] border-b border-white/10 px-4 py-3 shadow-xl print:hidden text-white">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono font-bold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Leaderboard</span>
            </Link>
            <div className="h-4 w-[1px] bg-white/20 hidden sm:block" />
            <span className="font-mono text-xs text-zinc-300 font-semibold hidden sm:inline">
              ROBO CITY // PDF & Print Station
            </span>
          </div>

          {/* Filter options */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-400 font-mono flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            <div className="inline-flex rounded-lg bg-black/40 p-1 border border-white/10 text-xs font-mono">
              <button
                onClick={() => setFilterMode("all")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterMode === "all" ? "bg-[#35D9FF] text-black font-bold" : "text-zinc-400 hover:text-white"
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilterMode("evaluated")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterMode === "evaluated" ? "bg-[#35D9FF] text-black font-bold" : "text-zinc-400 hover:text-white"
                }`}
              >
                Evaluated ({stats.evaluated})
              </button>
              <button
                onClick={() => setFilterMode("qualified")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterMode === "qualified" ? "bg-emerald-500 text-black font-bold" : "text-zinc-400 hover:text-white"
                }`}
              >
                Qualified ({stats.qualified})
              </button>
              <button
                onClick={() => setFilterMode("not_qualified")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterMode === "not_qualified" ? "bg-red-500 text-white font-bold" : "text-zinc-400 hover:text-white"
                }`}
              >
                Not Qualified ({stats.notQualified})
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#FF7A3D] to-[#FF2D8D] text-white font-mono text-xs font-black tracking-wider shadow-lg shadow-[#FF2D8D]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT / SAVE AS PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. PRINT DOCUMENT CONTAINER */}
      <main className="max-w-6xl mx-auto p-4 sm:p-8 print:p-0 print:max-w-none">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin text-[#FF7A3D]" />
            <p className="font-mono text-sm text-zinc-500 uppercase tracking-widest">
              Preparing official tournament report...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 text-center border border-red-300 rounded-xl bg-red-50 text-red-700 space-y-3">
            <AlertTriangle className="w-8 h-8 mx-auto text-red-600" />
            <h2 className="font-bold text-lg">Unable to generate print document</h2>
            <p className="text-sm">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* OFFICIAL LETTERHEAD */}
            <div className="border-b-2 border-zinc-900 pb-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded border border-zinc-400 bg-zinc-100 font-mono text-[11px] font-black tracking-widest uppercase text-zinc-800 mb-2">
                    IEEE STUDENT BRANCH • MMMUT GORAKHPUR
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-950 font-mono">
                    ROBO CITY // ROBOVERSE &apos;26
                  </h1>
                  <p className="text-sm font-semibold uppercase tracking-wider text-zinc-600 font-mono mt-0.5">
                    Official Grand Prix & Arena Standings Report
                  </p>
                </div>

                <div className="text-right font-mono text-xs text-zinc-600 space-y-1">
                  <div>
                    <strong className="text-zinc-900">DATE & TIME:</strong> {printDate}
                  </div>
                  <div>
                    <strong className="text-zinc-900">AUTHORITY:</strong> IEEE-SB MMMUT
                  </div>
                  <div className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                    STATUS: VERIFIED & AUDITED
                  </div>
                </div>
              </div>

              {/* STATS TILES (COMPACT) */}
              <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-zinc-200 font-mono text-center">
                <div className="p-2 rounded bg-zinc-50 border border-zinc-200">
                  <div className="text-[10px] uppercase text-zinc-500 font-bold">Total Registered</div>
                  <div className="text-base font-black text-zinc-900">{stats.total}</div>
                </div>
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                  <div className="text-[10px] uppercase text-emerald-700 font-bold">Qualified Teams</div>
                  <div className="text-base font-black text-emerald-800">{stats.qualified}</div>
                </div>
                <div className="p-2 rounded bg-blue-50 border border-blue-200">
                  <div className="text-[10px] uppercase text-blue-700 font-bold">Evaluated Teams</div>
                  <div className="text-base font-black text-blue-900">{stats.evaluated}</div>
                </div>
                <div className="p-2 rounded bg-red-50 border border-red-200">
                  <div className="text-[10px] uppercase text-red-700 font-bold">Not Qualified</div>
                  <div className="text-base font-black text-red-800">{stats.notQualified}</div>
                </div>
              </div>
            </div>

            {/* LEADERBOARD TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-900 text-white font-mono uppercase tracking-wider text-[11px]">
                    <th className="py-2 px-2.5 text-center w-12 border border-zinc-700">Rank</th>
                    <th className="py-2 px-3 border border-zinc-700">Team Name</th>
                    <th className="py-2 px-3 border border-zinc-700">Leader / Captain</th>
                    <th className="py-2 px-2 text-center border border-zinc-700">Status</th>
                    <th className="py-2 px-2.5 text-right border border-zinc-700">R1 Viva</th>
                    <th className="py-2 px-2.5 text-right border border-zinc-700">R2 Track Time</th>
                    <th className="py-2 px-2.5 text-center border border-zinc-700">R2 Penalties</th>
                    <th className="py-2 px-3 text-right border border-zinc-700 bg-zinc-800">R2 Arena Net</th>
                    <th className="py-2 px-3 text-right border border-zinc-700">Grand Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-mono">
                  {displayedTeams.map((team, index) => {
                    const isQualified = team.screening_status === "qualified";
                    const r2 = team.round2_details;
                    const r1Score = team.round1_score ?? 0;
                    const r2Score = team.round2_score ?? 0;
                    const totalScore = team.total_score ?? 0;

                    // Compute penalties display
                    const skips = r2?.skip_penalties ?? 0;
                    const touches = r2?.touch_penalties ?? r2?.hand_touches ?? 0;
                    const penaltiesText = skips > 0 || touches > 0 ? `S:${skips} T:${touches}` : "—";

                    // Compute track run time display
                    const runSeconds = r2?.completion_time_seconds ?? r2?.time_taken_seconds ?? 0;
                    const runFormatted =
                      runSeconds > 0
                        ? formatSecondsToReadable(runSeconds)
                        : r2?.completion_time && r2.completion_time !== "00:00"
                        ? r2.completion_time
                        : "—";

                    // Arena Net time
                    const arenaTime = r2?.overall_time_seconds ?? r2Score;
                    const arenaFormatted = arenaTime > 0 ? `${arenaTime.toFixed(1)}s` : "0.0s";

                    // Row styling
                    const rowBg =
                      index % 2 === 0
                        ? "bg-white"
                        : "bg-zinc-50/80";
                    const rankHighlight =
                      isQualified && team.rank === 1
                        ? "bg-amber-100/60 font-bold"
                        : isQualified && team.rank === 2
                        ? "bg-slate-100/80 font-bold"
                        : isQualified && team.rank === 3
                        ? "bg-orange-100/60 font-bold"
                        : "";

                    return (
                      <tr key={team.id || team.team_name} className={`${rowBg} ${rankHighlight} border-b border-zinc-200 page-break-inside-avoid`}>
                        {/* Rank */}
                        <td className="py-2 px-2 text-center font-bold text-zinc-900 border-x border-zinc-200">
                          {isQualified ? `#${team.rank}` : <span className="text-red-600 font-bold">NQ</span>}
                        </td>

                        {/* Team Name */}
                        <td className="py-2 px-3 font-bold text-zinc-950 border-r border-zinc-200">
                          {team.team_name}
                        </td>

                        {/* Leader Name */}
                        <td className="py-2 px-3 text-zinc-700 border-r border-zinc-200 truncate max-w-[160px]">
                          {team.leader_name || "—"}
                        </td>

                        {/* Status */}
                        <td className="py-2 px-2 text-center border-r border-zinc-200">
                          {isQualified ? (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              QUALIFIED
                            </span>
                          ) : (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                              NOT QUALIFIED
                            </span>
                          )}
                        </td>

                        {/* Round 1 */}
                        <td className="py-2 px-2.5 text-right text-zinc-800 border-r border-zinc-200">
                          {r1Score > 0 ? r1Score.toFixed(1) : "—"}
                        </td>

                        {/* Track Run Time */}
                        <td className="py-2 px-2.5 text-right text-zinc-800 border-r border-zinc-200">
                          {runFormatted}
                        </td>

                        {/* Penalties */}
                        <td className="py-2 px-2 text-center text-zinc-700 border-r border-zinc-200">
                          {penaltiesText}
                        </td>

                        {/* R2 Arena Net Time / Score */}
                        <td className="py-2 px-3 text-right font-bold text-zinc-950 bg-zinc-100/60 border-r border-zinc-200">
                          {arenaFormatted}
                        </td>

                        {/* Total Score */}
                        <td className="py-2 px-3 text-right font-black text-zinc-950 border-r border-zinc-200">
                          {totalScore.toFixed(1)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* OFFICIAL VERIFICATION & SIGN-OFF FOOTER */}
            <div className="pt-12 border-t-2 border-zinc-900 mt-12 page-break-inside-avoid">
              <div className="grid grid-cols-3 gap-8 text-center font-mono text-xs text-zinc-700">
                <div>
                  <div className="border-b border-zinc-400 pb-12 mb-2" />
                  <div className="font-bold text-zinc-900">Event Coordinator</div>
                  <div className="text-[10px] text-zinc-500">RoboVerse &apos;26 Organizing Team</div>
                </div>

                <div>
                  <div className="border-b border-zinc-400 pb-12 mb-2" />
                  <div className="font-bold text-zinc-900">Technical Head</div>
                  <div className="text-[10px] text-zinc-500">IEEE Student Branch MMMUT</div>
                </div>

                <div>
                  <div className="border-b border-zinc-400 pb-12 mb-2" />
                  <div className="font-bold text-zinc-900">Branch Counselor / Faculty Advisor</div>
                  <div className="text-[10px] text-zinc-500">MMMUT Gorakhpur</div>
                </div>
              </div>

              <div className="mt-8 text-center font-mono text-[10px] text-zinc-500 border-t border-zinc-200 pt-3">
                Official document generated by ROBO CITY // ROBOVERSE &apos;26 Standings Engine • IEEE Student Branch, Madan Mohan Malaviya University of Technology, Gorakhpur.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
