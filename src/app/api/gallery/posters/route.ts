import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { initialEventPosters } from "@/data/initialGalleryData";
import { EventPoster } from "@/types/database";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getServiceSupabase();

  try {
    const { data, error } = await supabase
      .from("event_posters")
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
    console.error("API GET event_posters error:", err);
  }

  return NextResponse.json(
    { success: true, data: initialEventPosters },
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
    const body = (await request.json()) as Partial<EventPoster>;
    const posterId = body.id || `poster-${Date.now()}`;

    const record: EventPoster = {
      id: posterId,
      title: body.title || "RoboVerse '26 Official Poster",
      tagline: body.tagline || null,
      image_url: body.image_url || "/images/backgrounds/bg_home.jpg",
      download_url: body.download_url || body.image_url || null,
      category: body.category || "Official Poster",
      release_date: body.release_date || "OCTOBER 2026",
      featured: Boolean(body.featured),
      display_order: Number(body.display_order) || 99,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("event_posters")
      .upsert([record], { onConflict: "id" })
      .select()
      .maybeSingle();

    if (error) {
      console.error("Supabase upsert poster error:", error);
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
        { success: false, error: "Missing poster id" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("event_posters").delete().eq("id", id);

    if (error) {
      console.error("Supabase delete poster error:", error);
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
