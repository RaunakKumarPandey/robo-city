import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServiceSupabase } from "@/lib/supabase";
import { GoogleFormPayload } from "@/types/database";

/**
 * Verify HMAC SHA-256 signature
 */
function verifyHmacSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;

  const secret =
    process.env.GOOGLE_FORM_WEBHOOK_SECRET ||
    process.env.ROBO_WEBHOOK_SECRET;

  if (!secret) {
    console.error("GOOGLE_FORM_WEBHOOK_SECRET is not configured in environment variables.");
    return false;
  }

  try {
    const computedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody, "utf8")
      .digest("hex");

    // Clean any prefix like "sha256=" if present
    const cleanHeader = signatureHeader.replace(/^sha256=/i, "").trim();

    const signatureBuffer = Buffer.from(cleanHeader, "hex");
    const computedBuffer = Buffer.from(computedSignature, "hex");

    if (signatureBuffer.length !== computedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, computedBuffer);
  } catch (err) {
    console.error("HMAC verification error:", err);
    return false;
  }
}

/**
 * POST /api/integrations/google-form
 * Ingests Google Form responses submitted via Google Apps Script
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Validate Content-Type
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { success: false, error: "Invalid Content-Type. Expected application/json" },
        { status: 400 }
      );
    }

    // 2. Read raw body for HMAC verification
    const rawBody = await req.text();
    const signature = req.headers.get("x-robo-signature") || req.headers.get("X-Robo-Signature");

    // 3. Authenticate request signature
    if (!verifyHmacSignature(rawBody, signature)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid or missing webhook signature" },
        { status: 401 }
      );
    }

    // 4. Parse JSON payload
    let payload: GoogleFormPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: "Malformed JSON payload" },
        { status: 400 }
      );
    }

    // 5. Validate Required Fields
    const teamName = payload.team?.team_name?.trim();
    const captainName = payload.team?.captain_name?.trim();
    const captainEmail = payload.team?.captain_email?.trim() || payload.team?.responder_email?.trim();
    const captainPhone = payload.team?.captain_phone?.trim() || "N/A";
    const collegeName = payload.team?.college_name?.trim() || null;
    const course = payload.team?.course?.trim() || null;
    const branch = payload.team?.branch?.trim() || null;
    const year = payload.team?.year?.trim() || null;
    const responderEmail = payload.team?.responder_email?.trim() || null;
    const declaredTeamSize = payload.team?.declared_team_size || null;
    const robotName = payload.robot?.robot_name?.trim() || null;
    const robotImageUrl = payload.robot?.robot_image_url || null;
    const members = payload.members || [];
    const responseId = payload.response_id?.trim() || `gform-${Date.now()}`;

    if (!teamName || !captainName) {
      return NextResponse.json(
        { success: false, error: "Missing required team name or leader name" },
        { status: 400 }
      );
    }

    const db = getServiceSupabase();

    // 6. Execute Atomic PostgreSQL RPC Sync
    const { data: rpcData, error: rpcError } = await db.rpc(
      "sync_google_form_registration",
      {
        p_external_response_id: responseId,
        p_team_name: teamName,
        p_captain_name: captainName,
        p_captain_email: captainEmail || "unknown@domain.com",
        p_captain_phone: captainPhone,
        p_college_name: collegeName,
        p_course: course,
        p_branch: branch,
        p_year: year,
        p_responder_email: responderEmail,
        p_declared_team_size: declaredTeamSize,
        p_robot_name: robotName,
        p_robot_image_url: robotImageUrl,
        p_members: members.map((m) => ({
          name: m.name?.trim() || "Member",
          email: m.email?.trim() || "",
          phone: m.phone?.trim() || null,
          branch: m.branch?.trim() || branch,
          year: m.year?.trim() || year,
          role: m.role?.trim() || "Member",
        })),
        p_submitted_at: payload.submitted_at ? new Date(payload.submitted_at).toISOString() : new Date().toISOString(),
      }
    );

    if (!rpcError && rpcData?.success) {
      return NextResponse.json({
        success: true,
        duplicate: rpcData.duplicate || false,
        registration_id: rpcData.registration_id,
        registration_number: rpcData.registration_number,
        sync_status: rpcData.sync_status || "synced",
        sync_error: rpcData.sync_error || null,
        members_synced: rpcData.members_synced || members.length,
        message: rpcData.duplicate
          ? "Registration already synchronized (Idempotent replay)"
          : "Registration synchronized successfully to Robo City database",
      });
    }

    if (rpcError) {
      console.warn("RPC sync_google_form_registration unavailable or returned error:", rpcError);
    }

    // 7. Fallback direct execution if RPC is not loaded in Supabase
    // Check if duplicate response_id
    const { data: existingReg } = await db
      .from("registrations")
      .select("id, registration_number")
      .eq("source", "google_form")
      .eq("external_response_id", responseId)
      .maybeSingle();

    if (existingReg) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        registration_id: existingReg.id,
        registration_number: existingReg.registration_number,
        message: "Registration already synchronized (Idempotent replay)",
      });
    }

    // Check for existing team
    let teamId: string | null = null;
    const { data: existingTeam } = await db
      .from("teams")
      .select("id")
      .ilike("team_name", teamName)
      .maybeSingle();

    if (existingTeam) {
      teamId = existingTeam.id;
    } else {
      const { data: teamData, error: teamErr } = await db
        .from("teams")
        .insert({
          team_name: teamName,
          team_logo_url: null,
          robot_image_url: robotImageUrl,
        })
        .select("id")
        .maybeSingle();

      if (teamErr) {
        console.error("Fallback team insert error:", teamErr);
      }
      teamId = teamData?.id || null;

      if (teamId) {
        await db.from("scores").insert({
          team_id: teamId,
          round1_score: 0,
          round2_score: 0,
          round3_score: 0,
        });

        if (robotName) {
          await db.from("robots").insert({
            team_id: teamId,
            robot_name: robotName,
            robot_image_url: robotImageUrl,
          });
        }
      }
    }

    // Insert registration record
    const { data: newReg, error: regError } = await db
      .from("registrations")
      .insert({
        team_id: teamId,
        captain_name: captainName,
        captain_email: captainEmail || "unknown@domain.com",
        captain_phone: captainPhone,
        college_name: collegeName,
        course: course,
        branch: branch,
        year: year,
        responder_email: responderEmail,
        declared_team_size: declaredTeamSize,
        status: "pending",
        source: "google_form",
        external_response_id: responseId,
        synced_at: new Date().toISOString(),
        sync_status: "synced",
      })
      .select("id, registration_number")
      .maybeSingle();

    if (regError || !newReg) {
      console.error("Fallback registration insert failed:", regError);
      return NextResponse.json(
        {
          success: false,
          error:
            rpcError?.message ||
            regError?.message ||
            "Failed to save registration to database. Please run Supabase SQL migration 006.",
        },
        { status: 500 }
      );
    }

    const regId = newReg.id;
    const regNum = newReg.registration_number;

    if (members.length > 0) {
      await db.from("registration_members").insert(
        members.map((m) => ({
          registration_id: regId,
          name: m.name || "Member",
          email: m.email || "N/A",
          phone: m.phone || null,
          branch: m.branch || branch,
          year: m.year || year,
          role: m.role || "Member",
        }))
      );

      if (teamId) {
        await db.from("team_members").insert(
          members.map((m) => ({
            team_id: teamId,
            name: m.name || "Member",
            branch: m.branch || branch,
            year: m.year || year,
          }))
        );
      }
    }

    return NextResponse.json({
      success: true,
      duplicate: false,
      registration_id: regId,
      registration_number: regNum,
      message: "Registration synced successfully to Robo City database",
    });
  } catch (err) {
    console.error("Google form integration webhook error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error processing registration" },
      { status: 500 }
    );
  }
}

/**
 * Reject GET, PUT, DELETE with 405 Method Not Allowed
 */
export async function GET() {
  return NextResponse.json(
    { success: false, error: "Method not allowed. Use POST with HMAC signature." },
    { status: 405 }
  );
}
