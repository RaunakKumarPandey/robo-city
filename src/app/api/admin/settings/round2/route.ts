import { NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  DEFAULT_ROUND2_SKIP_PENALTY_COST,
  DEFAULT_ROUND2_TOUCH_PENALTY_COST,
} from "@/lib/round2Settings";
import { Round2Settings } from "@/types/database";

export const dynamic = "force-dynamic";

// Server memory fallback
let serverSettingsCache: Round2Settings = {
  skip_penalty_cost: DEFAULT_ROUND2_SKIP_PENALTY_COST,
  touch_penalty_cost: DEFAULT_ROUND2_TOUCH_PENALTY_COST,
};

/**
 * GET /api/admin/settings/round2
 * Returns current Round 2 penalty costs.
 */
export async function GET() {
  try {
    if (isSupabaseConfigured) {
      try {
        const db = getServiceSupabase();
        const { data, error } = await db
          .from("tournament_settings")
          .select("value")
          .eq("key", "round2_penalty_costs")
          .single();

        if (!error && data?.value) {
          const skipCost = Number(data.value.skip_penalty_cost);
          const touchCost = Number(data.value.touch_penalty_cost);
          if (!isNaN(skipCost) && !isNaN(touchCost)) {
            serverSettingsCache = {
              skip_penalty_cost: Math.max(0, skipCost),
              touch_penalty_cost: Math.max(0, touchCost),
            };
          }
        }
      } catch (err) {
        console.warn("Could not query tournament_settings table (using cache):", err);
      }
    }

    return NextResponse.json({
      success: true,
      settings: serverSettingsCache,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      settings: serverSettingsCache,
    });
  }
}

/**
 * POST /api/admin/settings/round2
 * Authoritatively updates Round 2 penalty costs (Skip & Touch) via service role.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const skipCost = Math.max(
      0,
      Number(body?.skip_penalty_cost ?? DEFAULT_ROUND2_SKIP_PENALTY_COST)
    );
    const touchCost = Math.max(
      0,
      Number(body?.touch_penalty_cost ?? DEFAULT_ROUND2_TOUCH_PENALTY_COST)
    );

    if (isNaN(skipCost) || isNaN(touchCost)) {
      return NextResponse.json(
        { success: false, error: "Penalty costs must be valid non-negative numbers." },
        { status: 400 }
      );
    }

    const updatedSettings: Round2Settings = {
      skip_penalty_cost: skipCost,
      touch_penalty_cost: touchCost,
    };

    serverSettingsCache = updatedSettings;

    if (isSupabaseConfigured) {
      try {
        const db = getServiceSupabase();
        await db.from("tournament_settings").upsert(
          {
            key: "round2_penalty_costs",
            value: updatedSettings,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" }
        );
      } catch (err) {
        console.warn("Could not persist to tournament_settings table:", err);
      }
    }

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
    });
  } catch (err: any) {
    console.error("POST /api/admin/settings/round2 error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to update Round 2 settings" },
      { status: 500 }
    );
  }
}
