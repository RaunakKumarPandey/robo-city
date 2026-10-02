import { supabase } from "@/lib/supabase";
import { OrganizingMember } from "@/types/database";
import { initialOrganizingTeam } from "@/data/initialOrganizingTeam";

const TEAM_STORAGE_KEY = "robocity_organizing_team";

// Fast in-memory cache for 0ms immediate client loads
let memoryTeamCache: OrganizingMember[] | null = null;

/**
 * Synchronous getter for immediate render on page load without blank screen or spinner wait.
 * Returns in-memory cache, or localStorage cached list, or initial seed team.
 */
export function getCachedOrganizingTeam(): OrganizingMember[] {
  if (memoryTeamCache && memoryTeamCache.length > 0) {
    return memoryTeamCache;
  }

  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(TEAM_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryTeamCache = parsed;
          return parsed;
        }
      }
    } catch {}
  }

  return initialOrganizingTeam;
}

/**
 * Helper to fetch with timeout so slow network/database responses never freeze or block the UI.
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 3000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Fetches all organizing team members from API & Supabase.
 * Updates local cache and notifies views for fresh data.
 */
export async function fetchOrganizingTeam(): Promise<OrganizingMember[]> {
  // 1. Try fetching via API route with fast timeout
  if (typeof window !== "undefined") {
    try {
      const res = await fetchWithTimeout("/api/organizing-team", {
        headers: { "Accept": "application/json" },
      }, 3000);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const sorted = json.data.sort(
            (a: OrganizingMember, b: OrganizingMember) =>
              (a.display_order ?? 0) - (b.display_order ?? 0)
          );
          memoryTeamCache = sorted;
          try {
            localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(sorted));
          } catch {}
          return sorted;
        }
      }
    } catch {
      // Fall through to direct Supabase query
    }
  }

  // 2. Try direct Supabase query with fast Promise.race timeout
  try {
    const supabasePromise = supabase
      .from("organizing_team")
      .select("*")
      .order("display_order", { ascending: true });

    const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
      setTimeout(() => reject(new Error("Supabase query timeout")), 3000)
    );

    const { data, error } = (await Promise.race([supabasePromise, timeoutPromise])) as any;

    if (!error && Array.isArray(data) && data.length > 0) {
      memoryTeamCache = data as OrganizingMember[];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(data));
        } catch {}
      }
      return data as OrganizingMember[];
    }
  } catch (err) {
    // Fall back to cached or initial seed
  }

  // 3. Fallback to cached or default initial seed list
  return getCachedOrganizingTeam();
}

/**
 * Saves a new or updated organizing member (admin action).
 * Persists to Supabase via server API for global visibility.
 */
export async function saveOrganizingMember(
  member: Omit<OrganizingMember, "id"> & { id?: string }
): Promise<{ success: boolean; data?: OrganizingMember; error?: string }> {
  const memberId = member.id || `org-${Date.now()}`;
  const record: OrganizingMember = {
    ...member,
    id: memberId,
    updated_at: new Date().toISOString(),
  };

  // Update local memory & localStorage immediately for instant feedback
  if (typeof window !== "undefined") {
    try {
      const current = getCachedOrganizingTeam();
      const updated = current.some((m) => m.id === record.id)
        ? current.map((m) => (m.id === record.id ? record : m))
        : [...current, record].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
      memoryTeamCache = updated;
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("organizing_team_updated"));
    } catch {}
  }

  // 1. Send to server API endpoint (which writes to Supabase database)
  try {
    const res = await fetch("/api/organizing-team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("organizing_team_updated"));
        }
        return { success: true, data: json.data || record };
      }
    }
  } catch (err) {
    console.warn("API save failed, attempting direct Supabase upsert:", err);
  }

  // 2. Attempt direct Supabase upsert
  try {
    const { data, error } = await supabase
      .from("organizing_team")
      .upsert([record], { onConflict: "id" })
      .select()
      .maybeSingle();

    if (!error && data) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("organizing_team_updated"));
      }
      return { success: true, data: data as OrganizingMember };
    }
    if (error) {
      return { success: false, error: error.message };
    }
  } catch (err) {
    return { success: false, error: String(err) };
  }

  return { success: true, data: record };
}

/**
 * Deletes an organizing member (admin action).
 */
export async function deleteOrganizingMember(
  id: string
): Promise<{ success: boolean; error?: string }> {
  // Update local memory & localStorage immediately
  if (typeof window !== "undefined") {
    try {
      const current = getCachedOrganizingTeam();
      const updated = current.filter((m) => m.id !== id);
      memoryTeamCache = updated;
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("organizing_team_updated"));
    } catch {}
  }

  // 1. Delete via server API endpoint
  try {
    const res = await fetch(`/api/organizing-team?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("organizing_team_updated"));
        }
        return { success: true };
      }
    }
  } catch (err) {
    console.warn("API delete failed:", err);
  }

  // 2. Direct Supabase delete
  try {
    const { error } = await supabase.from("organizing_team").delete().eq("id", id);
    if (!error) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("organizing_team_updated"));
      }
      return { success: true };
    }
    return { success: false, error: error.message };
  } catch (err) {
    return { success: false, error: String(err) };
  }

  return { success: true };
}
