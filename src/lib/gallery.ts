import { supabase } from "@/lib/supabase";
import { EventPoster, EventGalleryImage } from "@/types/database";
import { initialEventPosters, initialGalleryImages } from "@/data/initialGalleryData";

const POSTERS_STORAGE_KEY = "robocity_event_posters";
const IMAGES_STORAGE_KEY = "robocity_gallery_images";

// ============================================================================
// 1. POSTERS API & SUPABASE HANDLERS
// ============================================================================

export async function fetchEventPosters(): Promise<EventPoster[]> {
  // 1. Try fetching via API route
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/gallery/posters", {
        cache: "no-store",
        headers: { Pragma: "no-cache" },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const sorted = json.data.sort(
            (a: EventPoster, b: EventPoster) =>
              (a.display_order ?? 0) - (b.display_order ?? 0)
          );
          try {
            localStorage.setItem(POSTERS_STORAGE_KEY, JSON.stringify(sorted));
          } catch {}
          return sorted;
        }
      }
    } catch {
      // Fall through
    }
  }

  // 2. Try direct Supabase Query
  try {
    const { data, error } = await supabase
      .from("event_posters")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && data && data.length > 0) {
      return data as EventPoster[];
    }
  } catch (err) {
    console.warn("Supabase fetch posters notice:", err);
  }

  // 3. Try LocalStorage
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(POSTERS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
  }

  // 4. Fallback Seed
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

  // 1. Call server API
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
    console.warn("API save poster notice:", err);
  }

  // 2. Direct Supabase
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
  } catch (err) {
    console.warn("Supabase save poster notice:", err);
  }

  // 3. LocalStorage update
  if (typeof window !== "undefined") {
    try {
      const current = await fetchEventPosters();
      const updated = current.some((p) => p.id === record.id)
        ? current.map((p) => (p.id === record.id ? record : p))
        : [...current, record];
      localStorage.setItem(POSTERS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("gallery_updated"));
    } catch {}
  }

  return { success: true, data: record };
}

export async function deleteEventPoster(
  id: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Call server API
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
    console.warn("API delete poster notice:", err);
  }

  // 2. Direct Supabase
  try {
    await supabase.from("event_posters").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase delete poster notice:", err);
  }

  // 3. LocalStorage update
  if (typeof window !== "undefined") {
    try {
      const current = await fetchEventPosters();
      const updated = current.filter((p) => p.id !== id);
      localStorage.setItem(POSTERS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("gallery_updated"));
    } catch {}
  }

  return { success: true };
}

// ============================================================================
// 2. GALLERY IMAGES API & SUPABASE HANDLERS
// ============================================================================

export async function fetchGalleryImages(): Promise<EventGalleryImage[]> {
  // 1. Try fetching via API route
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/gallery/images", {
        cache: "no-store",
        headers: { Pragma: "no-cache" },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const sorted = json.data.sort(
            (a: EventGalleryImage, b: EventGalleryImage) =>
              (a.display_order ?? 0) - (b.display_order ?? 0)
          );
          try {
            localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(sorted));
          } catch {}
          return sorted;
        }
      }
    } catch {
      // Fall through
    }
  }

  // 2. Try direct Supabase Query
  try {
    const { data, error } = await supabase
      .from("event_gallery_images")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && data && data.length > 0) {
      return data as EventGalleryImage[];
    }
  } catch (err) {
    console.warn("Supabase fetch gallery images notice:", err);
  }

  // 3. Try LocalStorage
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(IMAGES_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
  }

  // 4. Fallback Seed
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

  // 1. Call server API
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
    console.warn("API save gallery image notice:", err);
  }

  // 2. Direct Supabase
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
  } catch (err) {
    console.warn("Supabase save gallery image notice:", err);
  }

  // 3. LocalStorage update
  if (typeof window !== "undefined") {
    try {
      const current = await fetchGalleryImages();
      const updated = current.some((img) => img.id === record.id)
        ? current.map((img) => (img.id === record.id ? record : img))
        : [...current, record];
      localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("gallery_updated"));
    } catch {}
  }

  return { success: true, data: record };
}

export async function deleteGalleryImage(
  id: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Call server API
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
    console.warn("API delete gallery image notice:", err);
  }

  // 2. Direct Supabase
  try {
    await supabase.from("event_gallery_images").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase delete gallery image notice:", err);
  }

  // 3. LocalStorage update
  if (typeof window !== "undefined") {
    try {
      const current = await fetchGalleryImages();
      const updated = current.filter((img) => img.id !== id);
      localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("gallery_updated"));
    } catch {}
  }

  return { success: true };
}
