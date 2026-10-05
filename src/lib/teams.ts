import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { TeamWithDetails, TeamMember, Score } from "@/types/database";
import { normalizeScoreData } from "./scoringUtils";
import {
  getLocalTournamentTeams,
  saveLocalTournamentTeams,
  formatTeamsWithDetails,
} from "./teamsStorage";
import { InitialTeamSeed } from "@/data/initialLeaderboardData";

/**
 * Fetch all teams with their associated crew members and score record.
 */
export async function fetchTeamsWithDetails(): Promise<TeamWithDetails[]> {
  if (!isSupabaseConfigured) {
    return formatTeamsWithDetails(getLocalTournamentTeams());
  }

  try {
    const { data, error } = await supabase
      .from("teams")
      .select(`
        *,
        members:team_members(*),
        score:scores(*),
        registrations (
          captain_name
        )
      `)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return formatTeamsWithDetails(getLocalTournamentTeams());
    }

    return (data || []).map((t: any) => {
      const regObj = Array.isArray(t.registrations) ? t.registrations[0] : t.registrations;
      const membersList = t.members || [];
      const leaderName =
        regObj?.captain_name?.trim() ||
        (Array.isArray(membersList) && membersList[0]?.name ? membersList[0].name.trim() : null);

      const rawScore = Array.isArray(t.score) ? t.score[0] || null : t.score || null;
      const normalized = normalizeScoreData(rawScore, t.team_name, leaderName, membersList);

      const scoreObj: Score | null = rawScore
        ? {
            id: rawScore.id || `score-${t.id}`,
            team_id: t.id,
            round1_score: normalized.round1_score,
            round2_score: normalized.round2_score,
            round3_score: normalized.round3_score,
            total_score: normalized.total_score,
            screening_status: normalized.screening_status,
            round1_status: normalized.round1_status,
            round2_details: normalized.round2_details,
            round3_details: normalized.round3_details,
            details: normalized.details,
            updated_at: rawScore.updated_at || new Date().toISOString(),
          }
        : null;

      return {
        ...t,
        members: membersList,
        score: scoreObj,
        leader_name: leaderName,
        captain_name: leaderName,
      };
    }) as TeamWithDetails[];
  } catch (err) {
    console.error("Fetch teams exception:", err);
    return formatTeamsWithDetails(getLocalTournamentTeams());
  }
}

/**
 * Create a team along with 3-5 members and an initial zero-score record.
 */
export async function createTeamWithMembers(
  teamName: string,
  teamLogoUrl: string | null,
  robotImageUrl: string | null,
  members: TeamMember[]
): Promise<{ success: boolean; error?: string; teamId?: string }> {
  const trimmedName = teamName.trim();
  if (!trimmedName) {
    return { success: false, error: "TEAM NAME IS REQUIRED" };
  }

  const validMembers = (members || []).filter((m) => m.name && m.name.trim().length > 0);
  const newTeamId = `team-${Date.now()}`;
  const now = new Date().toISOString();

  // Create local record
  const newLocalSeed: InitialTeamSeed = {
    id: newTeamId,
    team_name: trimmedName,
    leader_name: validMembers[0]?.name || "Captain",
    captain_name: validMembers[0]?.name || "Captain",
    team_logo_url: teamLogoUrl,
    robot_image_url: robotImageUrl,
    members: validMembers.map((m) => ({
      name: m.name.trim(),
      branch: m.branch || "General",
      year: m.year || "1st Year",
    })),
    screening_status: "qualified",
    round1_status: "pending",
    round1_score: 0,
    round2: {
      completion_time: "00:00",
      max_marks: 100,
      gain_marks: 0,
      penalty_rate: 5,
      penalty_count: 0,
    },
    round3: {
      stages: [
        { stage_number: 1, completion_time: "00:00", max_marks: 50, gain_marks: 0, penalty_rate: 5, penalty_count: 0 },
        { stage_number: 2, completion_time: "00:00", max_marks: 50, gain_marks: 0, penalty_rate: 5, penalty_count: 0 },
        { stage_number: 3, completion_time: "00:00", max_marks: 50, gain_marks: 0, penalty_rate: 5, penalty_count: 0 },
      ],
    },
    created_at: now,
    updated_at: now,
  };

  const currentTeams = getLocalTournamentTeams();
  saveLocalTournamentTeams([newLocalSeed, ...currentTeams], newTeamId);

  // Sync to Supabase if configured
  if (isSupabaseConfigured) {
    try {
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .insert({
          id: newTeamId,
          team_name: trimmedName,
          team_logo_url: teamLogoUrl?.trim() || null,
          robot_image_url: robotImageUrl?.trim() || null,
        })
        .select("id")
        .single();

      if (!teamError && teamData) {
        if (validMembers.length > 0) {
          const membersToInsert = validMembers.map((m) => ({
            team_id: newTeamId,
            name: m.name.trim(),
            branch: m.branch?.trim() || null,
            year: m.year?.trim() || null,
          }));
          await supabase.from("team_members").insert(membersToInsert);
        }

        await supabase.from("scores").insert({
          team_id: newTeamId,
          round1_score: 0,
          round2_score: 0,
          round3_score: 0,
          screening_status: "qualified",
          round1_status: "pending",
        });
      }
    } catch (err) {
      console.warn("Supabase team insert warning:", err);
    }
  }

  return { success: true, teamId: newTeamId };
}

