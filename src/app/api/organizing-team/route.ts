import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { OrganizingMember } from "@/types/database";

export const dynamic = "force-dynamic";

const DUMMY_ORG_IDS = ["org-1", "org-2", "org-3", "org-4", "org-5"];

let memoryTeam: OrganizingMember[] = [];

export async function GET() {
  const supabase = getServiceSupabase();

  try {
    // Clean up legacy dummy mock members from database if present
    try {
      await supabase.from("organizing_team").delete().in("id", DUMMY_ORG_IDS);
    } catch {}

    const { data, error } = await supabase
      .from("organizing_team")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && Array.isArray(data)) {
      const filtered = (data as OrganizingMember[]).filter(
        (m) => !DUMMY_ORG_IDS.includes(m.id)
      );
      memoryTeam = filtered;
      return NextResponse.json(
        { success: true, data: memoryTeam },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }
  } catch (err) {
    console.warn("API GET organizing_team error:", err);
  }

  const cleanMemory = memoryTeam.filter((m) => !DUMMY_ORG_IDS.includes(m.id));
  return NextResponse.json(
    { success: true, data: cleanMemory },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
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
    memoryTeam = memoryTeam.filter((m) => !DUMMY_ORG_IDS.includes(m.id));
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
