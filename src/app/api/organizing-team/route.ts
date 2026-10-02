import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { initialOrganizingTeam } from "@/data/initialOrganizingTeam";
import { OrganizingMember } from "@/types/database";

export const dynamic = "force-dynamic";

let memoryTeam: OrganizingMember[] = [...initialOrganizingTeam];

export async function GET() {
  const supabase = getServiceSupabase();

  try {
    const { data, error } = await supabase
      .from("organizing_team")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && data && data.length > 0) {
      memoryTeam = data as OrganizingMember[];
      return NextResponse.json(
        { success: true, data },
        {
          headers: {
            "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
          },
        }
      );
    }
  } catch (err) {
    console.warn("API GET organizing_team error:", err);
  }

  return NextResponse.json(
    { success: true, data: memoryTeam },
    {
      headers: {
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
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

    // Update server in-memory store
    const existingIndex = memoryTeam.findIndex((m) => m.id === record.id);
    if (existingIndex >= 0) {
      memoryTeam[existingIndex] = record;
    } else {
      memoryTeam.push(record);
    }
    memoryTeam.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

    const { data, error } = await supabase
      .from("organizing_team")
      .upsert([record], { onConflict: "id" })
      .select()
      .maybeSingle();

    if (error) {
      console.warn("Supabase upsert notice:", error.message);
      return NextResponse.json({ success: true, data: record });
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

    // Always remove from in-memory store
    memoryTeam = memoryTeam.filter((m) => m.id !== id);

    const { error } = await supabase.from("organizing_team").delete().eq("id", id);

    if (error) {
      console.warn("Supabase delete notice:", error.message);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
