import { NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { EventGalleryImage } from "@/types/database";

export const dynamic = "force-dynamic";

const DUMMY_IMAGE_IDS = ["img-1", "img-2", "img-3", "img-4", "img-5", "img-6"];

let memoryImages: EventGalleryImage[] = [];

export async function GET() {
  if (isSupabaseConfigured) {
    try {
      const supabase = getServiceSupabase();

      // Clean up legacy dummy mock images from database if present
      try {
        await supabase.from("event_gallery_images").delete().in("id", DUMMY_IMAGE_IDS);
      } catch {}

      const { data, error } = await supabase
        .from("event_gallery_images")
        .select("*")
        .order("display_order", { ascending: true });

      if (!error && Array.isArray(data)) {
        // Exclude any legacy dummy items
        const filtered = (data as EventGalleryImage[]).filter(
          (img) => !DUMMY_IMAGE_IDS.includes(img.id)
        );
        memoryImages = filtered;
        return NextResponse.json(
          { success: true, data: memoryImages },
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
      console.warn("Supabase GET event_gallery_images notice:", err);
    }
  }

  // Fast fallback to memoryImages (filtered)
  const cleanMemory = memoryImages.filter((img) => !DUMMY_IMAGE_IDS.includes(img.id));
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
    memoryImages = memoryImages.filter((img) => !DUMMY_IMAGE_IDS.includes(img.id));
    memoryImages.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

    // Persist to Supabase
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

    // Persist delete to Supabase
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
