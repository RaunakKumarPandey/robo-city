"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { fetchLeaderboardData } from "@/lib/leaderboard";
import { LeaderboardEntry } from "@/types/database";
import { compareRound2ArenaTeams } from "@/lib/scoringUtils";
import Podium from "./Podium";
import LeaderboardTable from "./LeaderboardTable";
import {
  Trophy,
  RefreshCw,
  AlertTriangle,
  Loader2,
  WifiOff,
  Crosshair,
  Flame,
  Timer,
  Layers,
} from "lucide-react";

export default function ChampionsHQ() {
  const [teams, setTeams] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"CONNECTING" | "LIVE" | "OFFLINE">("LIVE");
  const [recentlyUpdatedId, setRecentlyUpdatedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"all_rounds" | "round2_arena">("round2_arena");

  // Load Leaderboard data
  const loadLeaderboard = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const data = await fetchLeaderboardData();
      if (Array.isArray(data) && data.length > 0) {
        setTeams(data);
      }
    } catch (err) {
      console.error("Leaderboard load error:", err);
      // Don't show hard error if teams are already loaded
      if (teams.length === 0) {
        setError("Unable to load leaderboard data. Please try again.");
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [teams.length]);

  // Initial Load + Multi-channel Realtime Subscriptions
  useEffect(() => {
    // 1. Initial Load
    loadLeaderboard(true);

    // 2. Local Realtime DOM Event Listener
    const handleScoresUpdated = (event: any) => {
      const teamId = event?.detail?.teamId;
      if (teamId) {
        setRecentlyUpdatedId(teamId);
        setTimeout(() => setRecentlyUpdatedId(null), 4000);
      }
      loadLeaderboard(false);
    };

    window.addEventListener("scores_updated", handleScoresUpdated);
    window.addEventListener("storage", () => loadLeaderboard(false));

    // 3. Cross-Tab BroadcastChannel Realtime Feed
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && typeof window.BroadcastChannel !== "undefined") {
      try {
        bc = new BroadcastChannel("robocity_scores_realtime_channel");
        bc.onmessage = (msg) => {
          if (msg?.data?.teamId) {
            setRecentlyUpdatedId(msg.data.teamId);
            setTimeout(() => setRecentlyUpdatedId(null), 4000);
          }
          loadLeaderboard(false);
        };
      } catch {}
    }

    // 4. Supabase Remote Database Realtime Subscription (if configured)
    let channel: any = null;
    if (isSupabaseConfigured) {
      try {
        channel = supabase
          .channel("scores-realtime-feed")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "scores",
            },
            (payload) => {
              const teamId =
                (payload.new as any)?.team_id || (payload.old as any)?.team_id;

              if (teamId) {
                setRecentlyUpdatedId(teamId);
                setTimeout(() => setRecentlyUpdatedId(null), 4000);
              }

              loadLeaderboard(false);
            }
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "teams",
            },
            (payload) => {
              const teamId =
                (payload.new as any)?.id || (payload.old as any)?.id;

              if (teamId) {
                setRecentlyUpdatedId(teamId);
                setTimeout(() => setRecentlyUpdatedId(null), 4000);
              }

              loadLeaderboard(false);
            }
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              setConnectionStatus("LIVE");
            } else if (
              status === "CLOSED" ||
              status === "CHANNEL_ERROR" ||
              status === "TIMED_OUT"
            ) {
              setConnectionStatus("OFFLINE");
            }
          });
      } catch {}
    } else {
      setConnectionStatus("LIVE");
    }

    // 5. Polling safety net every 8 seconds
    const interval = setInterval(() => {
      loadLeaderboard(false);
    }, 8000);

    return () => {
      window.removeEventListener("scores_updated", handleScoresUpdated);
      window.removeEventListener("storage", () => loadLeaderboard(false));
      if (bc) {
        try {
          bc.close();
        } catch {}
      }
      if (channel) {
        supabase.removeChannel(channel);
      }
      clearInterval(interval);
    };
  }, [loadLeaderboard]);

  // Derive ranked teams based on active view mode (lowest overall time is always ranked #1)
  const displayedTeams = useMemo(() => {
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

    const rankedQualified = sortedQualified.map((t, idx) => ({
      ...t,
      rank: idx + 1,
    }));

    const rankedNotQualified = notQualified.map((t, idx) => ({
      ...t,
      rank: rankedQualified.length + idx + 1,
    }));

    return [...rankedQualified, ...rankedNotQualified];
  }, [teams]);

  const topThree = useMemo(() => {
    return displayedTeams.filter((t) => t.screening_status === "qualified").slice(0, 3);
  }, [displayedTeams]);

  return (
    <section className="relative min-h-screen w-full overflow-hidden pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#35D9FF]/40 bg-[#120B20]/80 px-4 py-1.5 font-mono text-xs font-bold tracking-widest text-[#35D9FF] uppercase mb-4 shadow-[0_0_20px_rgba(53,217,255,0.25)] backdrop-blur-xl">
            <Crosshair className="h-3.5 w-3.5 text-[#FF2D8D]" />
            <span>GLOBAL RANKINGS // REAL-TIME XP</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white">
            THE MOST{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D8D] via-[#FF7A3D] to-[#35D9FF]">
              WANTED
            </span>
          </h1>

          <p className="mt-4 mx-auto max-w-2xl font-sans text-sm sm:text-base text-zinc-300 leading-relaxed">
            Live tournament standings and dynamic point scoring. Rankings recalculate instantly via real-time database feeds.
          </p>

          {/* Connection Status & Realtime Sync Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {/* Realtime Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#08070D]/80 px-3.5 py-1.5 font-mono text-xs shadow-md backdrop-blur-sm">
              {connectionStatus === "LIVE" ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  </span>
                  <span className="font-black text-emerald-400">REALTIME RADAR: CONNECTED</span>
                </>
              ) : connectionStatus === "CONNECTING" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#FF7A3D]" />
                  <span className="font-bold text-[#FF7A3D]">CONNECTING TO SATELLITE...</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="font-bold text-zinc-400">RADAR OFFLINE (POLLING)</span>
                </>
              )}
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={() => loadLeaderboard(true)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs font-bold text-zinc-300 hover:border-[#35D9FF]/50 hover:bg-[#35D9FF]/10 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin text-[#35D9FF]" : ""}`} />
              <span>REFRESH SCORES</span>
            </button>
          </div>

          {/* View Mode Switcher Tabs */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-2xl border border-white/15 bg-[#0A0714]/90 p-1.5 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] font-mono text-xs">
              <button
                onClick={() => setViewMode("all_rounds")}
                className={`flex items-center gap-2 rounded-xl px-4 sm:px-6 py-2.5 font-bold transition-all cursor-pointer ${
                  viewMode === "all_rounds"
                    ? "bg-gradient-to-r from-[#FF2D8D] to-[#FF7A3D] text-white shadow-[0_0_20px_rgba(255,45,141,0.4)]"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>GLOBAL STANDINGS (ALL ROUNDS)</span>
              </button>

              <button
                onClick={() => setViewMode("round2_arena")}
                className={`flex items-center gap-2 rounded-xl px-4 sm:px-6 py-2.5 font-bold transition-all cursor-pointer ${
                  viewMode === "round2_arena"
                    ? "bg-gradient-to-r from-[#FF7A3D] to-[#35D9FF] text-white shadow-[0_0_20px_rgba(53,217,255,0.4)]"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Timer className="h-4 w-4" />
                <span>ROUND 2 – ARENA LEADERBOARD</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 flex items-center justify-between rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-xs font-mono text-red-400">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadLeaderboard(true)}
              className="font-bold text-white underline hover:text-red-300"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && displayedTeams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#120B20] border border-[#FF2D8D]/40 text-[#FF2D8D] shadow-[0_0_30px_rgba(255,45,141,0.3)]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">
              ACQUIRING ROBOVERSE LEADERBOARD TELEMETRY...
            </p>
          </div>
        ) : displayedTeams.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#120B20]/80 p-12 text-center backdrop-blur-md space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-zinc-500">
              <Trophy className="h-7 w-7" />
            </div>
            <h3 className="font-mono text-lg font-black uppercase text-white">
              NO CREWS RANKED YET
            </h3>
            <p className="font-sans text-xs text-zinc-400 max-w-md mx-auto">
              Leaderboard standings will populate automatically as teams clear tournament rounds.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* 1. TOP 3 PODIUM */}
            {topThree.length > 0 && (
              <Podium
                topTeams={topThree}
                onSelectTeam={() => {}}
                viewMode={viewMode}
              />
            )}

            {/* 2. FULL TOURNAMENT LEADERBOARD TABLE */}
            <LeaderboardTable
              teams={displayedTeams}
              recentlyUpdatedId={recentlyUpdatedId}
              viewMode={viewMode}
            />
          </div>
        )}
      </div>
    </section>
  );
}
