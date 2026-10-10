import { supabase, getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { LeaderboardEntry } from "@/types/database";
import { normalizeScoreData, compareRound2ArenaTeams } from "./scoringUtils";
import { getLocalTournamentTeams, formatLeaderboardEntries } from "./teamsStorage";
import { getInitialLeaderboardEntries } from "@/data/initialLeaderboardData";

/**
 * Fetches real leaderboard data with bulletproof multi-tier fallback:
 * 1. If running in browser, fetches /api/leaderboard which queries Supabase with service role.
 * 2. If running on server or API fails, queries Supabase parallel tables directly.
 * 3. If Supabase is offline or empty, uses local tournament teams storage / initial seed.
 */
export async function fetchLeaderboardData(client?: any): Promise<LeaderboardEntry[]> {
  // If Supabase is not configured, directly return local tournament store
  if (!isSupabaseConfigured && !client) {
    return formatLeaderboardEntries(getLocalTournamentTeams());
  }

  // If running in browser and Supabase is configured, try /api/leaderboard
  if (typeof window !== "undefined" && !client && isSupabaseConfigured) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(`/api/leaderboard?_t=${Date.now()}`, {
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch {
      // Fall through to direct query
    }
  }

  const db = client || (typeof window === "undefined" ? getServiceSupabase() : supabase);

  try {
    // Parallel queries to reliably fetch all data without embedding/foreign-key failures
    const [teamsRes, scoresRes, membersRes, regsRes] = await Promise.all([
      db.from("teams").select("id, team_name, team_logo_url, robot_image_url, created_at, updated_at").order("created_at", { ascending: false }),
      db.from("scores").select("*"),
      db.from("team_members").select("id, team_id, name, branch, year"),
      db.from("registrations").select("team_id, captain_name"),
    ]);

    const teamsData = teamsRes.data || [];
    if (teamsData.length === 0) {
      if (typeof window !== "undefined") {
        return formatLeaderboardEntries(getLocalTournamentTeams());
      }
      return getInitialLeaderboardEntries();
    }

    const scoreMap = new Map<string, any>();
    (scoresRes.data || []).forEach((s: any) => {
      if (s.team_id) scoreMap.set(s.team_id, s);
    });

    const memberMap = new Map<string, any[]>();
    (membersRes.data || []).forEach((m: any) => {
      if (m.team_id) {
        const list = memberMap.get(m.team_id) || [];
        list.push(m);
        memberMap.set(m.team_id, list);
      }
    });

    const regMap = new Map<string, string>();
    (regsRes.data || []).forEach((r: any) => {
      if (r.team_id && r.captain_name) regMap.set(r.team_id, r.captain_name);
    });

    const list: Omit<LeaderboardEntry, "rank">[] = teamsData.map((t: any) => {
      const rawScore = scoreMap.get(t.id) || null;
      const rawMembers = memberMap.get(t.id) || [];
      const leaderName = regMap.get(t.id) || (rawMembers[0]?.name ? rawMembers[0].name.trim() : null);
      const normalized = normalizeScoreData(rawScore, t.team_name, leaderName, rawMembers);

      return {
        id: t.id,
        team_name: t.team_name || "Unnamed Team",
        leader_name: leaderName,
        team_logo_url: t.team_logo_url,
        robot_image_url: t.robot_image_url,
        screening_status: normalized.screening_status,
        round1_status: normalized.round1_status,
        round1_score: normalized.round1_score,
        round2_score: normalized.round2_score,
        round3_score: normalized.round3_score,
        total_score: normalized.total_score,
        overall_time: normalized.overall_time,
        round2_details: normalized.round2_details,
        round3_details: normalized.round3_details,
        details: normalized.details,
        updated_at: rawScore?.updated_at || t.updated_at,
        members: rawMembers,
      };
    });

    // Partition into Qualified & Not Qualified
    const qualifiedTeams = list.filter((t) => t.screening_status === "qualified");
    const notQualifiedTeams = list.filter((t) => t.screening_status === "not_qualified");

    // Sort qualified teams by lowest Round 2 Arena Overall Time ASC (lowest time ranks #1)
    qualifiedTeams.sort((a, b) => {
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

    // Sort not qualified teams by name ASC
    notQualifiedTeams.sort((a, b) => {
      const nameCompare = (a.team_name || "").localeCompare(b.team_name || "");
      if (nameCompare !== 0) return nameCompare;
      return (a.id || "").localeCompare(b.id || "");
    });

    // Assign dynamic ranks: 1, 2, 3... to qualified teams, followed by not qualified teams
    const rankedQualified: LeaderboardEntry[] = qualifiedTeams.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    const rankedNotQualified: LeaderboardEntry[] = notQualifiedTeams.map((entry, index) => ({
      ...entry,
      rank: qualifiedTeams.length + index + 1,
    }));

    const results = [...rankedQualified, ...rankedNotQualified];
    return results.length > 0 ? results : (typeof window !== "undefined" ? formatLeaderboardEntries(getLocalTournamentTeams()) : getInitialLeaderboardEntries());
  } catch (err) {
    console.error("fetchLeaderboardData exception:", err);
    if (typeof window !== "undefined") {
      return formatLeaderboardEntries(getLocalTournamentTeams());
    }
    return getInitialLeaderboardEntries();
  }
}