/**
 * Update team metadata and replace member roster.
 */
export async function updateTeamWithMembers(
  teamId: string,
  teamName: string,
  teamLogoUrl: string | null,
  robotImageUrl: string | null,
  members: TeamMember[]
): Promise<{ success: boolean; error?: string }> {
  const trimmedName = teamName.trim();
  if (!trimmedName) {
    return { success: false, error: "TEAM NAME IS REQUIRED" };
  }

  const validMembers = (members || []).filter((m) => m.name && m.name.trim().length > 0);

  // Update local store
  const currentTeams = getLocalTournamentTeams();
  const index = currentTeams.findIndex((t) => t.id === teamId);
  if (index !== -1) {
    const updatedTeam = {
      ...currentTeams[index],
      team_name: trimmedName,
      team_logo_url: teamLogoUrl,
      robot_image_url: robotImageUrl,
      leader_name: validMembers[0]?.name || currentTeams[index].leader_name,
      captain_name: validMembers[0]?.name || currentTeams[index].captain_name,
      members: validMembers.map((m) => ({
        name: m.name.trim(),
        branch: m.branch || "General",
        year: m.year || "1st Year",
      })),
      updated_at: new Date().toISOString(),
    };
    const nextTeams = [...currentTeams];
    nextTeams[index] = updatedTeam;
    saveLocalTournamentTeams(nextTeams, teamId);
  }

  // Sync to Supabase if configured
  if (isSupabaseConfigured) {
    try {
      await supabase
        .from("teams")
        .update({
          team_name: trimmedName,
          team_logo_url: teamLogoUrl?.trim() || null,
          robot_image_url: robotImageUrl?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", teamId);

      await supabase.from("team_members").delete().eq("team_id", teamId);

      if (validMembers.length > 0) {
        const membersToInsert = validMembers.map((m) => ({
          team_id: teamId,
          name: m.name.trim(),
          branch: m.branch?.trim() || null,
          year: m.year?.trim() || null,
        }));
        await supabase.from("team_members").insert(membersToInsert);
      }
    } catch (err) {
      console.warn("Supabase team update warning:", err);
    }
  }

  return { success: true };
}

/**
 * Permanently delete a team (cascading deletes members and score).
 */
export async function deleteTeamRecord(
  teamId: string
): Promise<{ success: boolean; error?: string }> {
  // Delete from local store
  const currentTeams = getLocalTournamentTeams();
  const filtered = currentTeams.filter((t) => t.id !== teamId);
  saveLocalTournamentTeams(filtered, teamId);

  // Sync to Supabase if configured
  if (isSupabaseConfigured) {
    try {
      await supabase.from("teams").delete().eq("id", teamId);
    } catch (err) {
      console.warn("Supabase team delete warning:", err);
    }
  }

  return { success: true };
}
