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

  // If running in browser and Supabase is configured, use server APIs with service-role access
  if (typeof window !== "undefined" && !client && isSupabaseConfigured) {
    // 1. Primary: /api/leaderboard
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
          const qualCount = json.data.filter((t: any) => t.screening_status === "qualified").length;
          if (qualCount > 0) {
            try {
              localStorage.setItem("robocity_leaderboard_cache", JSON.stringify(json.data));
            } catch {}
          }
          return json.data;
        }
      }
    } catch {
      // Primary API timed out or had network error
    }

    // 2. Secondary: /api/admin/scores (service-role direct endpoint fallback)
    try {
      const res2 = await fetch(`/api/admin/scores?_t=${Date.now()}`, { cache: "no-store" });
      if (res2.ok) {
        const json2 = await res2.json();
        if (json2.success && Array.isArray(json2.data) && json2.data.length > 0) {
          const formatted = formatLeaderboardEntries(json2.data);
          try {
            localStorage.setItem("robocity_leaderboard_cache", JSON.stringify(formatted));
          } catch {}
          return formatted;
        }
      }
    } catch {}

    // 3. Tertiary: In-browser cached leaderboard from previous successful fetch
    try {
      const cached = localStorage.getItem("robocity_leaderboard_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}

    // Never execute direct Supabase anon queries in browser that strip scores due to RLS
    return formatLeaderboardEntries(getLocalTournamentTeams());
  }

  const db = client || getServiceSupabase();

  try {
    const fetchDb = async () => {
      // 1. Direct join query
      try {
        const { data, error } = await db
          .from("teams")
          .select(`
            id,
            team_name,
            team_logo_url,
            robot_image_url,
            created_at,
            updated_at,
            scores (*),
            team_members (*)
          `);

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (e) {
        console.warn("Direct join query notice:", e);
      }

      // 2. Parallel queries fallback
      try {
        const [teamsRes, scoresRes, membersRes] = await Promise.all([
          db.from("teams").select("id, team_name, team_logo_url, robot_image_url, created_at, updated_at"),
          db.from("scores").select("*"),
          db.from("team_members").select("id, team_id, name, branch, year"),
        ]);

        const teamsData = teamsRes.data || [];
        if (teamsData.length === 0) return [];

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

        return teamsData.map((t: any) => ({
          id: t.id,
          team_name: t.team_name,
          team_logo_url: t.team_logo_url,
          robot_image_url: t.robot_image_url,
          created_at: t.created_at,
          updated_at: t.updated_at,
          scores: scoreMap.get(t.id) || null,
          team_members: memberMap.get(t.id) || [],
        }));
      } catch (e) {
        console.warn("Parallel query notice:", e);
        return [];
      }
    };

    const timeoutPromise = new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 5000));
    const rawTeamsList: any[] = await Promise.race([fetchDb(), timeoutPromise]);

    if (!rawTeamsList || rawTeamsList.length === 0) {
      if (typeof window !== "undefined") {
        return formatLeaderboardEntries(getLocalTournamentTeams());
      }
      return getInitialLeaderboardEntries();
    }

    const fallbackList = getInitialLeaderboardEntries();

    const list: Omit<LeaderboardEntry, "rank">[] = rawTeamsList.map((t: any) => {
      const rawScores = t.scores || t.score;
      let scoreObj = Array.isArray(rawScores) ? rawScores[0] : rawScores;
      const rawMembers = t.team_members || t.members || [];
      const leaderName = Array.isArray(rawMembers) && rawMembers[0]?.name ? rawMembers[0].name.trim() : null;

      // Preserve known tournament scores if team has not yet been recorded in database
      if (!scoreObj || ((scoreObj.round2_score ?? 0) === 0 && !scoreObj.round2_details)) {
        const seedMatch = fallbackList.find(
          (f) => f.team_name.toLowerCase().trim() === (t.team_name || "").toLowerCase().trim()
        );
        if (seedMatch && seedMatch.round2_score > 0) {
          scoreObj = {
            screening_status: seedMatch.screening_status,
            round1_status: seedMatch.round1_status,
            round1_score: seedMatch.round1_score,
            round2_score: seedMatch.round2_score,
            round3_score: seedMatch.round3_score,
            round2_details: seedMatch.round2_details,
            round3_details: seedMatch.round3_details,
            details: seedMatch.details,
          };
        }
      }

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
        updated_at: scoreObj?.updated_at || t.updated_at,
        members: Array.isArray(rawMembers) ? rawMembers : [],
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
