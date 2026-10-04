import { NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { initialEventPosters } from "@/data/initialGalleryData";
import { EventPoster } from "@/types/database";

export const dynamic = "force-dynamic";

let memoryPosters: EventPoster[] = [...initialEventPosters];

export async function GET() {
  const posterMap = new Map<string, EventPoster>();

  // 1. Seed all 4 official festival posters as base
  for (const p of initialEventPosters) {
    posterMap.set(p.id, p);
  }

  // 2. Fetch any custom or updated posters from Supabase
  if (isSupabaseConfigured) {
    try {
      const supabase = getServiceSupabase();
      const { data, error } = await supabase
        .from("event_posters")
        .select("*")
        .order("display_order", { ascending: true });

      if (!error && Array.isArray(data)) {
        for (const p of data) {
          posterMap.set(p.id, p as EventPoster);
        }
      }
    } catch (err) {
      console.warn("Supabase GET event_posters notice:", err);
    }
  }

  // 3. Merge in-memory posters
  if (Array.isArray(memoryPosters)) {
    for (const p of memoryPosters) {
      posterMap.set(p.id, p);
    }
  }

  const allPosters = Array.from(posterMap.values()).sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );
  memoryPosters = allPosters;

  return NextResponse.json(
    { success: true, data: allPosters },
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

    // Support batch sync from admin client
    if (rawBody && Array.isArray(rawBody.batch)) {
      const batchRecords: EventPoster[] = rawBody.batch.map((body: Partial<EventPoster>) => ({
        id: body.id || `poster-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: body.title || "RoboVerse '26 Official Poster",
        tagline: body.tagline || null,
        image_url: body.image_url || "/images/backgrounds/bg_home.jpg",
        download_url: body.download_url || body.image_url || "/images/backgrounds/bg_home.jpg",
        category: body.category || "Official Festival Poster",
        release_date: body.release_date || "OCTOBER 2026",
        featured: Boolean(body.featured),
        display_order: Number(body.display_order) || 1,
        updated_at: new Date().toISOString(),
      }));

      for (const rec of batchRecords) {
        const idx = memoryPosters.findIndex((p) => p.id === rec.id);
        if (idx >= 0) {
          memoryPosters[idx] = rec;
        } else {
          memoryPosters.push(rec);
        }
      }
      memoryPosters.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

      if (isSupabaseConfigured && batchRecords.length > 0) {
        try {
          await supabase.from("event_posters").upsert(batchRecords, { onConflict: "id" });
        } catch (err) {
          console.warn("Supabase batch posters upsert notice:", err);
        }
      }

      return NextResponse.json({ success: true, count: batchRecords.length, data: memoryPosters });
    }

    // Single Poster Save
    const body = rawBody as Partial<EventPoster>;
    const posterId = body.id || `poster-${Date.now()}`;

    const record: EventPoster = {
      id: posterId,
      title: body.title || "RoboVerse '26 Official Poster",
      tagline: body.tagline || null,
      image_url: body.image_url || "/images/backgrounds/bg_home.jpg",
      download_url: body.download_url || body.image_url || "/images/backgrounds/bg_home.jpg",
      category: body.category || "Official Festival Poster",
      release_date: body.release_date || "OCTOBER 2026",
      featured: Boolean(body.featured),
      display_order: Number(body.display_order) || 1,
      updated_at: new Date().toISOString(),
    };

    // Update in-memory store
    const existingIndex = memoryPosters.findIndex((p) => p.id === record.id);
    if (existingIndex >= 0) {
      memoryPosters[existingIndex] = record;
    } else {
      memoryPosters.push(record);
    }
    memoryPosters.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

    // Persist to Supabase
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("event_posters")
          .upsert([record], { onConflict: "id" })
          .select()
          .maybeSingle();

        if (!error && data) {
          return NextResponse.json({ success: true, data: data || record });
        }
      } catch (err) {
        console.warn("Supabase upsert poster notice:", err);
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
        { success: false, error: "Missing poster id" },
        { status: 400 }
      );
    }

    // Always remove from in-memory store
    memoryPosters = memoryPosters.filter((p) => p.id !== id);

    // Persist delete to Supabase
    if (isSupabaseConfigured) {
      try {
        await supabase.from("event_posters").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase delete poster notice:", err);
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
