import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { initialGalleryImages } from "@/data/initialGalleryData";
import { EventGalleryImage } from "@/types/database";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getServiceSupabase();

  try {
    const { data, error } = await supabase
      .from("event_gallery_images")
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
    console.error("API GET event_gallery_images error:", err);
  }

  return NextResponse.json(
    { success: true, data: initialGalleryImages },
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
    const body = (await request.json()) as Partial<EventGalleryImage>;
    const imageId = body.id || `img-${Date.now()}`;

    const record: EventGalleryImage = {
      id: imageId,
      title: body.title || "Event Moment",
      caption: body.caption || null,
      category: body.category || "Arena Battles",
      image_url: body.image_url || "/images/backgrounds/bg_missions.jpg",
      photographer: body.photographer || "IEEE Media",
      tag: body.tag || "ROBOVERSE '26",
      featured: Boolean(body.featured),
      display_order: Number(body.display_order) || 99,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("event_gallery_images")
      .upsert([record], { onConflict: "id" })
      .select()
      .maybeSingle();

    if (error) {
      console.error("Supabase upsert gallery image error:", error);
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
        { success: false, error: "Missing image id" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("event_gallery_images").delete().eq("id", id);

    if (error) {
      console.error("Supabase delete gallery image error:", error);
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
