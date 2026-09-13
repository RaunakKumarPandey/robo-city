import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Server-side Supabase client with Service Role Key (if configured)
 * to bypass RLS for administrative background sync tasks.
 */
export function getServiceSupabase() {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Checks whether the given user_id has an entry in the admin_users table.
 * Verified against Supabase RLS.
 */
export async function verifyAdminStatus(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const { data, error } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

