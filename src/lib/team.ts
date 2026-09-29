import { supabase } from "@/lib/supabase";
import { OrganizingMember } from "@/types/database";
import { initialOrganizingTeam } from "@/data/initialOrganizingTeam";

/**
 * Fetches all organizing team members from Supabase & API.
 * Ensures fresh data for all visitors across all devices.
 */
export async function fetchOrganizingTeam(): Promise<OrganizingMember[]> {
  // 1. Try fetching via API route (bypasses RLS and works universally across all visitors)
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/organizing-team", {
        cache: "no-store",
        headers: { "Pragma": "no-cache" },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data.sort(
            (a: OrganizingMember, b: OrganizingMember) =>
              (a.display_order ?? 0) - (b.display_order ?? 0)
          );
        }
      }
    } catch {
      // Fall through to direct Supabase query
    }
  }

  // 2. Try direct Supabase query
  try {
    const { data, error } = await supabase
      .from("organizing_team")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && data && data.length > 0) {
      return data as OrganizingMember[];
    }
  } catch (err) {
    console.warn("Supabase fetch fallback:", err);
  }

  // 3. Fallback to default initial seed list
  return initialOrganizingTeam;
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

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("organizing_team_updated"));
  }

  return { success: true, data: record };
}

/**
 * Deletes an organizing member (admin action).
 */
export async function deleteOrganizingMember(
  id: string
): Promise<{ success: boolean; error?: string }> {
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
}
