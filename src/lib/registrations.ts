import { supabase } from "@/lib/supabase";
import { RegistrationSubmission, RegistrationResult } from "@/types/database";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate input fields before submission
 */
export function validateRegistration(data: RegistrationSubmission): {
  valid: boolean;
  error?: string;
} {
  const teamName = data.teamName?.trim();
  if (!teamName) {
    return { valid: false, error: "TEAM NAME IS REQUIRED" };
  }

  const captainName = data.captainName?.trim();
  if (!captainName) {
    return { valid: false, error: "CAPTAIN NAME IS REQUIRED" };
  }

  const captainEmail = data.captainEmail?.trim();
  if (!captainEmail || !EMAIL_REGEX.test(captainEmail)) {
    return { valid: false, error: "VALID CAPTAIN EMAIL IS REQUIRED" };
  }

  const captainPhone = data.captainPhone?.trim();
  if (!captainPhone || captainPhone.length < 7) {
    return { valid: false, error: "VALID CAPTAIN PHONE NUMBER IS REQUIRED" };
  }

  const robotName = data.robotName?.trim();
  if (!robotName) {
    return { valid: false, error: "ROBOT NAME IS REQUIRED" };
  }

  const validMembers = (data.members || []).filter(
    (m) => m.name && m.name.trim().length > 0
  );

  if (validMembers.length < 3 || validMembers.length > 5) {
    return {
      valid: false,
      error: `CREW MUST CONTAIN 3 TO 5 MEMBERS (Currently: ${validMembers.length})`,
    };
  }

  for (let i = 0; i < validMembers.length; i++) {
    const m = validMembers[i];
    if (!m.email || !EMAIL_REGEX.test(m.email.trim())) {
      return {
        valid: false,
        error: `MEMBER ${i + 1} (${m.name}): VALID EMAIL IS REQUIRED`,
      };
    }
  }

  return { valid: true };
}

/**
 * Submits real team registration to Supabase PostgreSQL.
 * Uses atomic RPC `submit_team_registration` with fallback.
 */
export async function submitRegistration(
  data: RegistrationSubmission
): Promise<RegistrationResult> {
  const validation = validateRegistration(data);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const teamName = data.teamName.trim();
  const captainName = data.captainName.trim();
  const captainEmail = data.captainEmail.trim();
  const captainPhone = data.captainPhone.trim();
  const robotName = data.robotName.trim();
  const robotImageUrl = data.robotImageUrl?.trim() || null;
  const members = data.members.map((m) => ({
    name: m.name.trim(),
    email: m.email.trim(),
    phone: m.phone?.trim() || null,
    branch: m.branch?.trim() || null,
    year: m.year?.trim() || null,
    role: m.role?.trim() || "Member",
  }));

  try {
    // 1. First attempt: Atomic Database RPC Function
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "submit_team_registration",
      {
        p_team_name: teamName,
        p_captain_name: captainName,
        p_captain_email: captainEmail,
        p_captain_phone: captainPhone,
        p_robot_name: robotName,
        p_robot_image_url: robotImageUrl,
        p_members: members,
      }
    );

    if (!rpcError && rpcData?.success) {
      return {
        success: true,
        registrationId: rpcData.registration_id,
        registrationNumber: rpcData.registration_number,
        teamId: rpcData.team_id,
        status: rpcData.status || "pending",
      };
    }

    // Check for explicit duplicate crew error from RPC
    if (rpcError?.message?.includes("ALREADY EXISTS") || rpcError?.message?.includes("unique")) {
      return {
        success: false,
        error: "THIS CREW ALREADY EXISTS",
      };
    }

    // 2. Direct Fallback Execution (if RPC not migrated yet on test environment)
    // A. Check duplicate team
    const { data: existingTeam } = await supabase
      .from("teams")
      .select("id")
      .ilike("team_name", teamName)
      .maybeSingle();

    if (existingTeam) {
      return {
        success: false,
        error: "THIS CREW ALREADY EXISTS",
      };
    }

    // B. Insert team
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .insert({
        team_name: teamName,
        team_logo_url: null,
        robot_image_url: robotImageUrl,
      })
      .select("id")
      .single();

    if (teamError || !teamData) {
      if (teamError?.code === "23505" || teamError?.message?.includes("unique")) {
        return { success: false, error: "THIS CREW ALREADY EXISTS" };
      }
      return {
        success: false,
        error: "REGISTRATION FAILED. Please check your information and try again.",
      };
    }

    const teamId = teamData.id;

    // C. Insert zero score record
    await supabase.from("scores").insert({
      team_id: teamId,
      round1_score: 0,
      round2_score: 0,
      round3_score: 0,
    });

    // D. Insert robot record
    await supabase.from("robots").insert({
      team_id: teamId,
      robot_name: robotName,
      robot_image_url: robotImageUrl,
    });

    // E. Insert registration record (generate registration number if not auto-generated)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const fallbackRegNumber = `RBV-${randomSuffix}`;

    const { data: regData, error: regError } = await supabase
      .from("registrations")
      .insert({
        team_id: teamId,
        captain_name: captainName,
        captain_email: captainEmail,
        captain_phone: captainPhone,
        status: "pending",
      })
      .select("id, registration_number")
      .single();

    const regId = regData?.id || `reg-${Date.now()}`;
    const regNumber = regData?.registration_number || fallbackRegNumber;

    // F. Insert registration_members & team_members
    const regMembersToInsert = members.map((m) => ({
      registration_id: regId,
      name: m.name,
      email: m.email,
      phone: m.phone,
      branch: m.branch,
      year: m.year,
      role: m.role,
    }));

    await supabase.from("registration_members").insert(regMembersToInsert);

    const teamMembersToInsert = members.map((m) => ({
      team_id: teamId,
      name: m.name,
      branch: m.branch,
      year: m.year,
    }));

    await supabase.from("team_members").insert(teamMembersToInsert);

    return {
      success: true,
      registrationId: regId,
      registrationNumber: regNumber,
      teamId: teamId,
      status: "pending",
    };
  } catch (err: any) {
    console.error("submitRegistration exception:", err);
    if (err?.message?.includes("ALREADY EXISTS")) {
      return { success: false, error: "THIS CREW ALREADY EXISTS" };
    }
    return {
      success: false,
      error: "REGISTRATION FAILED. Please check your information and try again.",
    };
  }
}
