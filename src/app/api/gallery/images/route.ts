import { NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { EventGalleryImage } from "@/types/database";

export const dynamic = "force-dynamic";

let memoryImages: EventGalleryImage[] = [];

export async function GET() {
  if (isSupabaseConfigured) {
    try {
      const supabase = getServiceSupabase();
      const { data, error } = await supabase
        .from("event_gallery_images")
        .select("*")
        .order("display_order", { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        memoryImages = data as EventGalleryImage[];
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

      // Merge all batch records into memory store without dropping any image
      for (const rec of batchRecords) {
        const idx = memoryImages.findIndex((img) => img.id === rec.id);
        if (idx >= 0) {
          memoryImages[idx] = rec;
        } else {
          memoryImages.push(rec);
        }
      }
      memoryImages.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

      // Persist batch to Supabase
      if (isSupabaseConfigured && batchRecords.length > 0) {
        try {
          await supabase
            .from("event_gallery_images")
            .upsert(batchRecords, { onConflict: "id" });
        } catch (err) {
          console.warn("Supabase batch upsert notice:", err);
        }
      }

      return NextResponse.json({ success: true, count: batchRecords.length, data: memoryImages });
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
