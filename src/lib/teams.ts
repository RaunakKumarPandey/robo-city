import { TeamWithDetails, TeamMember } from "@/types/database";
import {
  getLocalTournamentTeams,
  saveLocalTournamentTeams,
  formatTeamsWithDetails,
} from "./teamsStorage";
import { InitialTeamSeed } from "@/data/initialLeaderboardData";
import { createDefaultRound2, createDefaultRound3 } from "./scoringUtils";

/**
 * Fetch all teams with their associated crew members and score record.
 */
export async function fetchTeamsWithDetails(): Promise<TeamWithDetails[]> {
  // 1. Try server API endpoint for direct service-role access (works on both local & remote Supabase)
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/admin/teams?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch {
      // Fall through to local tournament teams
    }
  }

  return formatTeamsWithDetails(getLocalTournamentTeams());
}

/**
 * Create a team along with members, captain registration, and initial score record.
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
  const captainName = validMembers[0]?.name || "Captain";
  const now = new Date().toISOString();

  // 1. In browser, send to server API endpoint (/api/admin/teams)
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/admin/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_name: trimmedName,
          team_logo_url: teamLogoUrl?.trim() || null,
          robot_image_url: robotImageUrl?.trim() || null,
          members: validMembers,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.teamId) {
          // Notify any other tabs & components
          saveLocalTournamentTeams(
            [
              {
                id: json.teamId,
                team_name: trimmedName,
                leader_name: captainName,
                captain_name: captainName,
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
                round2: createDefaultRound2(),
                round3: createDefaultRound3(),
                created_at: now,
                updated_at: now,
              },
              ...getLocalTournamentTeams().filter((t) => t.id !== json.teamId),
            ],
            json.teamId
          );

          return { success: true, teamId: json.teamId };
        } else if (json.error) {
          return { success: false, error: json.error };
        }
      }
    } catch (err: any) {
      console.warn("POST /api/admin/teams fetch error:", err);
    }
  }

  // 2. Fallback to local tournament store
  const newTeamId = `team-${Date.now()}`;
  const newLocalSeed: InitialTeamSeed = {
    id: newTeamId,
    team_name: trimmedName,
    leader_name: captainName,
    captain_name: captainName,
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
    round2: createDefaultRound2(),
    round3: createDefaultRound3(),
    created_at: now,
    updated_at: now,
  };

  const currentTeams = getLocalTournamentTeams();
  saveLocalTournamentTeams([newLocalSeed, ...currentTeams], newTeamId);

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
  const captainName = validMembers[0]?.name || "Captain";

  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/admin/teams", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: teamId,
          team_name: trimmedName,
          team_logo_url: teamLogoUrl?.trim() || null,
          robot_image_url: robotImageUrl?.trim() || null,
          members: validMembers,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          // Update local store
          const currentTeams = getLocalTournamentTeams();
          const index = currentTeams.findIndex((t) => t.id === teamId);
          if (index !== -1) {
            const nextTeams = [...currentTeams];
            nextTeams[index] = {
              ...nextTeams[index],
              team_name: trimmedName,
              team_logo_url: teamLogoUrl,
              robot_image_url: robotImageUrl,
              leader_name: captainName,
              captain_name: captainName,
              members: validMembers.map((m) => ({
                name: m.name.trim(),
                branch: m.branch || "General",
                year: m.year || "1st Year",
              })),
              updated_at: new Date().toISOString(),
            };
            saveLocalTournamentTeams(nextTeams, teamId);
          }
          return { success: true };
        }
      }
    } catch (err: any) {
      console.warn("PUT /api/admin/teams error:", err);
    }
  }

  // Fallback update local store
  const currentTeams = getLocalTournamentTeams();
  const index = currentTeams.findIndex((t) => t.id === teamId);
  if (index !== -1) {
    const updatedTeam = {
      ...currentTeams[index],
      team_name: trimmedName,
      team_logo_url: teamLogoUrl,
      robot_image_url: robotImageUrl,
      leader_name: captainName,
      captain_name: captainName,
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

  return { success: true };
}

/**
 * Permanently delete a team (cascading deletes members and score).
 */
export async function deleteTeamRecord(
  teamId: string
): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/admin/teams?id=${encodeURIComponent(teamId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const currentTeams = getLocalTournamentTeams();
          const filtered = currentTeams.filter((t) => t.id !== teamId);
          saveLocalTournamentTeams(filtered, teamId);
          return { success: true };
        }
      }
    } catch (err: any) {
      console.warn("DELETE /api/admin/teams error:", err);
    }
  }

  // Fallback local delete
  const currentTeams = getLocalTournamentTeams();
  const filtered = currentTeams.filter((t) => t.id !== teamId);
  saveLocalTournamentTeams(filtered, teamId);

  return { success: true };
}
