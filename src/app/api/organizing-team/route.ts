import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { initialOrganizingTeam } from "@/data/initialOrganizingTeam";
import { OrganizingMember } from "@/types/database";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getServiceSupabase();

  try {
    const { data, error } = await supabase
      .from("organizing_team")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && data && data.length > 0) {
      return NextResponse.json(
        { success: true, data },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }
  } catch (err) {
    console.error("API GET organizing_team error:", err);
  }

  return NextResponse.json(
    { success: true, data: initialOrganizingTeam },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    }
  );
}

export async function POST(request: Request) {
  const supabase = getServiceSupabase();

  try {
    const body = (await request.json()) as Partial<OrganizingMember>;
    const memberId = body.id || `org-${Date.now()}`;

    const record: OrganizingMember = {
      id: memberId,
      name: body.name || "Operative",
      role: body.role || "Core Member",
      category: body.category || "Core Squad",
      year: body.year || "Final Year",
      photo_url: body.photo_url || null,
      phone: body.phone || null,
      email: body.email || null,
      linkedin: body.linkedin || null,
      instagram: body.instagram || null,
      github: body.github || null,
      bio: body.bio || null,
      display_order: Number(body.display_order) || 99,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("organizing_team")
      .upsert([record], { onConflict: "id" })
      .select()
      .maybeSingle();

    if (error) {
      console.error("Supabase upsert error:", error);
      return NextResponse.json({ success: false, error: error.message, data: record });
    }

    return NextResponse.json({ success: true, data: data || record });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const supabase = getServiceSupabase();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing member id" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("organizing_team").delete().eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
