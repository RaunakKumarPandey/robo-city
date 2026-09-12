import { supabase } from "@/lib/supabase";
import { TeamWithDetails, TeamMember } from "@/types/database";

/**
 * Fetch all teams from Supabase with their associated crew members and score record.
 */
export async function fetchTeamsWithDetails(): Promise<TeamWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from("teams")
      .select(`
        *,
        members:team_members(*),
        score:scores(*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching teams:", error);
      return [];
    }

    return (data || []).map((t: any) => ({
      ...t,
      members: t.members || [],
      score: Array.isArray(t.score) ? t.score[0] || null : t.score || null,
    })) as TeamWithDetails[];
  } catch (err) {
    console.error("Fetch teams exception:", err);
    return [];
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

  const validMembers = members.filter((m) => m.name && m.name.trim().length > 0);
  if (validMembers.length < 3 || validMembers.length > 5) {
    return {
      success: false,
      error: `PLEASE ADD 3–5 MEMBERS (Currently: ${validMembers.length})`,
    };
  }

  try {
    // 1. First attempt via atomic RPC if available
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "create_team_with_members",
      {
        p_team_name: trimmedName,
        p_team_logo_url: teamLogoUrl || null,
        p_robot_image_url: robotImageUrl || null,
        p_members: validMembers.map((m) => ({
          name: m.name.trim(),
          branch: m.branch?.trim() || null,
          year: m.year?.trim() || null,
        })),
      }
    );

    if (!rpcError && rpcData?.success) {
      return { success: true, teamId: rpcData.team_id };
    }

    // 2. Direct Fallback if RPC is not loaded in Supabase instance
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .insert({
        team_name: trimmedName,
        team_logo_url: teamLogoUrl?.trim() || null,
        robot_image_url: robotImageUrl?.trim() || null,
      })
      .select("id")
      .single();

    if (teamError || !teamData) {
      if (teamError?.code === "23505" || teamError?.message?.includes("unique")) {
        return { success: false, error: "TEAM NAME ALREADY EXISTS" };
      }
      return { success: false, error: "FAILED TO CREATE TEAM RECORD" };
    }

    const teamId = teamData.id;

    // Insert members
    const membersToInsert = validMembers.map((m) => ({
      team_id: teamId,
      name: m.name.trim(),
      branch: m.branch?.trim() || null,
      year: m.year?.trim() || null,
    }));

    const { error: membersError } = await supabase
      .from("team_members")
      .insert(membersToInsert);

    if (membersError) {
      console.error("Members creation error:", membersError);
    }

    // Insert initial score
    await supabase.from("scores").insert({
      team_id: teamId,
      round1_score: 0,
      round2_score: 0,
      round3_score: 0,
    });

    return { success: true, teamId };
  } catch (err) {
    console.error("Create team exception:", err);
    return { success: false, error: "SOMETHING WENT WRONG. PLEASE TRY AGAIN." };
  }
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

  const validMembers = members.filter((m) => m.name && m.name.trim().length > 0);
  if (validMembers.length < 3 || validMembers.length > 5) {
    return {
      success: false,
      error: `PLEASE ADD 3–5 MEMBERS (Currently: ${validMembers.length})`,
    };
  }

  try {
    // 1. Try via RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "update_team_with_members",
      {
        p_team_id: teamId,
        p_team_name: trimmedName,
        p_team_logo_url: teamLogoUrl || null,
        p_robot_image_url: robotImageUrl || null,
        p_members: validMembers.map((m) => ({
          name: m.name.trim(),
          branch: m.branch?.trim() || null,
          year: m.year?.trim() || null,
        })),
      }
    );

    if (!rpcError && rpcData?.success) {
      return { success: true };
    }

    // 2. Direct Fallback
    const { error: teamError } = await supabase
      .from("teams")
      .update({
        team_name: trimmedName,
        team_logo_url: teamLogoUrl?.trim() || null,
        robot_image_url: robotImageUrl?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", teamId);

    if (teamError) {
      if (teamError.code === "23505" || teamError.message.includes("unique")) {
        return { success: false, error: "TEAM NAME ALREADY EXISTS" };
      }
      return { success: false, error: "FAILED TO UPDATE TEAM RECORD" };
    }

    // Re-sync members: delete old & insert new
    await supabase.from("team_members").delete().eq("team_id", teamId);

    const membersToInsert = validMembers.map((m) => ({
      team_id: teamId,
      name: m.name.trim(),
      branch: m.branch?.trim() || null,
      year: m.year?.trim() || null,
    }));

    await supabase.from("team_members").insert(membersToInsert);

    return { success: true };
  } catch (err) {
    console.error("Update team exception:", err);
    return { success: false, error: "SOMETHING WENT WRONG. PLEASE TRY AGAIN." };
  }
}

/**
 * Permanently delete a team (cascading deletes members and score).
 */
export async function deleteTeamRecord(
  teamId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("teams").delete().eq("id", teamId);

    if (error) {
      console.error("Delete team error:", error);
      return { success: false, error: "FAILED TO DELETE TEAM" };
    }

    return { success: true };
  } catch (err) {
    console.error("Delete team exception:", err);
    return { success: false, error: "SOMETHING WENT WRONG. PLEASE TRY AGAIN." };
  }
}
