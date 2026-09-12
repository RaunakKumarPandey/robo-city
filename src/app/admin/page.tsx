"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, verifyAdminStatus } from "@/lib/supabase";
import {
  Users,
  Trophy,
  Wrench,
  Radio,
  ArrowRight,
  ShieldAlert,
  Loader2,
  RefreshCw,
  LogOut,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  // Real Database Counts
  const [counts, setCounts] = useState({
    teams: 0,
    scores: 0,
    workshops: 0,
    announcements: 0,
  });
  const [fetchingCounts, setFetchingCounts] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAuthAndLoad() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (isMounted) router.push("/admin/login");
          return;
        }

        const isAdmin = await verifyAdminStatus(user.id);

        if (!isAdmin) {
          if (isMounted) {
            setIsAuthorized(false);
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          setIsAuthorized(true);
          setAdminEmail(user.email ?? null);
          setLoading(false);
        }

        // Fetch real counts from Supabase
        await fetchDatabaseCounts();
      } catch {
        if (isMounted) {
          setIsAuthorized(false);
          setLoading(false);
        }
      }
    }

    checkAuthAndLoad();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const fetchDatabaseCounts = async () => {
    setFetchingCounts(true);
    try {
      const [teamsRes, scoresRes, workshopsRes, announcementsRes] =
        await Promise.all([
          supabase.from("teams").select("*", { count: "exact", head: true }),
          supabase.from("scores").select("*", { count: "exact", head: true }),
          supabase.from("workshops").select("*", { count: "exact", head: true }),
          supabase.from("announcements").select("*", { count: "exact", head: true }),
        ]);

      setCounts({
        teams: teamsRes.count ?? 0,
        scores: scoresRes.count ?? 0,
        workshops: workshopsRes.count ?? 0,
        announcements: announcementsRes.count ?? 0,
      });
    } catch {
      // Keep existing counts on error
    } finally {
      setFetchingCounts(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF2A85]" />
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">
          VERIFYING SECURITY CREDENTIALS...
        </p>
      </div>
    );
  }

  // 2. Unauthorized State
  if (isAuthorized === false) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="max-w-md space-y-6 rounded-2xl border border-red-500/30 bg-[#0A0718] p-8 backdrop-blur-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black uppercase tracking-wider text-white">
              ACCESS DENIED
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your account is authenticated, but not registered in the administrator database.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-6 py-2.5 text-xs font-mono font-bold tracking-wider text-white uppercase hover:bg-red-600 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>LOGOUT NOW</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Authorized Dashboard
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
        <div>
          <span className="font-mono text-xs font-bold tracking-widest text-[#FF2A85] uppercase">
            ROBO CITY // COMMAND CONSOLE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1">
            ADMIN CONTROL CENTER
          </h1>
          {adminEmail && (
            <p className="mt-1 font-mono text-xs text-zinc-400">
              Logged in as: <span className="text-[#00F0FF]">{adminEmail}</span>
            </p>
          )}
        </div>

        <button
          onClick={fetchDatabaseCounts}
          disabled={fetchingCounts}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-mono font-bold tracking-wider text-zinc-300 uppercase transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${fetchingCounts ? "animate-spin" : ""}`} />
          <span>REFRESH STATS</span>
        </button>
      </div>

      {/* Database Stat Counts Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Teams Stat */}
        <div className="rounded-xl border border-white/10 bg-[#0A0718]/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="font-mono text-xs font-bold tracking-widest uppercase">TEAMS</span>
            <Users className="h-4 w-4 text-[#FF2A85]" />
          </div>
          <div className="text-3xl font-black font-mono text-white">
            {counts.teams}
          </div>
          <p className="mt-1 text-[11px] text-zinc-500 font-mono">Registered crews</p>
        </div>

        {/* Scores Stat */}
        <div className="rounded-xl border border-white/10 bg-[#0A0718]/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="font-mono text-xs font-bold tracking-widest uppercase">SCORES</span>
            <Trophy className="h-4 w-4 text-[#FF6B35]" />
          </div>
          <div className="text-3xl font-black font-mono text-white">
            {counts.scores}
          </div>
          <p className="mt-1 text-[11px] text-zinc-500 font-mono">Score records</p>
        </div>

        {/* Workshops Stat */}
        <div className="rounded-xl border border-white/10 bg-[#0A0718]/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="font-mono text-xs font-bold tracking-widest uppercase">WORKSHOPS</span>
            <Wrench className="h-4 w-4 text-[#00F0FF]" />
          </div>
          <div className="text-3xl font-black font-mono text-white">
            {counts.workshops}
          </div>
          <p className="mt-1 text-[11px] text-zinc-500 font-mono">Active sessions</p>
        </div>

        {/* Announcements Stat */}
        <div className="rounded-xl border border-white/10 bg-[#0A0718]/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="font-mono text-xs font-bold tracking-widest uppercase">RADIO</span>
            <Radio className="h-4 w-4 text-[#8A2BE2]" />
          </div>
          <div className="text-3xl font-black font-mono text-white">
            {counts.announcements}
          </div>
          <p className="mt-1 text-[11px] text-zinc-500 font-mono">Live broadcasts</p>
        </div>
      </div>

      {/* Quick Actions Navigation Cards */}
      <div className="space-y-4">
        <h2 className="font-mono text-xs font-bold tracking-widest text-zinc-400 uppercase">
          QUICK ACTIONS
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/teams"
            className="group flex flex-col justify-between rounded-xl border border-white/10 bg-[#0A0718]/80 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#FF2A85] hover:shadow-[0_0_20px_rgba(255,42,133,0.25)]"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF2A85]/10 text-[#FF2A85]">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-wider text-white">
                MANAGE TEAMS
              </h3>
              <p className="text-xs text-zinc-400">
                Add, edit, or remove registered teams and crew members.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-mono font-bold text-zinc-400 group-hover:text-[#FF2A85]">
              <span>OPEN PORTAL</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/admin/scores"
            className="group flex flex-col justify-between rounded-xl border border-white/10 bg-[#0A0718]/80 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#FF6B35] hover:shadow-[0_0_20px_rgba(255,107,53,0.25)]"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF6B35]/10 text-[#FF6B35]">
                <Trophy className="h-5 w-5" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-wider text-white">
                UPDATE SCORES
              </h3>
              <p className="text-xs text-zinc-400">
                Enter R1, R2, R3 scores. Automatically updates live leaderboard ranks.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-mono font-bold text-zinc-400 group-hover:text-[#FF6B35]">
              <span>OPEN PORTAL</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/admin/workshops"
            className="group flex flex-col justify-between rounded-xl border border-white/10 bg-[#0A0718]/80 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#00F0FF] hover:shadow-[0_0_20px_rgba(0,240,255,0.25)]"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00F0FF]/10 text-[#00F0FF]">
                <Wrench className="h-5 w-5" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-wider text-white">
                MANAGE WORKSHOPS
              </h3>
              <p className="text-xs text-zinc-400">
                Update schedule, venue, topics, and instructor profiles.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-mono font-bold text-zinc-400 group-hover:text-[#00F0FF]">
              <span>OPEN PORTAL</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/admin/announcements"
            className="group flex flex-col justify-between rounded-xl border border-white/10 bg-[#0A0718]/80 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#8A2BE2] hover:shadow-[0_0_20px_rgba(138,43,226,0.25)]"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8A2BE2]/10 text-[#8A2BE2]">
                <Radio className="h-5 w-5" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-wider text-white">
                ROBO RADIO
              </h3>
              <p className="text-xs text-zinc-400">
                Broadcast live transmissions, round alerts, and emergency dispatch tickers.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-mono font-bold text-zinc-400 group-hover:text-[#8A2BE2]">
              <span>OPEN PORTAL</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
