import { NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { EventGalleryImage } from "@/types/database";

export const dynamic = "force-dynamic";

let memoryImages: EventGalleryImage[] = [];

/**
 * Filter out any mock Unsplash photos so only real uploaded photos are served.
 */
function sanitizeGalleryImages(images: EventGalleryImage[]): EventGalleryImage[] {
  return images.filter(
    (img) =>
      img &&
      img.image_url &&
      !img.image_url.includes("images.unsplash.com") &&
      !img.image_url.includes("photo-1485827404703") &&
      !img.image_url.includes("photo-1518770660439") &&
      !img.image_url.includes("photo-1581092160607") &&
      !img.image_url.includes("photo-1567427017947") &&
      !img.image_url.includes("photo-1531482615713") &&
      !img.image_url.includes("photo-1475721027785")
  );
}

export async function GET() {
  if (isSupabaseConfigured) {
    try {
      const supabase = getServiceSupabase();

      // Clean up any legacy Unsplash mock entries in background
      try {
        await supabase
          .from("event_gallery_images")
          .delete()
          .ilike("image_url", "%unsplash.com%");
      } catch {}

      const { data, error } = await supabase
        .from("event_gallery_images")
        .select("*")
        .order("display_order", { ascending: true });

      if (!error && Array.isArray(data)) {
        const clean = sanitizeGalleryImages(data as EventGalleryImage[]);
        if (clean.length > 0 || memoryImages.length === 0) {
          memoryImages = clean;
        }
        return NextResponse.json(
          { success: true, data: memoryImages },
          {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
              "Pragma": "no-cache",
              "Expires": "0",
            },
          }
        );
      }
    } catch (err) {
      console.warn("Supabase GET event_gallery_images notice:", err);
    }
  }

  // Fast fallback to memoryImages (sanitized)
  const finalData = sanitizeGalleryImages(memoryImages);
  return NextResponse.json(
    { success: true, data: finalData },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    }
  );
}

export async function POST(request: Request) {
  const supabase = getServiceSupabase();

  try {
    const rawBody = await request.json();

    // Support batch sync from admin client (e.g. { batch: EventGalleryImage[] })
    if (rawBody && Array.isArray(rawBody.batch)) {
      const batchRecords: EventGalleryImage[] = rawBody.batch.map((body: Partial<EventGalleryImage>) => ({
        id: body.id || `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: body.title || "Event Moment",
        caption: body.caption || null,
        category: body.category || "Arena Battles",
        image_url: body.image_url || "/images/backgrounds/bg_missions.jpg",
        photographer: body.photographer || "IEEE Media",
        tag: body.tag || "ROBOVERSE '26",
        featured: Boolean(body.featured),
        display_order: Number(body.display_order) || 1,
        updated_at: new Date().toISOString(),
      }));

      const cleanBatch = sanitizeGalleryImages(batchRecords);

      // Merge into in-memory store
      for (const rec of cleanBatch) {
        const idx = memoryImages.findIndex((img) => img.id === rec.id);
        if (idx >= 0) {
          memoryImages[idx] = rec;
        } else {
          memoryImages.push(rec);
        }
      }
      memoryImages.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

      // Persist batch to Supabase
      if (isSupabaseConfigured && cleanBatch.length > 0) {
        try {
          await supabase
            .from("event_gallery_images")
            .upsert(cleanBatch, { onConflict: "id" });
        } catch (err) {
          console.warn("Supabase batch upsert notice:", err);
        }
      }

      return NextResponse.json({ success: true, count: cleanBatch.length, data: memoryImages });
    }

    // Single Record Save
    const body = rawBody as Partial<EventGalleryImage>;
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
    memoryImages = sanitizeGalleryImages(memoryImages);
    memoryImages.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

    // Persist to Supabase
    if (isSupabaseConfigured) {
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

    // Remove from in-memory store
    memoryImages = memoryImages.filter((img) => img.id !== id);

    // Persist delete to Supabase
    if (isSupabaseConfigured) {
      try {
        await supabase.from("event_gallery_images").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase delete gallery image notice:", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
