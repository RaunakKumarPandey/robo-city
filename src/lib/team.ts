import { supabase } from "@/lib/supabase";
import { OrganizingMember } from "@/types/database";
import { initialOrganizingTeam } from "@/data/initialOrganizingTeam";

const LOCAL_STORAGE_KEY = "robocity_organizing_team_v1";

/**
 * Fetches all organizing team members from Supabase, or API/Local fallback.
 */
export async function fetchOrganizingTeam(): Promise<OrganizingMember[]> {
  try {
    // 1. Try fetching from Supabase table
    const { data, error } = await supabase
      .from("organizing_team")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && data && data.length > 0) {
      return data as OrganizingMember[];
    }
  } catch (err) {
    console.warn("Supabase fetch failed, falling back to local store:", err);
  }

  // 2. Client-side localStorage fallback check
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
        }
      }
    } catch {
      // Ignore JSON parse error
    }
  }

  // 3. Fallback to initial seed data
  return initialOrganizingTeam;
}

/**
 * Saves a new organizing member (admin action)
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

  try {
    // 1. Try saving to Supabase
    const { data, error } = await supabase
      .from("organizing_team")
      .upsert([record], { onConflict: "id" })
      .select()
      .maybeSingle();

    if (!error && data) {
      syncToLocalCache(data as OrganizingMember);
      return { success: true, data: data as OrganizingMember };
    }
  } catch (err) {
    console.warn("Supabase upsert failed:", err);
  }

  // 2. Save to client-side localStorage fallback
  if (typeof window !== "undefined") {
    try {
      syncToLocalCache(record);
      return { success: true, data: record };
    } catch (e) {
      return { success: false, error: "Failed to save locally: " + String(e) };
    }
  }

  return { success: true, data: record };
}

/**
 * Deletes an organizing member (admin action)
 */
export async function deleteOrganizingMember(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Try deleting from Supabase
    await supabase.from("organizing_team").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase delete failed:", err);
  }

  // 2. Delete from local cache
  if (typeof window !== "undefined") {
    try {
      const current = await fetchOrganizingTeam();
      const filtered = current.filter((m) => m.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      window.dispatchEvent(new Event("organizing_team_updated"));
    } catch {
      // Ignore
    }
  }

  return { success: true };
}

function syncToLocalCache(record: OrganizingMember) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    let list: OrganizingMember[] = raw ? JSON.parse(raw) : [...initialOrganizingTeam];
    const index = list.findIndex((m) => m.id === record.id);
    if (index >= 0) {
      list[index] = record;
    } else {
      list.push(record);
    }
    list.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("organizing_team_updated"));
  } catch {
    // Ignore
  }
}
