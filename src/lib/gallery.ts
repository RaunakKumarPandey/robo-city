import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { EventPoster, EventGalleryImage } from "@/types/database";
import { initialEventPosters, initialGalleryImages } from "@/data/initialGalleryData";

const POSTERS_STORAGE_KEY = "robocity_event_posters";
const IMAGES_STORAGE_KEY = "robocity_gallery_images";

// In-memory cache for instant 0ms loads
let memoryPostersCache: EventPoster[] | null = null;
let memoryImagesCache: EventGalleryImage[] | null = null;

/**
 * Synchronous getter for posters (reads memory -> localStorage -> initialEventPosters)
 */
export function getCachedPosters(): EventPoster[] {
  if (memoryPostersCache && memoryPostersCache.length > 0) {
    return memoryPostersCache;
  }

  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(POSTERS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryPostersCache = parsed;
          return parsed;
        }
      }
    } catch {}
  }

  return initialEventPosters;
}

/**
 * Synchronous getter for gallery images (reads memory -> localStorage -> initialGalleryImages)
 */
export function getCachedGalleryImages(): EventGalleryImage[] {
  if (memoryImagesCache && memoryImagesCache.length > 0) {
    return memoryImagesCache;
  }

  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(IMAGES_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryImagesCache = parsed;
          return parsed;
        }
      }
    } catch {}
  }

  return initialGalleryImages;
}

/**
 * Helper to fetch with timeout so slow network/database responses never freeze or block the UI.
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 2500): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// ============================================================================
// 1. POSTERS API & SUPABASE HANDLERS
// ============================================================================

export async function fetchEventPosters(): Promise<EventPoster[]> {
  // 1. Try fetching via API route with fast timeout
  if (typeof window !== "undefined") {
    try {
      const res = await fetchWithTimeout("/api/gallery/posters", {
        headers: { Accept: "application/json" },
      }, 2500);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const sorted = json.data.sort(
            (a: EventPoster, b: EventPoster) =>
              (a.display_order ?? 0) - (b.display_order ?? 0)
          );
          memoryPostersCache = sorted;
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

  // 2. Try direct Supabase Query with timeout if configured
  if (isSupabaseConfigured) {
    try {
      const supabasePromise = supabase
        .from("event_posters")
        .select("*")
        .order("display_order", { ascending: true });

      const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
        setTimeout(() => reject(new Error("Supabase posters query timeout")), 2000)
      );

      const { data, error } = (await Promise.race([supabasePromise, timeoutPromise])) as any;

      if (!error && Array.isArray(data) && data.length > 0) {
        memoryPostersCache = data as EventPoster[];
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(POSTERS_STORAGE_KEY, JSON.stringify(data));
          } catch {}
        }
        return data as EventPoster[];
      }
    } catch {
      // Fall through
    }
  }

  // 3. Fallback to cached or default seed
  return getCachedPosters();
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

  // Immediate local update for instant UI responsiveness
  if (typeof window !== "undefined") {
    try {
      const current = getCachedPosters();
      const updated = current.some((p) => p.id === record.id)
        ? current.map((p) => (p.id === record.id ? record : p))
        : [...current, record].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
      memoryPostersCache = updated;
      localStorage.setItem(POSTERS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("gallery_updated"));
    } catch {}
  }

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

  // 2. Direct Supabase Upsert
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
    console.warn("Direct Supabase save poster notice:", err);
  }

  return { success: true, data: record };
}

export async function deleteEventPoster(
  id: string
): Promise<{ success: boolean; error?: string }> {
  // Immediate local update
  if (typeof window !== "undefined") {
    try {
      const current = getCachedPosters();
      const updated = current.filter((p) => p.id !== id);
      memoryPostersCache = updated;
      localStorage.setItem(POSTERS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("gallery_updated"));
    } catch {}
  }

  // 1. Call server API
  try {
    await fetch(`/api/gallery/posters?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.warn("API delete poster notice:", err);
  }

  // 2. Direct Supabase delete
  try {
    await supabase.from("event_posters").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase delete poster notice:", err);
  }

  return { success: true };
}

// ============================================================================
// 2. GALLERY IMAGES API & SUPABASE HANDLERS
// ============================================================================

export async function fetchGalleryImages(): Promise<EventGalleryImage[]> {
  // 1. Try fetching via API route with fast timeout
  if (typeof window !== "undefined") {
    try {
      const res = await fetchWithTimeout("/api/gallery/images", {
        headers: { Accept: "application/json" },
      }, 2500);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const sorted = json.data.sort(
            (a: EventGalleryImage, b: EventGalleryImage) =>
              (a.display_order ?? 0) - (b.display_order ?? 0)
          );
          memoryImagesCache = sorted;
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

  // 2. Try direct Supabase query with timeout if configured
  if (isSupabaseConfigured) {
    try {
      const supabasePromise = supabase
        .from("event_gallery_images")
        .select("*")
        .order("display_order", { ascending: true });

      const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
        setTimeout(() => reject(new Error("Supabase images query timeout")), 2000)
      );

      const { data, error } = (await Promise.race([supabasePromise, timeoutPromise])) as any;

      if (!error && Array.isArray(data) && data.length > 0) {
        memoryImagesCache = data as EventGalleryImage[];
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(data));
          } catch {}
        }
        return data as EventGalleryImage[];
      }
    } catch {
      // Fall through
    }
  }

  // 3. Fallback to cached or default seed
  return getCachedGalleryImages();
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

  // Immediate local update for instant UI feedback
  if (typeof window !== "undefined") {
    try {
      const current = getCachedGalleryImages();
      const updated = current.some((img) => img.id === record.id)
        ? current.map((img) => (img.id === record.id ? record : img))
        : [...current, record].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
      memoryImagesCache = updated;
      localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("gallery_updated"));
    } catch {}
  }

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

  // 2. Direct Supabase Upsert
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
    console.warn("Direct Supabase save gallery image notice:", err);
  }

  return { success: true, data: record };
}

export async function deleteGalleryImage(
  id: string
): Promise<{ success: boolean; error?: string }> {
  // Immediate local update
  if (typeof window !== "undefined") {
    try {
      const current = getCachedGalleryImages();
      const updated = current.filter((img) => img.id !== id);
      memoryImagesCache = updated;
      localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("gallery_updated"));
    } catch {}
  }

  // 1. Call server API
  try {
    await fetch(`/api/gallery/images?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.warn("API delete gallery image notice:", err);
  }

  // 2. Direct Supabase delete
  try {
    await supabase.from("event_gallery_images").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase delete gallery image notice:", err);
  }

  return { success: true };
}
