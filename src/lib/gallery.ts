import { supabase } from "@/lib/supabase";
import { EventPoster, EventGalleryImage } from "@/types/database";
import { initialEventPosters, initialGalleryImages } from "@/data/initialGalleryData";

// ============================================================================
// 1. POSTERS API & SUPABASE HANDLERS
// ============================================================================

export async function fetchEventPosters(): Promise<EventPoster[]> {
  // 1. Fetch via API
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/gallery/posters", {
        cache: "no-store",
        headers: { Pragma: "no-cache" },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data.sort(
            (a: EventPoster, b: EventPoster) =>
              (a.display_order ?? 0) - (b.display_order ?? 0)
          );
        }
      }
    } catch {
      // Fall through to Supabase
    }
  }

  // 2. Direct Supabase Query
  try {
    const { data, error } = await supabase
      .from("event_posters")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && data && data.length > 0) {
      return data as EventPoster[];
    }
  } catch (err) {
    console.warn("Supabase fetch posters fallback:", err);
  }

  // 3. Fallback Seed
  return initialEventPosters;
}

export async function saveEventPoster(
  poster: Omit<EventPoster, "id"> & { id?: string }
): Promise<{ success: boolean; data?: EventPoster; error?: string }> {
  const posterId = poster.id || `poster-${Date.now()}`;
  const record: EventPoster = {
    ...poster,
    id: posterId,
    updated_at: new Date().toISOString(),
  };

  try {
    const res = await fetch("/api/gallery/posters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("gallery_updated"));
        }
        return { success: true, data: json.data || record };
      }
    }
  } catch (err) {
    console.warn("API save poster failed, falling back:", err);
  }

  try {
    const { data, error } = await supabase
      .from("event_posters")
      .upsert([record], { onConflict: "id" })
      .select()
      .maybeSingle();

    if (!error && data) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("gallery_updated"));
      }
      return { success: true, data: data as EventPoster };
    }
    if (error) {
      return { success: false, error: error.message };
    }
  } catch (err) {
    return { success: false, error: String(err) };
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("gallery_updated"));
  }
  return { success: true, data: record };
}

export async function deleteEventPoster(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/gallery/posters?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("gallery_updated"));
        }
        return { success: true };
      }
    }
  } catch (err) {
    console.warn("API delete poster error:", err);
  }

  try {
    const { error } = await supabase.from("event_posters").delete().eq("id", id);
    if (!error) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("gallery_updated"));
      }
      return { success: true };
    }
    return { success: false, error: error.message };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ============================================================================
// 2. GALLERY IMAGES API & SUPABASE HANDLERS
// ============================================================================

export async function fetchGalleryImages(): Promise<EventGalleryImage[]> {
  // 1. Fetch via API
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/gallery/images", {
        cache: "no-store",
        headers: { Pragma: "no-cache" },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data.sort(
            (a: EventGalleryImage, b: EventGalleryImage) =>
              (a.display_order ?? 0) - (b.display_order ?? 0)
          );
        }
      }
    } catch {
      // Fall through to Supabase
    }
  }

  // 2. Direct Supabase Query
  try {
    const { data, error } = await supabase
      .from("event_gallery_images")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && data && data.length > 0) {
      return data as EventGalleryImage[];
    }
  } catch (err) {
    console.warn("Supabase fetch gallery images fallback:", err);
  }

  // 3. Fallback Seed
  return initialGalleryImages;
}

export async function saveGalleryImage(
  image: Omit<EventGalleryImage, "id"> & { id?: string }
): Promise<{ success: boolean; data?: EventGalleryImage; error?: string }> {
  const imageId = image.id || `img-${Date.now()}`;
  const record: EventGalleryImage = {
    ...image,
    id: imageId,
    updated_at: new Date().toISOString(),
  };

  try {
    const res = await fetch("/api/gallery/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("gallery_updated"));
        }
        return { success: true, data: json.data || record };
      }
    }
  } catch (err) {
    console.warn("API save gallery image failed, falling back:", err);
  }

  try {
    const { data, error } = await supabase
      .from("event_gallery_images")
      .upsert([record], { onConflict: "id" })
      .select()
      .maybeSingle();

    if (!error && data) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("gallery_updated"));
      }
      return { success: true, data: data as EventGalleryImage };
    }
    if (error) {
      return { success: false, error: error.message };
    }
  } catch (err) {
    return { success: false, error: String(err) };
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("gallery_updated"));
  }
  return { success: true, data: record };
}

export async function deleteGalleryImage(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/gallery/images?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("gallery_updated"));
        }
        return { success: true };
      }
    }
  } catch (err) {
    console.warn("API delete gallery image error:", err);
  }

  try {
    const { error } = await supabase.from("event_gallery_images").delete().eq("id", id);
    if (!error) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("gallery_updated"));
      }
      return { success: true };
    }
    return { success: false, error: error.message };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
