import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

// Global fallback in-memory counter if Supabase is offline / unconfigured
let inMemoryVisitorCount = 0;

/**
 * Increment site visits atomically.
 * Returns the updated total count.
 */
export async function recordSiteVisit(): Promise<{ count: number; source: string }> {
  if (!isSupabaseConfigured) {
    inMemoryVisitorCount += 1;
    return { count: inMemoryVisitorCount, source: "memory-fallback" };
  }

  try {
    const db = getServiceSupabase();

    // 1. Try RPC function
    const { data: rpcData, error: rpcError } = await db.rpc("increment_site_visits");
    if (!rpcError && typeof rpcData === "number") {
      inMemoryVisitorCount = rpcData;
      return { count: rpcData, source: "supabase-rpc" };
    }

    // 2. Direct table fallback if RPC is not registered
    const { data: currentData } = await db
      .from("site_stats")
      .select("total_visits")
      .eq("id", "global_visits")
      .maybeSingle();

    const currentCount = (currentData?.total_visits as number) || inMemoryVisitorCount;
    const nextCount = currentCount + 1;

    const { error: upsertError } = await db
      .from("site_stats")
      .upsert(
        { id: "global_visits", total_visits: nextCount, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      );

    if (!upsertError) {
      inMemoryVisitorCount = nextCount;
      return { count: nextCount, source: "supabase-table" };
    }

    inMemoryVisitorCount += 1;
    return { count: inMemoryVisitorCount, source: "memory-fallback" };
  } catch (err) {
    console.error("Failed to record site visit:", err);
    inMemoryVisitorCount += 1;
    return { count: inMemoryVisitorCount, source: "memory-fallback" };
  }
}

/**
 * Get current site visits count without incrementing.
 */
export async function getSiteVisitCount(): Promise<{ count: number; source: string }> {
  if (!isSupabaseConfigured) {
    return { count: inMemoryVisitorCount, source: "memory-fallback" };
  }

  try {
    const db = getServiceSupabase();

    // 1. Try RPC function
    const { data: rpcData, error: rpcError } = await db.rpc("get_site_visits");
    if (!rpcError && typeof rpcData === "number" && rpcData >= 0) {
      inMemoryVisitorCount = rpcData;
      return { count: rpcData, source: "supabase-rpc" };
    }

    // 2. Direct table query
    const { data, error } = await db
      .from("site_stats")
      .select("total_visits")
      .eq("id", "global_visits")
      .maybeSingle();

    if (!error && data && typeof data.total_visits === "number") {
      inMemoryVisitorCount = data.total_visits;
      return { count: data.total_visits, source: "supabase-table" };
    }

    return { count: inMemoryVisitorCount, source: "memory-fallback" };
  } catch (err) {
    console.error("Failed to fetch site visits:", err);
    return { count: inMemoryVisitorCount, source: "memory-fallback" };
  }
}

/**
 * Set or reset site visit count in Supabase.
 */
export async function setSiteVisitCount(newCount: number): Promise<{ success: boolean; count: number }> {
  inMemoryVisitorCount = Math.max(0, newCount);

  if (!isSupabaseConfigured) {
    return { success: true, count: inMemoryVisitorCount };
  }

  try {
    const db = getServiceSupabase();
    const { error } = await db
      .from("site_stats")
      .upsert(
        { id: "global_visits", total_visits: inMemoryVisitorCount, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      );

    return { success: !error, count: inMemoryVisitorCount };
  } catch (err) {
    console.error("Failed to reset site visits:", err);
    return { success: false, count: inMemoryVisitorCount };
  }
}

