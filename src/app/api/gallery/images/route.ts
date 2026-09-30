import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { initialGalleryImages } from "@/data/initialGalleryData";
import { EventGalleryImage } from "@/types/database";

export const dynamic = "force-dynamic";

// In-memory fallback cache so operations work smoothly even if Supabase table is not yet created
let memoryImages: EventGalleryImage[] = [...initialGalleryImages];

export async function GET() {
  const supabase = getServiceSupabase();

  try {
    const { data, error } = await supabase
      .from("event_gallery_images")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && data && data.length > 0) {
      memoryImages = data as EventGalleryImage[];
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
    console.warn("Supabase GET event_gallery_images fallback:", err);
  }

  return NextResponse.json(
    { success: true, data: memoryImages },
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
      display_order: Number(body.display_order) || 1,
      updated_at: new Date().toISOString(),
    };

    // Update in-memory store
    const existingIndex = memoryImages.findIndex((img) => img.id === record.id);
    if (existingIndex >= 0) {
      memoryImages[existingIndex] = record;
    } else {
      memoryImages.push(record);
    }
    memoryImages.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

    // Try persisting to Supabase if table exists
    try {
      const { data, error } = await supabase
        .from("event_gallery_images")
        .upsert([record], { onConflict: "id" })
        .select()
        .maybeSingle();

      if (!error && data) {
        return NextResponse.json({ success: true, data: data || record });
      }
    } catch (err) {
      console.warn("Supabase upsert gallery image notice:", err);
    }

    return NextResponse.json({ success: true, data: record });
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

    // Always remove from in-memory store
    memoryImages = memoryImages.filter((img) => img.id !== id);

    // Try deleting from Supabase if table exists
    try {
      await supabase.from("event_gallery_images").delete().eq("id", id);
    } catch (err) {
      console.warn("Supabase delete gallery image notice:", err);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
