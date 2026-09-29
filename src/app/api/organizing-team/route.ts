import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { initialOrganizingTeam } from "@/data/initialOrganizingTeam";
import { OrganizingMember } from "@/types/database";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("organizing_team")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && data && data.length > 0) {
      return NextResponse.json({ success: true, data });
    }
  } catch {
    // Ignore error and return seed data
  }

  return NextResponse.json({ success: true, data: initialOrganizingTeam });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<OrganizingMember>;
    const record: OrganizingMember = {
      id: body.id || `org-${Date.now()}`,
      name: body.name || "Crew Member",
      role: body.role || "Squad Lead",
      category: body.category || "Core Squad",
      year: body.year || null,
      photo_url: body.photo_url || null,
      phone: body.phone || null,
      email: body.email || null,
      linkedin: body.linkedin || null,
      instagram: body.instagram || null,
      github: body.github || null,
      bio: body.bio || null,
      display_order: body.display_order ?? 99,
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from("organizing_team")
        .upsert([record], { onConflict: "id" })
        .select()
        .maybeSingle();

      if (!error && data) {
        return NextResponse.json({ success: true, data });
      }
    } catch {
      // Return record as fallback
    }

    return NextResponse.json({ success: true, data: record });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 400 }
    );
  }
}
