import { supabase, getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { LeaderboardEntry } from "@/types/database";
import { normalizeScoreData } from "./scoringUtils";
import { getLocalTournamentTeams, formatLeaderboardEntries } from "./teamsStorage";
import { getInitialLeaderboardEntries } from "@/data/initialLeaderboardData";

/**
 * Fetches real leaderboard data with bulletproof multi-tier fallback:
 * 1. If Supabase is configured, attempts database query / API query.
 * 2. If Supabase is offline or unconfigured, uses local tournament teams storage / initial seed.
 * 
 * Guarantees:
 * - Qualified teams appear at top, ranked by total_score (Round 2 + Round 3) DESC, team_name ASC.
 * - Not qualified teams appear at the bottom.
 * - Real-time responsive and never crashes.
 */
export async function fetchLeaderboardData(client?: any): Promise<LeaderboardEntry[]> {
  // If Supabase is not configured, directly return local tournament store
  if (!isSupabaseConfigured && !client) {
    return formatLeaderboardEntries(getLocalTournamentTeams());
  }

  // If running in browser and Supabase is configured, try /api/leaderboard with timeout
  if (typeof window !== "undefined" && !client && isSupabaseConfigured) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
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
      // Fall through to local/supabase direct query
    }
  }

  const db = client || (typeof window === "undefined" ? getServiceSupabase() : supabase);

  try {
    // 1. First attempt: Direct join query with wildcard scores(*)
    const { data, error } = await db
      .from("teams")
      .select(`
        id,
        team_name,
        team_logo_url,
        robot_image_url,
        scores (*),
        team_members (*),
        registrations (
          captain_name
        )
      `);

    let rawTeamsList: any[] = [];

    if (!error && data && data.length > 0) {
      rawTeamsList = data;
    } else {
      // 2. Fallback: Parallel queries to avoid any join or foreign-key mismatch
      const [teamsRes, scoresRes, membersRes, regsRes] = await Promise.all([
        db.from("teams").select("id, team_name, team_logo_url, robot_image_url"),
        db.from("scores").select("*"),
        db.from("team_members").select("team_id, name, branch, year"),
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

      rawTeamsList = teamsData.map((t: any) => ({
        id: t.id,
        team_name: t.team_name,
        team_logo_url: t.team_logo_url,
        robot_image_url: t.robot_image_url,
        scores: scoreMap.get(t.id) || null,
        team_members: memberMap.get(t.id) || [],
        registrations: regMap.has(t.id) ? [{ captain_name: regMap.get(t.id) }] : [],
      }));
    }

    // Flatten score objects, members and leader name with normalization
    const list: Omit<LeaderboardEntry, "rank">[] = rawTeamsList.map((t: any) => {
      const rawScores = t.scores || t.score;
      const scoreObj = Array.isArray(rawScores) ? rawScores[0] : rawScores;
      const rawMembers = t.team_members || t.members || [];
      const regObj = Array.isArray(t.registrations) ? t.registrations[0] : t.registrations;
      const leaderName =
        regObj?.captain_name?.trim() ||
        (Array.isArray(rawMembers) && rawMembers[0]?.name ? rawMembers[0].name.trim() : null);

      const normalized = normalizeScoreData(scoreObj, t.team_name, leaderName, rawMembers);

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
        updated_at: scoreObj?.updated_at,
        members: Array.isArray(rawMembers) ? rawMembers : [],
      };
    });

    // Partition into Qualified & Not Qualified
    const qualifiedTeams = list.filter((t) => t.screening_status === "qualified");
    const notQualifiedTeams = list.filter((t) => t.screening_status === "not_qualified");

    // Sort qualified teams by total_score DESC, tiebreak by team_name ASC, then stable id tiebreak
    qualifiedTeams.sort((a, b) => {
      if (b.total_score !== a.total_score) {
        return b.total_score - a.total_score;
      }
      const nameCompare = (a.team_name || "").localeCompare(b.team_name || "");
      if (nameCompare !== 0) return nameCompare;
      return (a.id || "").localeCompare(b.id || "");
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
