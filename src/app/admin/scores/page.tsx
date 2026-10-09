"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  TeamScoreItem,
  fetchTeamsWithScores,
  updateDetailedTeamScores,
} from "@/lib/scores";
import {
  Round2Details,
  StageDetails,
  Round3Details,
  ScoreDetails,
} from "@/types/database";
import {
  calculateRound2,
  calculateStage,
  calculateRound3,
  calculateOverallCompletionTime,
  DEFAULT_ROUND2_TOTAL_TIME,
  DEFAULT_ROUND2_PENALTY_RATE,
  DEFAULT_ROUND2_MAX_VIVA,
  DEFAULT_STAGE_MAX_MARKS,
  DEFAULT_STAGE_PENALTY_RATE,
} from "@/lib/scoringUtils";
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
  ShieldCheck,
  ShieldAlert,
  Clock,
  Timer,
  Zap,
  Target,
  ChevronRight,
  Layers,
  HelpCircle,
  Unlock,
  Lock,
} from "lucide-react";

export default function AdminScoresPage() {
  const [teams, setTeams] = useState<TeamScoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | "qualified" | "not_qualified">("all");
  const [sortBy, setSortBy] = useState<"highest" | "lowest" | "name" | "updated">("highest");

  // Notifications
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Edit Modal State
  const [selectedTeam, setSelectedTeam] = useState<TeamScoreItem | null>(null);
  const [activeTab, setActiveTab] = useState<"screening" | "round1" | "round2" | "round3">("screening");

  // Form State for Selected Team
  const [screeningStatus, setScreeningStatus] = useState<"qualified" | "not_qualified">("qualified");
  const [round1Status, setRound1Status] = useState<"qualified" | "not_qualified" | "pending">("pending");
  
  // Round 2 Form State (Formula: S = (720 - T) - H + V)
  const [round2Time, setRound2Time] = useState<string>("00:00");
  const [round2TotalTime, setRound2TotalTime] = useState<string>("720");
  const [round2VivaMarks, setRound2VivaMarks] = useState<string>("0");
  const [round2HandTouches, setRound2HandTouches] = useState<string>("0");
  const [round2PenaltyRate, setRound2PenaltyRate] = useState<string>("1");

  // Round 3 Form State (3 Stages)
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [stagesState, setStagesState] = useState<
    {
      time: string;
      maxMarks: string;
      gainMarks: string;
      penaltyRate: string;
      penaltyCount: string;
    }[]
  >([
    { time: "00:00", maxMarks: "50", gainMarks: "0", penaltyRate: "5", penaltyCount: "0" },
    { time: "00:00", maxMarks: "50", gainMarks: "0", penaltyRate: "5", penaltyCount: "0" },
    { time: "00:00", maxMarks: "50", gainMarks: "0", penaltyRate: "5", penaltyCount: "0" },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadScores();
  }, []);

  const [syncingPdf, setSyncingPdf] = useState(false);

  const loadScores = async () => {
    setLoading(true);
    const data = await fetchTeamsWithScores();
    setTeams(data);
    setLoading(false);
  };

  const handleSyncPdfQualification = async () => {
    setSyncingPdf(true);
    try {
      const res = await fetch("/api/admin/sync-qualification", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        showFeedback(
          "success",
          `PDF MATCH COMPLETE: ${json.qualified_count ?? 0} QUALIFIED, ${json.not_qualified_count ?? 0} NOT QUALIFIED`
        );
        await loadScores();
      } else {
        showFeedback("error", json.error || "FAILED TO SYNC PDF QUALIFICATION");
      }
    } catch {
      showFeedback("error", "SYNC REQUEST FAILED");
    } finally {
      setSyncingPdf(false);
    }
  };

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  // Open Edit Modal with team's current scores
  const handleOpenEditModal = (team: TeamScoreItem) => {
    setSelectedTeam(team);
    setScreeningStatus(team.screening_status || "qualified");
    setRound1Status(team.round1_status || "pending");

    // Initialize Round 2 (Boat Race: S = (720 - T) - H + V)
    const r2 = team.round2_details || team.details?.round2;
    setRound2Time(r2?.completion_time || "00:00");
    setRound2TotalTime(String(r2?.total_time ?? DEFAULT_ROUND2_TOTAL_TIME));
    setRound2VivaMarks(String(r2?.viva_marks ?? 0));
    setRound2HandTouches(String(r2?.hand_touches ?? r2?.penalty_count ?? 0));
    setRound2PenaltyRate(String(r2?.penalty_rate ?? DEFAULT_ROUND2_PENALTY_RATE));

    // Initialize Round 3 (3 Stages)
    const r3 = team.round3_details || team.details?.round3;
    const stages = r3?.stages || [];
    const initialStages = [1, 2, 3].map((num, i) => {
      const st = stages.find((s) => s.stage_number === num) || stages[i];
      return {
        time: st?.completion_time || "00:00",
        maxMarks: String(st?.max_marks ?? DEFAULT_STAGE_MAX_MARKS),
        gainMarks: String(st?.gain_marks ?? (i === 0 ? (team.score?.round3_score ?? 0) : 0)),
        penaltyRate: String(st?.penalty_rate ?? DEFAULT_STAGE_PENALTY_RATE),
        penaltyCount: String(st?.penalty_count ?? 0),
      };
    });
    setStagesState(initialStages);
    setActiveStageIndex(0);
    setActiveTab(team.screening_status === "not_qualified" ? "screening" : "round2");
    setFormError(null);
  };

  // Quick 1-click Qualify/Disqualify toggle directly from table
  const handleQuickScreeningToggle = async (team: TeamScoreItem, newStatus: "qualified" | "not_qualified") => {
    const res = await updateDetailedTeamScores({
      teamId: team.id,
      screening_status: newStatus,
      round1_status: team.round1_status || "pending",
      round2: team.round2_details || { total_time: 720, completion_time: "00:00", viva_marks: 0, hand_touches: 0, penalty_rate: 1 },
      round3: team.round3_details?.stages || [
        { stage_number: 1, max_marks: 50, gain_marks: team.score?.round3_score || 0 },
        { stage_number: 2, max_marks: 50, gain_marks: 0 },
        { stage_number: 3, max_marks: 50, gain_marks: 0 },
      ],
    });

    if (res.success) {
      showFeedback(
        "success",
        `${team.team_name.toUpperCase()} IS NOW ${newStatus === "qualified" ? "QUALIFIED" : "NOT QUALIFIED"}`
      );
      await loadScores();
    } else {
      showFeedback("error", res.error || "FAILED TO UPDATE SCREENING STATUS");
    }
  };

  // Live Calculations for Modal Preview (Round 2: S = (720 - T) - H + V)
  const computedRound2 = useMemo(() => {
    const totalTime = Math.max(0, parseFloat(round2TotalTime) || DEFAULT_ROUND2_TOTAL_TIME);
    const vivaMarks = Math.max(0, parseFloat(round2VivaMarks) || 0);
    const handTouches = Math.max(0, parseFloat(round2HandTouches) || 0);
    const penaltyRate = Math.max(0, parseFloat(round2PenaltyRate) || DEFAULT_ROUND2_PENALTY_RATE);

    return calculateRound2({
      completion_time: round2Time || "00:00",
      total_time: totalTime,
      viva_marks: vivaMarks,
      hand_touches: handTouches,
      penalty_rate: penaltyRate,
    });
  }, [round2Time, round2TotalTime, round2VivaMarks, round2HandTouches, round2PenaltyRate]);

  const computedStages = useMemo(() => {
    return stagesState.map((st, idx) => {
      const maxMarks = Math.max(0, parseFloat(st.maxMarks) || 0);
      const gainMarks = Math.max(0, parseFloat(st.gainMarks) || 0);
      const penaltyRate = Math.max(0, parseFloat(st.penaltyRate) || 0);
      const penaltyCount = Math.max(0, parseFloat(st.penaltyCount) || 0);

      return calculateStage(
        {
          completion_time: st.time || "00:00",
          max_marks: maxMarks,
          gain_marks: gainMarks,
          penalty_rate: penaltyRate,
          penalty_count: penaltyCount,
        },
        idx + 1
      );
    });
  }, [stagesState]);

  const computedRound3Total = useMemo(() => {
    return computedStages.reduce((sum, s) => sum + s.total_marks, 0);
  }, [computedStages]);

  const computedOverallTime = useMemo(() => {
    return calculateOverallCompletionTime(round2Time, computedStages);
  }, [round2Time, computedStages]);

  const computedGrandTotal = useMemo(() => {
    if (screeningStatus === "not_qualified") return 0;
    return computedRound2.total_marks + computedRound3Total;
  }, [screeningStatus, computedRound2, computedRound3Total]);

  const handleStageFieldChange = (
    index: number,
    field: "time" | "maxMarks" | "gainMarks" | "penaltyRate" | "penaltyCount",
    value: string
  ) => {
    setStagesState((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Submit Modal Update
  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;
    setFormError(null);

    setSubmitting(true);

    const payload = {
      teamId: selectedTeam.id,
      screening_status: screeningStatus,
      round1_status: round1Status,
      round1_score: round1Status === "qualified" ? 1 : 0,
      round2: computedRound2,
      round3: {
        stages: computedStages,
        total_marks: computedRound3Total,
      },
    };

    const res = await updateDetailedTeamScores(payload);

    if (!res.success) {
      setFormError(res.error || "FAILED TO UPDATE SCORE");
      setSubmitting(false);
      return;
    }

    showFeedback(
      "success",
      `SCORES UPDATED FOR ${selectedTeam.team_name} (TOTAL: ${computedGrandTotal} PTS)`
    );

    setSubmitting(false);
    setSelectedTeam(null);
    await loadScores();
  };

  // Filtered & Sorted Teams
  const filteredTeams = useMemo(() => {
    let result = teams.filter((t) => {
      const matchesSearch =
        t.team_name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (t.captain_name || "").toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (t.leader_name || "").toLowerCase().includes(searchQuery.toLowerCase().trim());

      if (!matchesSearch) return false;

      if (filterCategory === "qualified") {
        return t.screening_status === "qualified";
      }
      if (filterCategory === "not_qualified") {
        return t.screening_status === "not_qualified";
      }
      return true;
    });

    if (sortBy === "highest") {
      result.sort((a, b) => {
        if (a.screening_status !== b.screening_status) {
          return a.screening_status === "qualified" ? -1 : 1;
        }
        return (b.score?.total_score ?? 0) - (a.score?.total_score ?? 0);
      });
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
  }, [teams, searchQuery, filterCategory, sortBy]);

  const qualifiedCount = useMemo(
    () => teams.filter((t) => t.screening_status === "qualified").length,
    [teams]
  );
  const notQualifiedCount = useMemo(
    () => teams.filter((t) => t.screening_status === "not_qualified").length,
    [teams]
  );

  return (
    <div className="space-y-8">
      {/* 1. HEADER & NOTIFICATIONS */}
      <div>
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
          <div>
            <span className="font-mono text-xs font-bold tracking-widest text-[#FF6B35] uppercase">
              ADMIN // TOURNAMENT EVALUATION CONSOLE
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1">
              SCORE &amp; ROUND CONTROL
            </h1>
            <p className="mt-1 text-xs text-zinc-400 font-mono">
              MANAGE QUIZ/KIT SCREENING, VIVA &amp; BOT ASSEMBLY, FIRST ARENA &amp; SECOND ARENA (3 STAGES)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start">
            <button
              onClick={handleSyncPdfQualification}
              disabled={syncingPdf || loading}
              className="inline-flex items-center gap-2 rounded-lg border border-[#00F0FF]/40 bg-[#00F0FF]/10 px-4 py-2 text-xs font-mono font-bold tracking-wider text-[#00F0FF] uppercase transition-colors hover:bg-[#00F0FF]/20 disabled:opacity-50 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.2)]"
            >
              <Sparkles className={`h-3.5 w-3.5 ${syncingPdf ? "animate-spin" : ""}`} />
              <span>{syncingPdf ? "SYNCING PDF..." : "AUTO-SYNC PDF STATUS"}</span>
            </button>

            <button
              onClick={loadScores}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-mono font-bold tracking-wider text-zinc-300 uppercase transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>REFRESH SCORES</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {feedback && (
          <div
            className={`mt-4 flex items-center gap-2.5 rounded-lg border p-3.5 text-xs font-mono font-bold tracking-wider uppercase transition-all ${
              feedback.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
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

      {/* 2. STATS PILLS & QUICK FILTERS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total Registered */}
        <div className="rounded-xl border border-white/10 bg-[#0A0718]/80 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>TOTAL CREWS</span>
            <Users className="h-4 w-4 text-[#00F0FF]" />
          </div>
          <div className="mt-1 text-2xl font-black font-mono text-white">{teams.length}</div>
        </div>

        {/* Qualified */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-mono">
            <span>QUALIFIED (TOP)</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-1 text-2xl font-black font-mono text-emerald-400">{qualifiedCount}</div>
        </div>

        {/* Not Qualified */}
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-red-400 text-xs font-mono">
            <span>NOT QUALIFIED</span>
            <ShieldAlert className="h-4 w-4 text-red-400" />
          </div>
          <div className="mt-1 text-2xl font-black font-mono text-red-400">{notQualifiedCount}</div>
        </div>

        {/* Grand XP */}
        <div className="rounded-xl border border-[#FF6B35]/30 bg-[#FF6B35]/5 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-[#FF6B35] text-xs font-mono">
            <span>ACTIVE ARENAS</span>
            <Trophy className="h-4 w-4 text-[#FF6B35]" />
          </div>
          <div className="mt-1 text-2xl font-black font-mono text-white">R1, R2, R3</div>
        </div>
      </div>

      {/* 3. SEARCH & FILTER TOOLBAR */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Filter Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterCategory("all")}
            className={`rounded-lg px-3.5 py-1.5 font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
              filterCategory === "all"
                ? "bg-white text-black shadow-md"
                : "border border-white/10 bg-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            ALL CREWS ({teams.length})
          </button>
          <button
            onClick={() => setFilterCategory("qualified")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
              filterCategory === "qualified"
                ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>QUALIFIED ({qualifiedCount})</span>
          </button>
          <button
            onClick={() => setFilterCategory("not_qualified")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
              filterCategory === "not_qualified"
                ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                : "border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>NOT QUALIFIED ({notQualifiedCount})</span>
          </button>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <Search className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crew or captain..."
              className="w-full rounded-lg border border-white/10 bg-white/5 py-1.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 transition-colors focus:border-[#FF6B35] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <ArrowUpDown className="h-3.5 w-3.5 text-zinc-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border border-white/10 bg-[#0A0718] py-1.5 px-3 text-xs text-zinc-300 focus:border-[#FF6B35] focus:outline-none"
            >
              <option value="highest">Highest Score (Ranked)</option>
              <option value="lowest">Lowest Score</option>
              <option value="name">Team Name (A-Z)</option>
              <option value="updated">Recently Updated</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. MAIN TOURNAMENT SCORES TABLE */}
      {loading ? (
        <div className="flex h-60 flex-col items-center justify-center space-y-3">
          <Loader2 className="h-7 w-7 animate-spin text-[#FF6B35]" />
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">
            LOADING COMPETITION SCORES...
          </span>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0A0718]/80 p-12 text-center backdrop-blur-md">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF6B35]/10 text-[#FF6B35] mb-4">
            <Trophy className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-black uppercase tracking-wider text-white font-mono">
            NO CREWS FOUND
          </h2>
          <p className="mt-2 text-xs text-zinc-400 max-w-sm mx-auto">
            {searchQuery
              ? "No teams match the search criteria."
              : "Register teams in Team Garage to begin entering tournament round scores."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden overflow-hidden rounded-xl border border-white/10 bg-[#0A0718]/80 backdrop-blur-md md:block">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-white/10 bg-white/5 text-zinc-400 uppercase tracking-widest text-[11px]">
                <tr>
                  <th className="py-3.5 px-3 font-bold">CREW &amp; CAPTAIN</th>
                  <th className="py-3.5 px-3 font-bold text-center">SCREENING</th>
                  <th className="py-3.5 px-3 font-bold text-center">R1 VIVA</th>
                  <th className="py-3.5 px-3 font-bold text-center">R2 ARENA 1</th>
                  <th className="py-3.5 px-3 font-bold text-center">R3 ARENA 2</th>
                  <th className="py-3.5 px-3 font-bold text-center text-[#FF6B35]">OVERALL C.T</th>
                  <th className="py-3.5 px-3 font-bold text-center text-[#00F0FF]">TOTAL XP</th>
                  <th className="py-3.5 px-3 text-right font-bold">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {filteredTeams.map((team) => {
                  const isQualified = team.screening_status === "qualified";
                  const r1Status = team.round1_status || "pending";
                  const r2 = team.round2_details;
                  const r3 = team.round3_details;
                  const total = team.score?.total_score ?? 0;
                  const overallTime = team.overall_time || "00:00";

                  return (
                    <tr
                      key={team.id}
                      className={`transition-colors hover:bg-white/[0.02] ${
                        !isQualified ? "opacity-75 bg-red-950/10" : ""
                      }`}
                    >
                      {/* Crew Name */}
                      <td className="py-4 px-3 font-bold text-white font-sans text-sm">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-mono font-black shrink-0 ${
                              isQualified
                                ? "bg-gradient-to-br from-[#FF2A85] to-[#FF6B35] text-white shadow-sm"
                                : "bg-zinc-800 text-zinc-400 border border-white/10"
                            }`}
                          >
                            {team.team_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm flex items-center gap-2">
                              <span>{team.team_name}</span>
                              {!isQualified && (
                                <span className="rounded bg-red-500/20 border border-red-500/40 px-1.5 py-0.2 text-[10px] font-mono font-bold text-red-400 uppercase">
                                  NOT QUALIFIED
                                </span>
                              )}
                            </div>
                            {(team.captain_name || team.leader_name || team.members?.[0]?.name) && (
                              <div className="text-[11px] font-mono text-zinc-400 mt-0.5 font-normal">
                                Cap:{" "}
                                <span className="text-zinc-300 font-semibold">
                                  {team.captain_name || team.leader_name || team.members?.[0]?.name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Screening Status (Quiz & Kit) + Quick Toggle */}
                      <td className="py-4 px-3 text-center">
                        {isQualified ? (
                          <div className="inline-flex flex-col items-center gap-1">
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 font-mono shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                              <ShieldCheck className="h-3 w-3" />
                              <span>QUALIFIED</span>
                            </span>
                            <button
                              onClick={() => handleQuickScreeningToggle(team, "not_qualified")}
                              className="text-[10px] text-zinc-500 hover:text-red-400 underline cursor-pointer"
                            >
                              Set Not Qualified
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex flex-col items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-bold text-red-400 font-mono">
                              <ShieldAlert className="h-3 w-3" />
                              <span>NOT QUALIFIED</span>
                            </span>
                            <button
                              onClick={() => handleQuickScreeningToggle(team, "qualified")}
                              className="inline-flex items-center gap-1 rounded border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500 hover:text-black transition-all cursor-pointer uppercase shadow-sm"
                            >
                              <Unlock className="h-2.5 w-2.5" />
                              <span>QUALIFY TEAM</span>
                            </button>
                          </div>
                        )}
                      </td>

                      {/* R1 Viva & Bot Assembly */}
                      <td className="py-4 px-3 text-center">
                        {!isQualified ? (
                          <span className="text-zinc-600 text-[11px] font-mono flex items-center justify-center gap-1">
                            <Lock className="h-3 w-3" /> LOCKED
                          </span>
                        ) : r1Status === "qualified" ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
                            QUALIFIED
                          </span>
                        ) : r1Status === "not_qualified" ? (
                          <span className="inline-flex items-center gap-1 rounded bg-red-500/20 border border-red-500/40 px-2 py-0.5 text-[11px] font-bold text-red-400">
                            NOT QUALIFIED
                          </span>
                        ) : (
                          <span className="rounded bg-white/5 px-2 py-0.5 text-[11px] text-zinc-400">
                            PENDING
                          </span>
                        )}
                      </td>

                      {/* R2 Arena 1 */}
                      <td className="py-4 px-3 text-center">
                        {!isQualified ? (
                          <span className="text-zinc-600 text-[11px] font-mono flex items-center justify-center gap-1">
                            <Lock className="h-3 w-3" /> LOCKED
                          </span>
                        ) : (
                          <div className="inline-flex flex-col items-center">
                            <span className="font-bold text-white text-sm">
                              {r2?.total_marks ?? team.score?.round2_score ?? 0} pts
                            </span>
                            {r2 && (
                              <span className="text-[10px] text-zinc-400 font-mono">
                                {r2.completion_time !== "00:00" ? r2.completion_time : "—"} &bull; H:{r2.hand_touches ?? r2.penalty_count ?? 0} &bull; V:+{r2.viva_marks ?? 0}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* R3 Arena 2 (3 Stages) */}
                      <td className="py-4 px-3 text-center">
                        {!isQualified ? (
                          <span className="text-zinc-600 text-[11px] font-mono flex items-center justify-center gap-1">
                            <Lock className="h-3 w-3" /> LOCKED
                          </span>
                        ) : (
                          <div className="inline-flex flex-col items-center">
                            <span className="font-bold text-white text-sm">
                              {r3?.total_marks ?? team.score?.round3_score ?? 0} pts
                            </span>
                            {r3?.stages && (
                              <div className="flex items-center gap-1 mt-0.5">
                                {r3.stages.map((st, i) => (
                                  <span
                                    key={i}
                                    title={`Stage ${st.stage_number}: ${st.total_marks} pts (${st.completion_time})`}
                                    className="rounded bg-white/10 px-1 py-0.2 text-[9px] text-zinc-300 font-mono"
                                  >
                                    S{st.stage_number}:{st.total_marks}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Overall C.T */}
                      <td className="py-4 px-3 text-center">
                        {isQualified ? (
                          <span className="inline-flex items-center gap-1 rounded bg-black/40 border border-white/10 px-2 py-0.5 text-xs text-zinc-300 font-mono font-bold">
                            <Timer className="h-3 w-3 text-[#FF6B35]" />
                            <span>{overallTime}</span>
                          </span>
                        ) : (
                          <span className="text-zinc-600 font-mono">—</span>
                        )}
                      </td>

                      {/* Total Score */}
                      <td className="py-4 px-3 text-center font-bold">
                        {isQualified ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#00F0FF]/40 bg-[#00F0FF]/10 px-3 py-1 font-mono text-sm text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.25)]">
                            <Trophy className="h-3 w-3" />
                            <span>{total} pts</span>
                          </span>
                        ) : (
                          <span className="text-zinc-500 font-mono text-xs">0 pts (NQ)</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-3 text-right">
                        <button
                          onClick={() => handleOpenEditModal(team)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#FF6B35]/40 bg-[#FF6B35]/10 px-3 py-1.5 text-xs font-mono font-bold text-[#FF6B35] transition-all hover:bg-[#FF6B35] hover:text-white cursor-pointer uppercase shadow-sm"
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

          {/* Mobile Cards View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredTeams.map((team) => {
              const isQualified = team.screening_status === "qualified";
              const total = team.score?.total_score ?? 0;

              return (
                <div
                  key={team.id}
                  className={`rounded-xl border border-white/10 bg-[#0A0718]/90 p-4 backdrop-blur-md space-y-3 ${
                    !isQualified ? "border-red-500/20 bg-red-950/10" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-black text-white text-base flex items-center gap-2">
                        <span>{team.team_name}</span>
                        {!isQualified && (
                          <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-400">
                            NOT QUALIFIED
                          </span>
                        )}
                      </h3>
                      {(team.captain_name || team.leader_name || team.members?.[0]?.name) && (
                        <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                          Cap:{" "}
                          <span className="text-zinc-300 font-semibold">
                            {team.captain_name || team.leader_name || team.members?.[0]?.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-black text-[#00F0FF]">
                        {isQualified ? `${total} pts` : "NQ"}
                      </span>
                      {isQualified && (
                        <div className="text-[10px] text-zinc-400 font-mono flex items-center justify-end gap-1 mt-0.5">
                          <Timer className="h-2.5 w-2.5 text-[#FF6B35]" />
                          <span>C.T: {team.overall_time || "00:00"}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Screening pill */}
                  <div className="flex items-center justify-between border-y border-white/5 py-2 font-mono text-xs">
                    <span className="text-zinc-400">Screening:</span>
                    {isQualified ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> QUALIFIED
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-red-400 font-bold">NOT QUALIFIED</span>
                        <button
                          onClick={() => handleQuickScreeningToggle(team, "qualified")}
                          className="rounded bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] text-emerald-300 font-bold"
                        >
                          QUALIFY
                        </button>
                      </div>
                    )}
                  </div>

                  {isQualified ? (
                    <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                      <div className="rounded border border-white/5 bg-black/40 p-2">
                        <span className="text-[10px] text-zinc-400 block">R1 VIVA</span>
                        <span className="font-bold text-white text-[11px] uppercase">
                          {team.round1_status || "PENDING"}
                        </span>
                      </div>
                      <div className="rounded border border-white/5 bg-black/40 p-2">
                        <span className="text-[10px] text-zinc-400 block">R2 ARENA 1</span>
                        <span className="font-bold text-white">
                          {team.round2_details?.total_marks ?? team.score?.round2_score ?? 0}
                        </span>
                      </div>
                      <div className="rounded border border-white/5 bg-black/40 p-2">
                        <span className="text-[10px] text-zinc-400 block">R3 ARENA 2</span>
                        <span className="font-bold text-white">
                          {team.round3_details?.total_marks ?? team.score?.round3_score ?? 0}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded border border-dashed border-red-500/20 p-2 text-center font-mono text-[11px] text-zinc-400">
                      Tournament rounds 1-3 are locked until crew is marked Qualified.
                    </div>
                  )}

                  <button
                    onClick={() => handleOpenEditModal(team)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#FF6B35]/40 bg-[#FF6B35]/10 py-2 text-xs font-mono font-bold text-[#FF6B35] uppercase hover:bg-[#FF6B35] hover:text-white"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>EVALUATE &amp; UPDATE SCORE</span>
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 5. COMPREHENSIVE SCORE EVALUATION MODAL */}
      {/* ========================================================================= */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/15 bg-[#0A0718] p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.95)] max-h-[90vh] overflow-y-auto my-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <span className="font-mono text-xs font-bold text-[#FF6B35] uppercase">
                  SCORE CONTROL // TOURNAMENT EVALUATION
                </span>
                <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                  EVALUATE CREW
                </h2>
                <p className="mt-1 text-xs font-mono text-[#00F0FF]">
                  CREW: <span className="text-white font-bold">{selectedTeam.team_name}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Alert inside modal */}
            {formError && (
              <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400 font-mono">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4 mb-6 font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("screening")}
                className={`rounded-lg px-3 py-1.5 font-bold uppercase transition-all cursor-pointer ${
                  activeTab === "screening"
                    ? "bg-[#FF2A85] text-white shadow-[0_0_15px_rgba(255,42,133,0.3)]"
                    : "bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                1. SCREENING (QUIZ &amp; KIT)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("round1")}
                disabled={screeningStatus === "not_qualified"}
                className={`rounded-lg px-3 py-1.5 font-bold uppercase transition-all cursor-pointer ${
                  activeTab === "round1"
                    ? "bg-[#FF6B35] text-white shadow-[0_0_15px_rgba(255,107,53,0.3)]"
                    : screeningStatus === "not_qualified"
                    ? "bg-white/5 text-zinc-600 cursor-not-allowed opacity-50"
                    : "bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                2. R1 VIVA &amp; BOT
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("round2")}
                disabled={screeningStatus === "not_qualified"}
                className={`rounded-lg px-3 py-1.5 font-bold uppercase transition-all cursor-pointer ${
                  activeTab === "round2"
                    ? "bg-[#00F0FF] text-black shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                    : screeningStatus === "not_qualified"
                    ? "bg-white/5 text-zinc-600 cursor-not-allowed opacity-50"
                    : "bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                3. R2 ARENA 1 ({computedRound2.total_marks} PTS)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("round3")}
                disabled={screeningStatus === "not_qualified"}
                className={`rounded-lg px-3 py-1.5 font-bold uppercase transition-all cursor-pointer ${
                  activeTab === "round3"
                    ? "bg-[#8A2BE2] text-white shadow-[0_0_15px_rgba(138,43,226,0.3)]"
                    : screeningStatus === "not_qualified"
                    ? "bg-white/5 text-zinc-600 cursor-not-allowed opacity-50"
                    : "bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                4. R3 ARENA 2 ({computedRound3Total} PTS)
              </button>
            </div>

            {/* Evaluation Form */}
            <form onSubmit={handleSaveScore} className="space-y-6 font-mono">
              {/* TAB 1: SCREENING */}
              {activeTab === "screening" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <label className="block text-xs font-bold tracking-wider text-zinc-300 uppercase mb-2">
                      EVENT SELECTION // QUIZ &amp; KIT BUYER SCREENING
                    </label>
                    <p className="text-[11px] text-zinc-400 mb-4 leading-relaxed">
                      Choose whether this crew is Qualified or Not Qualified. Qualified crews appear at the top of the leaderboard and participate in Rounds 1, 2, and 3.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setScreeningStatus("qualified")}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer ${
                          screeningStatus === "qualified"
                            ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400"
                            : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
                        }`}
                      >
                        <ShieldCheck className="h-6 w-6 mb-2 text-emerald-400" />
                        <span className="font-black text-sm uppercase">QUALIFIED</span>
                        <span className="text-[10px] text-zinc-400 mt-1">Unlocks R1, R2, R3</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setScreeningStatus("not_qualified")}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer ${
                          screeningStatus === "not_qualified"
                            ? "border-red-500 bg-red-500/20 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.3)] ring-1 ring-red-400"
                            : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
                        }`}
                      >
                        <ShieldAlert className="h-6 w-6 mb-2 text-red-400" />
                        <span className="font-black text-sm uppercase">NOT QUALIFIED</span>
                        <span className="text-[10px] text-zinc-400 mt-1">Locks tournament rounds</span>
                      </button>
                    </div>
                  </div>

                  {screeningStatus === "not_qualified" && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <Lock className="h-4 w-4 shrink-0" />
                        <span>CREW IS CURRENTLY MARKED NOT QUALIFIED</span>
                      </p>
                      <p className="text-[11px] text-red-400 leading-relaxed">
                        This team will be shown at the bottom of the leaderboard. To enter marks for Arena 1 or Arena 2, switch this status back to Qualified above.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ROUND 1 (VIVA & BOT ASSEMBLING) */}
              {activeTab === "round1" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <label className="block text-xs font-bold tracking-wider text-zinc-300 uppercase mb-2">
                      ROUND 1 // VIVA &amp; BOT ASSEMBLING RESULT
                    </label>
                    <p className="text-[11px] text-zinc-400 mb-4">
                      Evaluate bot structural scrutiny, technical viva, and build readiness. Result is evaluated as Qualified or Not Qualified.
                    </p>

                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setRound1Status("qualified")}
                        className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all cursor-pointer ${
                          round1Status === "qualified"
                            ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400"
                            : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
                        }`}
                      >
                        <CheckCircle2 className="h-5 w-5 mb-1.5 text-emerald-400" />
                        <span className="font-bold text-xs">QUALIFIED</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRound1Status("not_qualified")}
                        className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all cursor-pointer ${
                          round1Status === "not_qualified"
                            ? "border-red-500 bg-red-500/20 text-red-300 ring-1 ring-red-400"
                            : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
                        }`}
                      >
                        <ShieldAlert className="h-5 w-5 mb-1.5 text-red-400" />
                        <span className="font-bold text-xs">NOT QUALIFIED</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRound1Status("pending")}
                        className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all cursor-pointer ${
                          round1Status === "pending"
                            ? "border-[#00F0FF] bg-[#00F0FF]/20 text-[#00F0FF] ring-1 ring-[#00F0FF]"
                            : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
                        }`}
                      >
                        <Clock className="h-5 w-5 mb-1.5 text-[#00F0FF]" />
                        <span className="font-bold text-xs">PENDING</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ROUND 2 (FIRST ARENA / BOAT RACE & VIVA) */}
              {activeTab === "round2" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 gap-2">
                      <div>
                        <span className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider block">
                          ROUND 2: FIRST ARENA SCORING (BOAT RACE &amp; VIVA)
                        </span>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          Formula: S = (720 &minus; T) &minus; H + V
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30 px-3 py-1 text-[11px] font-mono font-bold text-[#00F0FF]">
                        <Timer className="h-3.5 w-3.5" />
                        <span>BASE TIME: {computedRound2.total_time}s (12 MIN)</span>
                      </span>
                    </div>

                    {/* Completion Time */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold tracking-wider text-zinc-300 uppercase">
                          1. COMPLETION TIME (MM:SS or SECONDS)
                        </label>
                        <span className="text-[11px] text-[#00F0FF] font-mono">
                          T = {computedRound2.time_taken_seconds || 0}s &bull; Time Score: {computedRound2.time_score} pts
                        </span>
                      </div>
                      <input
                        type="text"
                        value={round2Time}
                        onChange={(e) => setRound2Time(e.target.value)}
                        placeholder="e.g. 09:20 or 560"
                        className="w-full rounded-lg border border-white/10 bg-black/40 py-2.5 px-3 text-xs font-bold text-white focus:border-[#00F0FF] focus:outline-none font-mono"
                      />
                      <p className="mt-1 text-[10px] text-zinc-400 font-mono">
                        Remaining time gives base score: ({computedRound2.total_time} &minus; {computedRound2.time_taken_seconds || 0}) = <strong className="text-white">{computedRound2.time_score} pts</strong>
                      </p>
                    </div>

                    {/* Viva Marks & Hand Touches */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold tracking-wider text-zinc-300 uppercase mb-1">
                          2. VIVA MARKS (V - OUT OF 10)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          value={round2VivaMarks}
                          onChange={(e) => setRound2VivaMarks(e.target.value)}
                          placeholder="8"
                          className="w-full rounded-lg border border-white/10 bg-black/40 py-2.5 px-3 text-xs font-bold text-emerald-400 focus:border-emerald-400 focus:outline-none font-mono"
                        />
                        <p className="mt-1 text-[10px] text-zinc-400 font-mono">
                          Viva marks added directly to round score (+{computedRound2.viva_marks})
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold tracking-wider text-zinc-300 uppercase mb-1">
                          3. NO. OF HAND TOUCHES (H - PENALTIES)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={round2HandTouches}
                          onChange={(e) => setRound2HandTouches(e.target.value)}
                          placeholder="3"
                          className="w-full rounded-lg border border-white/10 bg-black/40 py-2.5 px-3 text-xs font-bold text-red-400 focus:border-red-400 focus:outline-none font-mono"
                        />
                        <p className="mt-1 text-[10px] text-zinc-400 font-mono">
                          Penalties: {computedRound2.hand_touches} &times; (-{computedRound2.penalty_rate}) = <strong className="text-red-400">-{computedRound2.penalty_total} pts</strong>
                        </p>
                      </div>
                    </div>

                    {/* Advanced Parameters: Total Time Limit & Deduction per Touch */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
                      <div>
                        <label className="block text-[11px] font-bold tracking-wider text-zinc-400 uppercase mb-1">
                          4. TRACK TIME LIMIT (SECONDS)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={round2TotalTime}
                          onChange={(e) => setRound2TotalTime(e.target.value)}
                          placeholder="720"
                          className="w-full rounded-lg border border-white/10 bg-black/40 py-2 px-3 text-xs font-bold text-zinc-300 focus:border-[#00F0FF] focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold tracking-wider text-zinc-400 uppercase mb-1">
                          5. DEDUCTION PER HAND TOUCH (PTS)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={round2PenaltyRate}
                          onChange={(e) => setRound2PenaltyRate(e.target.value)}
                          placeholder="1"
                          className="w-full rounded-lg border border-white/10 bg-black/40 py-2 px-3 text-xs font-bold text-zinc-300 focus:border-[#FF2A85] focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    {/* Live Calculation Preview Cards */}
                    <div className="rounded-xl border border-[#00F0FF]/30 bg-[#00F0FF]/5 p-4 space-y-3 font-mono">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#00F0FF]">
                        LIVE SCORE CALCULATION BREAKDOWN
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                        <div className="rounded-lg bg-black/50 border border-white/5 p-2.5">
                          <span className="text-[10px] text-zinc-400 uppercase block">Time Score (720-T)</span>
                          <span className="font-bold text-sm text-[#00F0FF]">
                            {computedRound2.time_score} pts
                          </span>
                        </div>
                        <div className="rounded-lg bg-black/50 border border-white/5 p-2.5">
                          <span className="text-[10px] text-zinc-400 uppercase block">Hand Touch (-H)</span>
                          <span className="font-bold text-sm text-red-400">
                            -{computedRound2.penalty_total} pts
                          </span>
                        </div>
                        <div className="rounded-lg bg-black/50 border border-white/5 p-2.5">
                          <span className="text-[10px] text-zinc-400 uppercase block">Viva Marks (+V)</span>
                          <span className="font-bold text-sm text-emerald-400">
                            +{computedRound2.viva_marks} pts
                          </span>
                        </div>
                        <div className="rounded-lg bg-[#00F0FF]/15 border border-[#00F0FF]/40 p-2.5 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                          <span className="text-[10px] text-[#00F0FF] uppercase block font-bold">ROUND 2 TOTAL</span>
                          <span className="font-black text-base text-white">
                            {computedRound2.total_marks} PTS
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs border-t border-white/10 pt-2 text-zinc-300">
                        <span className="text-zinc-400">
                          Formula: ({(computedRound2.total_time ?? DEFAULT_ROUND2_TOTAL_TIME)} &minus; {computedRound2.time_taken_seconds || 0}) &minus; {computedRound2.penalty_total} + {computedRound2.viva_marks}
                        </span>
                        <span className="font-black text-sm text-[#00F0FF]">
                          = {computedRound2.total_marks} / {(computedRound2.total_time ?? DEFAULT_ROUND2_TOTAL_TIME) + 10} PTS
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ROUND 3 (SECOND ARENA - 3 STAGES) */}
              {activeTab === "round3" && (
                <div className="space-y-4">
                  {/* Stage Switcher */}
                  <div className="flex items-center gap-2">
                    {[0, 1, 2].map((idx) => {
                      const stComputed = computedStages[idx];
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveStageIndex(idx)}
                          className={`flex-1 rounded-lg py-2 px-3 text-xs font-bold uppercase transition-all cursor-pointer ${
                            activeStageIndex === idx
                              ? "bg-[#8A2BE2] text-white shadow-[0_0_15px_rgba(138,43,226,0.4)]"
                              : "border border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                          }`}
                        >
                          STAGE {idx + 1} ({stComputed.total_marks} PTS)
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Stage Editor */}
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-xs font-bold text-[#8A2BE2] uppercase">
                        STAGE {activeStageIndex + 1} PARAMETERS
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        Formula: Gain &minus; (Touches &times; Deduction)
                      </span>
                    </div>

                    {/* Completion Time */}
                    <div>
                      <label className="block text-xs font-bold tracking-wider text-zinc-300 uppercase mb-1">
                        STAGE {activeStageIndex + 1} COMPLETION TIME (MM:SS)
                      </label>
                      <input
                        type="text"
                        value={stagesState[activeStageIndex].time}
                        onChange={(e) =>
                          handleStageFieldChange(activeStageIndex, "time", e.target.value)
                        }
                        placeholder="e.g. 01:30"
                        className="w-full rounded-lg border border-white/10 bg-black/40 py-2 px-3 text-xs font-bold text-white focus:border-[#8A2BE2] focus:outline-none"
                      />
                    </div>

                    {/* Marks Configuration */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold tracking-wider text-zinc-300 uppercase mb-1">
                          FULL MARKS (MAX SCORE)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={stagesState[activeStageIndex].maxMarks}
                          onChange={(e) =>
                            handleStageFieldChange(activeStageIndex, "maxMarks", e.target.value)
                          }
                          placeholder="50"
                          className="w-full rounded-lg border border-white/10 bg-black/40 py-2 px-3 text-xs font-bold text-white focus:border-[#8A2BE2] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold tracking-wider text-zinc-300 uppercase mb-1">
                          GAIN MARKS (SCORE OBTAINED)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={stagesState[activeStageIndex].gainMarks}
                          onChange={(e) =>
                            handleStageFieldChange(activeStageIndex, "gainMarks", e.target.value)
                          }
                          placeholder="45"
                          className="w-full rounded-lg border border-white/10 bg-black/40 py-2 px-3 text-xs font-bold text-[#8A2BE2] focus:border-[#8A2BE2] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Penalties */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold tracking-wider text-zinc-300 uppercase mb-1">
                          DEDUCTION PER TOUCH (NEGATIVE)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={stagesState[activeStageIndex].penaltyRate}
                          onChange={(e) =>
                            handleStageFieldChange(activeStageIndex, "penaltyRate", e.target.value)
                          }
                          placeholder="5"
                          className="w-full rounded-lg border border-white/10 bg-black/40 py-2 px-3 text-xs font-bold text-white focus:border-[#8A2BE2] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold tracking-wider text-zinc-300 uppercase mb-1">
                          NO. OF PENALTIES (TOUCHES)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={stagesState[activeStageIndex].penaltyCount}
                          onChange={(e) =>
                            handleStageFieldChange(activeStageIndex, "penaltyCount", e.target.value)
                          }
                          placeholder="0"
                          className="w-full rounded-lg border border-white/10 bg-black/40 py-2 px-3 text-xs font-bold text-red-400 focus:border-red-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Stage Preview */}
                    <div className="rounded-lg border border-[#8A2BE2]/30 bg-[#8A2BE2]/10 p-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-300">
                          Stage {activeStageIndex + 1} Net:{" "}
                          <strong className="text-white">{computedStages[activeStageIndex].gain_marks}</strong> &minus;{" "}
                          <strong className="text-red-400">
                            {computedStages[activeStageIndex].penalty_total} pen
                          </strong>
                        </span>
                        <span className="font-black text-sm text-[#8A2BE2]">
                          = {computedStages[activeStageIndex].total_marks} PTS
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Round 3 Overall 3-Stage Summary Card */}
                  <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                      <span>ROUND 3 TOTAL ACCUMULATOR:</span>
                      <span className="text-[#8A2BE2] font-black text-base">{computedRound3Total} PTS</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded bg-white/5 p-2">
                        <span className="text-[10px] text-zinc-400 block">Stage 1</span>
                        <span className="font-bold text-white">{computedStages[0].total_marks} pts</span>
                      </div>
                      <div className="rounded bg-white/5 p-2">
                        <span className="text-[10px] text-zinc-400 block">Stage 2</span>
                        <span className="font-bold text-white">{computedStages[1].total_marks} pts</span>
                      </div>
                      <div className="rounded bg-white/5 p-2">
                        <span className="text-[10px] text-zinc-400 block">Stage 3</span>
                        <span className="font-bold text-white">{computedStages[2].total_marks} pts</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* OVERALL GRAND TOTAL & C.T DISPLAY */}
              <div className="rounded-xl border border-[#00F0FF]/40 bg-gradient-to-r from-[#FF2A85]/10 via-[#0A0718] to-[#00F0FF]/10 p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase block">
                      OVERALL TOURNAMENT SCORE (ROUND 2 TOTAL + ROUND 3 TOTAL)
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A85] via-[#FF6B35] to-[#00F0FF]">
                        {computedGrandTotal} PTS
                      </span>
                      {screeningStatus === "not_qualified" && (
                        <span className="rounded bg-red-500/20 text-red-400 text-xs px-2 py-0.5 font-bold">
                          NOT QUALIFIED (0 PTS)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-zinc-300">
                    <div className="text-center sm:text-right">
                      <span className="text-[10px] text-zinc-500 block uppercase">OVERALL C.T</span>
                      <span className="font-bold text-[#FF6B35] flex items-center gap-1">
                        <Timer className="h-3.5 w-3.5" />
                        {computedOverallTime}
                      </span>
                    </div>

                    <div className="text-right border-l border-white/10 pl-3">
                      <div>R2: <span className="text-white font-bold">{computedRound2.total_marks} pts</span></div>
                      <div>R3: <span className="text-white font-bold">{computedRound3Total} pts</span></div>
                    </div>
                  </div>
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
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#FF2A85] px-6 py-2.5 text-xs font-black tracking-widest text-white uppercase shadow-[0_0_15px_rgba(255,107,53,0.3)] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>SAVING SCORES...</span>
                    </>
                  ) : (
                    <span>SAVE ALL ROUND SCORES</span>
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
