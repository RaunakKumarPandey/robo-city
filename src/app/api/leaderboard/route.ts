import { NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { normalizeScoreData, compareRound2ArenaTeams } from "@/lib/scoringUtils";
import { LeaderboardEntry } from "@/types/database";
import { getInitialLeaderboardEntries } from "@/data/initialLeaderboardData";

export const dynamic = "force-dynamic";

let cachedLeaderboardData: { data: any[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 5000; // 5-second in-memory server cache

/**
 * GET /api/leaderboard
 * Fetches all official tournament teams with their scores and returns live ranked leaderboard.
 */
export async function GET(request: Request) {
  const fallbackList = getInitialLeaderboardEntries();
  const url = new URL(request.url);
  const isDebug = url.searchParams.get("debug") === "true";

  let debugInfo: any = {
    isSupabaseConfigured,
    supabaseUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKeyConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    serviceKeyConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };

  try {
    // 1. Serve from in-memory cache if fresh (unless debug query)
    if (!isDebug && cachedLeaderboardData && Date.now() - cachedLeaderboardData.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({
        success: true,
        count: cachedLeaderboardData.data.length,
        data: cachedLeaderboardData.data,
        cached: true,
      });
    }

    if (!isSupabaseConfigured) {
      debugInfo.reason = "!isSupabaseConfigured";
      if (isDebug) return NextResponse.json({ success: true, count: fallbackList.length, debug: debugInfo, data: fallbackList });
      return NextResponse.json({ success: true, count: fallbackList.length, data: fallbackList });
    }

    const db = getServiceSupabase();

    const fetchDb = async () => {
      // Attempt 1: Direct Supabase join query with wildcards
      try {
        const { data, error } = await db
          .from("teams")
          .select(`
            *,
            scores (*),
            team_members (*)
          `);

        if (error) {
          debugInfo.attempt1Error = error.message || error;
        } else if (data && data.length > 0) {
          debugInfo.attempt1Count = data.length;
          return data;
        }
      } catch (e: any) {
        debugInfo.attempt1Exception = e?.message;
      }

      // Attempt 2: Resilient parallel queries with wildcard select(*)
      try {
        const [teamsRes, scoresRes, membersRes] = await Promise.all([
          db.from("teams").select("*"),
          db.from("scores").select("*"),
          db.from("team_members").select("*"),
        ]);

        debugInfo.attempt2TeamsCount = teamsRes.data?.length ?? 0;
        debugInfo.attempt2TeamsError = teamsRes.error?.message;
        debugInfo.attempt2ScoresCount = scoresRes.data?.length ?? 0;
        debugInfo.attempt2ScoresError = scoresRes.error?.message;
        debugInfo.attempt2MembersCount = membersRes.data?.length ?? 0;
        debugInfo.attempt2MembersError = membersRes.error?.message;

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
          ...t,
          scores: scoreMap.get(t.id) || null,
          team_members: memberMap.get(t.id) || [],
        }));
      } catch (e: any) {
        debugInfo.attempt2Exception = e?.message;
        return [];
      }
    };

    // 12000ms timeout race so request has ample time to connect without premature abort
    const startTime = Date.now();
    const timeoutPromise = new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 12000));
    const rawTeamsList: any[] = await Promise.race([fetchDb(), timeoutPromise]);
    debugInfo.fetchElapsedMs = Date.now() - startTime;
    debugInfo.rawTeamsListCount = rawTeamsList?.length ?? 0;

    if (!rawTeamsList || rawTeamsList.length === 0) {
      debugInfo.fellBackToSeed = true;
      if (isDebug) return NextResponse.json({ success: true, count: fallbackList.length, debug: debugInfo, data: fallbackList });
      return NextResponse.json({ success: true, count: fallbackList.length, data: fallbackList });
    }

    const list: Omit<LeaderboardEntry, "rank">[] = rawTeamsList.map((t: any) => {
      const rawScores = t.scores || t.score;
      let scoreObj = Array.isArray(rawScores) ? rawScores[0] : rawScores;
      const rawMembers = t.team_members || t.members || [];
      const leaderName = Array.isArray(rawMembers) && rawMembers[0]?.name ? rawMembers[0].name.trim() : null;

      // Retain verified scores if database has not recorded round2 yet for this team
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

    const rankedQualified: LeaderboardEntry[] = qualifiedTeams.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    const rankedNotQualified: LeaderboardEntry[] = notQualifiedTeams.map((entry, index) => ({
      ...entry,
      rank: qualifiedTeams.length + index + 1,
    }));

    const results = [...rankedQualified, ...rankedNotQualified];
    if (results.length > 0) {
      cachedLeaderboardData = { data: results, timestamp: Date.now() };
    }
    return NextResponse.json({ success: true, count: results.length, data: results });
  } catch (err: any) {
    console.error("GET /api/leaderboard error:", err);
    return NextResponse.json({ success: true, count: fallbackList.length, data: fallbackList });
  }
}
