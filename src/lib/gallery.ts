import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { EventPoster, EventGalleryImage } from "@/types/database";
import { initialEventPosters } from "@/data/initialGalleryData";

const POSTERS_STORAGE_KEY = "robocity_event_posters";
const IMAGES_STORAGE_KEY = "robocity_gallery_images";

// In-memory cache for instant 0ms loads
let memoryPostersCache: EventPoster[] | null = null;
let memoryImagesCache: EventGalleryImage[] | null = null;

/**
 * Filter out any mock Unsplash photos so only real uploaded photos are retained.
 */
export function sanitizeGalleryImages(images: EventGalleryImage[]): EventGalleryImage[] {
  if (!Array.isArray(images)) return [];
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

/**
 * Safely persist data to localStorage without crashing or keeping stale data on quota exceeded.
 */
function safeSetStorage(key: string, data: any[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    try {
      const light = data.slice(0, 30);
      localStorage.setItem(key, JSON.stringify(light));
    } catch {}
  }
}

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
        if (Array.isArray(parsed)) {
          memoryPostersCache = parsed;
          return parsed;
        }
      }
    } catch {}
  }

  return [];
}

/**
 * Synchronous getter for gallery images (reads memory -> localStorage -> empty array fallback)
 */
export function getCachedGalleryImages(): EventGalleryImage[] {
  if (memoryImagesCache && memoryImagesCache.length > 0) {
    return sanitizeGalleryImages(memoryImagesCache);
  }

  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(IMAGES_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const clean = sanitizeGalleryImages(parsed);
          memoryImagesCache = clean;
          return clean;
        }
      }
    } catch {}
  }

  return [];
}

/**
 * Helper to fetch with timeout so slow network/database responses never freeze or block the UI.
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 12000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      cache: "no-store",
      ...options,
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });
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
  // 1. Try fetching via API route with no-cache and fresh timestamp
  if (typeof window !== "undefined") {
    try {
      const res = await fetchWithTimeout(`/api/gallery/posters?_t=${Date.now()}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      }, 12000);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const sorted = json.data.sort(
            (a: EventPoster, b: EventPoster) =>
              (a.display_order ?? 0) - (b.display_order ?? 0)
          );
          memoryPostersCache = sorted;
          safeSetStorage(POSTERS_STORAGE_KEY, sorted);
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
        setTimeout(() => reject(new Error("Supabase posters query timeout")), 8000)
      );

      const { data, error } = (await Promise.race([supabasePromise, timeoutPromise])) as any;

      if (!error && Array.isArray(data)) {
        const sorted = (data as EventPoster[]).sort(
          (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
        );
        memoryPostersCache = sorted;
        safeSetStorage(POSTERS_STORAGE_KEY, sorted);
        return sorted;
      }
    } catch {
      // Fall through
    }
  }

  // 3. Fallback to cached or empty array
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
      safeSetStorage(POSTERS_STORAGE_KEY, updated);
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
  if (isSupabaseConfigured) {
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
      safeSetStorage(POSTERS_STORAGE_KEY, updated);
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
  if (isSupabaseConfigured) {
    try {
      await supabase.from("event_posters").delete().eq("id", id);
    } catch (err) {
      console.warn("Supabase delete poster notice:", err);
    }
  }

  return { success: true };
}

// ============================================================================
// 2. GALLERY IMAGES API & SUPABASE HANDLERS
// ============================================================================

export async function fetchGalleryImages(): Promise<EventGalleryImage[]> {
  // 1. Try fetching via API route with fresh timestamp and no-cache
  if (typeof window !== "undefined") {
    try {
      const res = await fetchWithTimeout(`/api/gallery/images?_t=${Date.now()}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      }, 12000);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const clean = sanitizeGalleryImages(json.data);
          const sorted = clean.sort(
            (a: EventGalleryImage, b: EventGalleryImage) =>
              (a.display_order ?? 0) - (b.display_order ?? 0)
          );
          if (sorted.length > 0 || (memoryImagesCache && memoryImagesCache.length === 0)) {
            memoryImagesCache = sorted;
            safeSetStorage(IMAGES_STORAGE_KEY, sorted);
          }
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
        setTimeout(() => reject(new Error("Supabase images query timeout")), 8000)
      );

      const { data, error } = (await Promise.race([supabasePromise, timeoutPromise])) as any;

      if (!error && Array.isArray(data)) {
        const clean = sanitizeGalleryImages(data as EventGalleryImage[]);
        const sorted = clean.sort(
          (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
        );
        memoryImagesCache = sorted;
        safeSetStorage(IMAGES_STORAGE_KEY, sorted);
        return sorted;
      }
    } catch {
      // Fall through
    }
  }

  // 3. Fallback to cached or default seed
  return getCachedGalleryImages();
}

/**
 * Auto-syncs any local admin images to the cloud API & Supabase in batch.
 */
export async function syncLocalGalleryToCloud(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const local = getCachedGalleryImages();
    if (local.length === 0) return;

    await fetch("/api/gallery/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batch: local }),
    });
  } catch (err) {
    console.warn("Auto-sync local gallery notice:", err);
  }
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
      const clean = sanitizeGalleryImages(updated);
      memoryImagesCache = clean;
      safeSetStorage(IMAGES_STORAGE_KEY, clean);
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
  if (isSupabaseConfigured) {
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
      const clean = sanitizeGalleryImages(updated);
      memoryImagesCache = clean;
      safeSetStorage(IMAGES_STORAGE_KEY, clean);
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
  if (isSupabaseConfigured) {
    try {
      await supabase.from("event_gallery_images").delete().eq("id", id);
    } catch (err) {
      console.warn("Supabase delete gallery image notice:", err);
    }
  }

  return { success: true };
}
