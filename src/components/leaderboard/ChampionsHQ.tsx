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
  Flame,
  Crosshair,
} from "lucide-react";

export default function ChampionsHQ() {
  const [teams, setTeams] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"CONNECTING" | "LIVE" | "OFFLINE">("CONNECTING");
  const [recentlyUpdatedId, setRecentlyUpdatedId] = useState<string | null>(null);

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

    // 2. Setup Realtime Channel for scores table
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
          const teamId =
            (payload.new as any)?.team_id || (payload.old as any)?.team_id;

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
        } else {
          setConnectionStatus("CONNECTING");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadLeaderboard]);

  const topThree = teams.slice(0, 3);

  return (
    <section className="relative min-h-screen w-full overflow-hidden pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mb-10 text-center">
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
        {loading && teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#120B20] border border-[#FF2D8D]/40 text-[#FF2D8D] shadow-[0_0_30px_rgba(255,45,141,0.3)]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">
              ACQUIRING VICE CITY LEADERBOARD TELEMETRY...
            </p>
          </div>
        ) : teams.length === 0 ? (
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
              />
            )}

            {/* 2. FULL TOURNAMENT LEADERBOARD TABLE */}
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
