"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { fetchLeaderboardData } from "@/lib/leaderboard";
import { LeaderboardEntry } from "@/types/database";
import Podium from "./Podium";
import LeaderboardTable from "./LeaderboardTable";
import {
  Trophy,
  Radio,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Sparkles,
  Wifi,
  WifiOff,
} from "lucide-react";

export default function ChampionsHQ() {
  const [teams, setTeams] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"CONNECTING" | "LIVE" | "OFFLINE">("CONNECTING");
  const [recentlyUpdatedId, setRecentlyUpdatedId] = useState<string | null>(null);
  const [inspectingTeam, setInspectingTeam] = useState<LeaderboardEntry | null>(null);

  // Load Leaderboard from PostgreSQL
  const loadLeaderboard = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const data = await fetchLeaderboardData();
      setTeams(data);
    } catch {
      setError("Unable to load leaderboard data. Please try again.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Initial Load + Supabase Realtime Subscription
  useEffect(() => {
    // 1. Initial Load from Database
    loadLeaderboard(true);

    // 2. Setup Single Realtime Channel for scores table
    const channel = supabase
      .channel("scores-realtime-feed")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scores",
        },
        (payload) => {
          // Identify affected team ID
          const teamId =
            (payload.new as any)?.team_id || (payload.old as any)?.team_id;

          if (teamId) {
            setRecentlyUpdatedId(teamId);
            setTimeout(() => setRecentlyUpdatedId(null), 4000);
          }

          // Refetch authoritative calculated totals & ranks from PostgreSQL
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
        } else {
          setConnectionStatus("CONNECTING");
        }
      });

    // 3. Subscription Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadLeaderboard]);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#07070F] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Background Atmosphere & Grid */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-[#00F0FF]/15 blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-[#FF2A85]/15 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* ========================================================================= */}
        {/* HERO HEADER */}
        {/* ========================================================================= */}
        <div className="mb-12 text-center">
          {/* Top Status Indicators */}
          <div className="flex items-center justify-center gap-3 mb-4">
            {/* Label */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/10 px-4 py-1 text-xs font-mono font-bold tracking-widest text-[#00F0FF] uppercase shadow-[0_0_15px_rgba(0,240,255,0.25)]">
              <Trophy className="h-3.5 w-3.5 text-[#00F0FF]" />
              <span>ROBO CITY // CHAMPIONS HQ</span>
            </div>

            {/* Realtime Connection Status Pill */}
            <div
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-mono font-black uppercase tracking-wider ${
                connectionStatus === "LIVE"
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                  : connectionStatus === "CONNECTING"
                  ? "border-amber-500/40 bg-amber-500/15 text-amber-400"
                  : "border-red-500/40 bg-red-500/15 text-red-400"
              }`}
            >
              {connectionStatus === "LIVE" && (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span>LIVE</span>
                </>
              )}
              {connectionStatus === "CONNECTING" && (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>CONNECTING</span>
                </>
              )}
              {connectionStatus === "OFFLINE" && (
                <>
                  <WifiOff className="h-3 w-3" />
                  <span>OFFLINE</span>
                </>
              )}
            </div>
          </div>

          {/* Main Headings */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-none">
            MOST{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#FF2A85] to-[#FFAA00] filter drop-shadow-[0_0_25px_rgba(0,240,255,0.4)]">
              WANTED
            </span>
          </h1>

          <p className="mt-2 font-mono text-sm sm:text-base font-bold tracking-widest text-[#00F0FF] uppercase">
            LIVE LEADERBOARD
          </p>

          <p className="mt-3 mx-auto max-w-xl text-xs sm:text-sm text-zinc-400 uppercase font-mono tracking-wider">
            THE CITY REMEMBERS EVERY SCORE.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* LEADERBOARD BODY / STATES */}
        {/* ========================================================================= */}
        {loading ? (
          /* Loading State */
          <div className="flex h-72 flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#00F0FF]" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">
              LOADING CHAMPIONS...
            </span>
          </div>
        ) : error ? (
          /* Error State */
          <div className="mx-auto max-w-md rounded-2xl border border-red-500/30 bg-[#0A0718] p-8 text-center backdrop-blur-xl space-y-4">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto" />
            <h2 className="text-lg font-black uppercase tracking-wider text-white font-mono">
              CHAMPIONS HQ UNAVAILABLE
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              {error}
            </p>
            <button
              onClick={() => loadLeaderboard(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FF2A85] to-[#FF6B35] px-6 py-2.5 text-xs font-mono font-black tracking-wider text-white uppercase shadow-[0_0_15px_rgba(255,42,133,0.3)] cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>TRY AGAIN</span>
            </button>
          </div>
        ) : teams.length === 0 ? (
          /* Empty State */
          <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-[#0A0718]/80 p-12 text-center backdrop-blur-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00F0FF]/10 text-[#00F0FF] mb-4">
              <Trophy className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-wider text-white font-mono">
              NO CHAMPIONS YET
            </h2>
            <p className="mt-2 text-xs text-zinc-400 font-mono leading-relaxed">
              The city is waiting for its first score. Tournament matches will stream live to this board.
            </p>
          </div>
        ) : (
          /* Live Leaderboard Display */
          <div className="space-y-10">
            {/* Top 3 Podium Display */}
            {teams.length >= 1 && (
              <Podium
                topTeams={teams.slice(0, 3)}
                onSelectTeam={(team) => setInspectingTeam(team)}
              />
            )}

            {/* Leaderboard Table with Search & Filter */}
            <LeaderboardTable
              teams={teams}
              recentlyUpdatedId={recentlyUpdatedId}
            />
          </div>
        )}
      </div>
    </section>
  );
}
