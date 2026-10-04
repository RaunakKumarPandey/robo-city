"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Camera,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Upload,
  Sparkles,
} from "lucide-react";
import { EventPoster, EventGalleryImage } from "@/types/database";
import {
  fetchEventPosters,
  saveEventPoster,
  deleteEventPoster,
  fetchGalleryImages,
  saveGalleryImage,
  deleteGalleryImage,
  getCachedPosters,
  getCachedGalleryImages,
  syncLocalGalleryToCloud,
} from "@/lib/gallery";

const POSTER_CATEGORIES = [
  "Official Festival Poster",
  "Arena Championship",
  "Hands-on Workshop",
  "Recruitment & Registration",
  "Sponsors & Partners",
  "Schedule & Guidelines",
] as const;

const PHOTO_CATEGORIES = [
  "Arena Battles",
  "Workshops & Garage",
  "Awards & Podium",
  "Crew Moments",
  "VIP & Guests",
  "Scrutiny & Inspection",
] as const;

export default function AdminGalleryPage() {
  const [activeTab, setActiveTab] = useState<"posters" | "photos">("posters");
  const [posters, setPosters] = useState<EventPoster[]>(() => getCachedPosters());
  const [images, setImages] = useState<EventGalleryImage[]>(() => getCachedGalleryImages());
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Poster Modal State
  const [posterModalOpen, setPosterModalOpen] = useState(false);
  const [editingPoster, setEditingPoster] = useState<EventPoster | null>(null);
  const [posterTitle, setPosterTitle] = useState("");
  const [posterTagline, setPosterTagline] = useState("");
  const [posterCategory, setPosterCategory] = useState<string>("Official Festival Poster");
  const [posterImageUrl, setPosterImageUrl] = useState("");
  const [posterDownloadUrl, setPosterDownloadUrl] = useState("");
  const [posterReleaseDate, setPosterReleaseDate] = useState("OCTOBER 2026");
  const [posterFeatured, setPosterFeatured] = useState(false);
  const [posterOrder, setPosterOrder] = useState<number>(1);

  // Photo Modal State
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<EventGalleryImage | null>(null);
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoCategory, setPhotoCategory] = useState<string>("Arena Battles");
  const [photoImageUrl, setPhotoImageUrl] = useState("");
  const [photoPhotographer, setPhotoPhotographer] = useState("IEEE Media Wing");
  const [photoTag, setPhotoTag] = useState("ROBOVERSE '26");
  const [photoFeatured, setPhotoFeatured] = useState(false);
  const [photoOrder, setPhotoOrder] = useState<number>(1);

  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [postersData, imagesData] = await Promise.all([
        fetchEventPosters(),
        fetchGalleryImages(),
      ]);
      if (postersData && Array.isArray(postersData)) {
        setPosters(postersData);
      }
      if (imagesData && Array.isArray(imagesData)) {
        setImages(imagesData);
      }
    } catch {
      // Keep cached
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    syncLocalGalleryToCloud().then(() => loadData()).catch(() => {});

    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener("gallery_updated", handleUpdate);
    return () => window.removeEventListener("gallery_updated", handleUpdate);
  }, []);

  const notify = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const [compressing, setCompressing] = useState(false);

  // High-speed client-side image compressor & optimizer to keep web lightning fast
  const compressImageFile = (file: File, maxWidth = 1280, quality = 0.78): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type === "image/svg+xml") {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve("");
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // Downscale large camera photos while preserving crystal clarity and exact aspect ratio
          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(img.src);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const optimizedData = canvas.toDataURL("image/jpeg", quality);
          resolve(optimizedData);
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  // File Upload Handlers (optimizes and converts local file)
  const handlePosterFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    try {
      const optimized = await compressImageFile(file, 1400, 0.82);
      if (optimized) {
        setPosterImageUrl(optimized);
        notify("success", "Poster optimized and loaded!");
      }
    } catch {
      notify("error", "Failed to process poster file.");
    } finally {
      setCompressing(false);
    }
  };

  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    try {
      const optimized = await compressImageFile(file, 1280, 0.78);
      if (optimized) {
        setPhotoImageUrl(optimized);
        notify("success", "Photo optimized and loaded!");
      }
    } catch {
      notify("error", "Failed to process photo file.");
    } finally {
      setCompressing(false);
    }
  };

  // =========================================================================
  // POSTER HANDLERS
  // =========================================================================
  const handleOpenAddPoster = () => {
    setEditingPoster(null);
    setPosterTitle("");
    setPosterTagline("");
    setPosterCategory("Official Festival Poster");
    setPosterImageUrl("");
    setPosterDownloadUrl("");
    setPosterReleaseDate("OCTOBER 2026");
    setPosterFeatured(false);
    setPosterOrder(posters.length + 1);
    setPosterModalOpen(true);
  };

  const handleOpenEditPoster = (poster: EventPoster) => {
    setEditingPoster(poster);
    setPosterTitle(poster.title || "");
    setPosterTagline(poster.tagline || "");
    setPosterCategory(poster.category || "Official Festival Poster");
    setPosterImageUrl(poster.image_url || "");
    setPosterDownloadUrl(poster.download_url || "");
    setPosterReleaseDate(poster.release_date || "OCTOBER 2026");
    setPosterFeatured(Boolean(poster.featured));
    setPosterOrder(poster.display_order ?? 1);
    setPosterModalOpen(true);
  };

  const handleSavePoster = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    // Safe fallbacks for all optional fields — no field is mandatory!
    const finalTitle = posterTitle.trim() || "RoboVerse '26 Official Poster";
    const finalImage = posterImageUrl.trim() || "/images/backgrounds/bg_home.jpg";

    const res = await saveEventPoster({
      id: editingPoster?.id,
      title: finalTitle,
      tagline: posterTagline.trim() || null,
      category: posterCategory || "Official Festival Poster",
      image_url: finalImage,
      download_url: posterDownloadUrl.trim() || finalImage,
      release_date: posterReleaseDate.trim() || "OCTOBER 2026",
      featured: posterFeatured,
      display_order: Number(posterOrder) || 1,
    });
    setSaving(false);

    if (res.success) {
      notify("success", editingPoster ? "Poster updated live!" : "New Poster published live!");
      setPosterModalOpen(false);
      loadData();
    } else {
      notify("error", res.error || "Failed to save poster.");
    }
  };

  const handleDeletePoster = async (id: string, title?: string) => {
    if (!confirm(`Are you sure you want to delete poster "${title || "Selected Poster"}"?`)) return;

    const res = await deleteEventPoster(id);
    if (res.success) {
      notify("success", "Poster deleted successfully.");
      loadData();
    } else {
      notify("error", res.error || "Failed to delete poster.");
    }
  };

  // =========================================================================
  // PHOTO HANDLERS
  // =========================================================================
  const handleOpenAddPhoto = () => {
    setEditingImage(null);
    setPhotoTitle("");
    setPhotoCaption("");
    setPhotoCategory("Arena Battles");
    setPhotoImageUrl("");
    setPhotoPhotographer("IEEE Media Wing");
    setPhotoTag("ROBOVERSE '26");
    setPhotoFeatured(false);
    setPhotoOrder(images.length + 1);
    setPhotoModalOpen(true);
  };

  const handleOpenEditPhoto = (img: EventGalleryImage) => {
    setEditingImage(img);
    setPhotoTitle(img.title || "");
    setPhotoCaption(img.caption || "");
    setPhotoCategory(img.category || "Arena Battles");
    setPhotoImageUrl(img.image_url || "");
    setPhotoPhotographer(img.photographer || "IEEE Media Wing");
    setPhotoTag(img.tag || "ROBOVERSE '26");
    setPhotoFeatured(Boolean(img.featured));
    setPhotoOrder(img.display_order ?? 1);
    setPhotoModalOpen(true);
  };

  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    // Safe fallbacks for all optional fields — no field is mandatory!
    const finalTitle = photoTitle.trim() || "Event Moment";
    const finalImage = photoImageUrl.trim() || "/images/backgrounds/bg_missions.jpg";

    const res = await saveGalleryImage({
      id: editingImage?.id,
      title: finalTitle,
      caption: photoCaption.trim() || null,
      category: photoCategory || "Arena Battles",
      image_url: finalImage,
      photographer: photoPhotographer.trim() || "IEEE Media",
      tag: photoTag.trim() || "ROBOVERSE '26",
      featured: photoFeatured,
      display_order: Number(photoOrder) || 1,
    });
    setSaving(false);

    if (res.success) {
      notify("success", editingImage ? "Gallery photo updated live!" : "New Photo added to gallery!");
      setPhotoModalOpen(false);
      loadData();
    } else {
      notify("error", res.error || "Failed to save photo.");
    }
  };

  const handleDeletePhoto = async (id: string, title?: string | null) => {
    if (!confirm(`Are you sure you want to delete photo "${title || "Selected Photo"}"?`)) return;

    const res = await deleteGalleryImage(id);
    if (res.success) {
      notify("success", "Photo removed from gallery.");
      loadData();
    } else {
      notify("error", res.error || "Failed to delete photo.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 font-mono text-xs font-bold backdrop-blur-xl shadow-2xl ${
            notification.type === "success"
              ? "border-emerald-500/50 bg-[#0A0718]/95 text-emerald-400"
              : "border-red-500/50 bg-[#0A0718]/95 text-red-400"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#35D9FF] uppercase">
            <Sparkles className="h-3.5 w-3.5 text-[#FF2D8D]" />
            <span>MEDIA &amp; VISUAL ASSETS DISPATCH</span>
          </div>
          <h1 className="mt-1 font-mono text-2xl sm:text-3xl font-black uppercase tracking-wide text-white">
            EVENT POSTERS &amp; GALLERY
          </h1>
          <p className="mt-1 text-xs text-zinc-400 font-mono">
            Upload official event posters and live event photos. Everything updates instantly on the public website.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/gallery"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 font-mono text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>View Live Page</span>
          </Link>

          {activeTab === "posters" ? (
            <button
              onClick={handleOpenAddPoster}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF2D8D] to-[#FF7A3D] px-4 py-2 font-mono text-xs font-black uppercase text-white shadow-[0_0_20px_rgba(255,45,141,0.4)] hover:scale-105 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Poster</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddPhoto}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#35D9FF] to-[#3B82F6] px-4 py-2 font-mono text-xs font-black uppercase text-black shadow-[0_0_20px_rgba(53,217,255,0.4)] hover:scale-105 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Event Photo</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab("posters")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
            activeTab === "posters"
              ? "border border-[#FF7A3D] bg-[#FF7A3D]/20 text-[#FF7A3D] shadow-[0_0_15px_rgba(255,122,61,0.3)]"
              : "border border-white/10 bg-white/5 text-zinc-400 hover:text-white"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>OFFICIAL POSTERS ({posters.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("photos")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
            activeTab === "photos"
              ? "border border-[#35D9FF] bg-[#35D9FF]/20 text-[#35D9FF] shadow-[0_0_15px_rgba(53,217,255,0.3)]"
              : "border border-white/10 bg-white/5 text-zinc-400 hover:text-white"
          }`}
        >
          <Camera className="h-4 w-4" />
          <span>EVENT MOMENTS GALLERY ({images.length})</span>
        </button>
      </div>

      {/* TAB 1: POSTERS MANAGEMENT */}
      {activeTab === "posters" && (
        <div className="space-y-6">
          {loading ? (
            <div className="py-20 text-center font-mono text-sm text-zinc-400">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#FF7A3D] border-t-transparent mb-3" />
              <div>LOADING POSTERS...</div>
            </div>
          ) : posters.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#0F0B1E] p-12 text-center">
              <Layers className="mx-auto h-12 w-12 text-zinc-600 mb-3" />
              <div className="font-mono text-base font-bold text-white uppercase">
                NO POSTERS ADDED YET
              </div>
              <p className="mt-1 text-xs text-zinc-400 font-mono">
                Click &quot;Add New Poster&quot; to publish your first official festival artwork.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posters.map((poster) => (
                <div
                  key={poster.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0F0B1E] p-4 transition-all hover:border-[#FF7A3D]/60"
                >
                  <div>
                    {/* Top category & order */}
                    <div className="flex items-center justify-between font-mono text-[10px] font-bold text-zinc-400 mb-2">
                      <span className="rounded bg-[#FF7A3D]/20 text-[#FF7A3D] px-2 py-0.5 border border-[#FF7A3D]/30">
                        {poster.category}
                      </span>
                      <span>#{String(poster.display_order).padStart(2, "0")}</span>
                    </div>

                    {/* Poster Image Frame */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-white/10 bg-[#06040C] flex items-center justify-center">
                      <img
                        src={poster.image_url}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover blur-xl scale-125 opacity-25 pointer-events-none"
                      />
                      <img
                        src={poster.image_url}
                        alt={poster.title}
                        className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain object-center"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/backgrounds/bg_home.jpg";
                        }}
                      />
                    </div>

                    {/* Poster Info */}
                    <div className="mt-3">
                      <h3 className="font-mono text-sm font-black text-white uppercase truncate">
                        {poster.title}
                      </h3>
                      {poster.tagline && (
                        <p className="font-mono text-xs text-zinc-400 truncate mt-0.5">
                          {poster.tagline}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="font-mono text-[10px] text-zinc-500">
                      {poster.release_date || "OCT 2026"}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditPoster(poster)}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 font-mono text-xs font-bold text-zinc-300 hover:border-[#35D9FF] hover:text-[#35D9FF] transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeletePoster(poster.id, poster.title)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PHOTOS GALLERY MANAGEMENT */}
      {activeTab === "photos" && (
        <div className="space-y-6">
          {loading ? (
            <div className="py-20 text-center font-mono text-sm text-zinc-400">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#35D9FF] border-t-transparent mb-3" />
              <div>LOADING GALLERY PHOTOS...</div>
            </div>
          ) : images.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#0F0B1E] p-12 text-center">
              <Camera className="mx-auto h-12 w-12 text-zinc-600 mb-3" />
              <div className="font-mono text-base font-bold text-white uppercase">
                NO GALLERY PHOTOS YET
              </div>
              <p className="mt-1 text-xs text-zinc-400 font-mono">
                Click &quot;Add Event Photo&quot; to upload moments from arena fights, workshops, and ceremony.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0F0B1E] p-3.5 transition-all hover:border-[#35D9FF]/60"
                >
                  <div>
                    {/* Top Category Badge */}
                    <div className="flex items-center justify-between font-mono text-[10px] font-bold text-zinc-400 mb-2">
                      <span className="rounded bg-[#35D9FF]/20 text-[#35D9FF] px-2 py-0.5 border border-[#35D9FF]/30">
                        {img.category}
                      </span>
                      <span>#{String(img.display_order).padStart(2, "0")}</span>
                    </div>

                    {/* Image Box */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 bg-[#06040C] flex items-center justify-center">
                      <img
                        src={img.image_url}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover blur-xl scale-125 opacity-25 pointer-events-none"
                      />
                      <img
                        src={img.image_url}
                        alt={img.title || "Gallery photo"}
                        className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain object-center"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/backgrounds/bg_missions.jpg";
                        }}
                      />
                    </div>

                    {/* Title & Caption */}
                    <div className="mt-3">
                      <h4 className="font-mono text-xs font-black text-white uppercase truncate">
                        {img.title || "Event Photo"}
                      </h4>
                      {img.caption && (
                        <p className="font-mono text-[11px] text-zinc-400 line-clamp-2 mt-0.5 leading-tight">
                          {img.caption}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5">
                    <span className="font-mono text-[9px] text-zinc-500">
                      📸 {img.photographer || "IEEE Media"}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditPhoto(img)}
                        className="inline-flex h-7 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 font-mono text-xs font-bold text-zinc-300 hover:border-[#35D9FF] hover:text-[#35D9FF] transition-colors"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeletePhoto(img.id, img.title)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT POSTER */}
      {/* ========================================================================= */}
      {posterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-2xl border border-white/15 bg-[#0F0B1E] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-mono text-lg font-black uppercase text-white">
                  {editingPoster ? "Edit Event Poster" : "Upload New Poster"}
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  All fields are optional. You can paste an image URL or choose a file from your device.
                </p>
              </div>
              <button
                onClick={() => setPosterModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePoster} className="mt-6 space-y-4">
              {/* Poster Title */}
              <div>
                <label className="block font-mono text-xs font-bold uppercase text-zinc-300 mb-1">
                  Poster Title
                </label>
                <input
                  type="text"
                  value={posterTitle}
                  onChange={(e) => setPosterTitle(e.target.value)}
                  placeholder="e.g. ROBOVERSE '26 // OFFICIAL FESTIVAL POSTER"
                  className="w-full rounded-xl border border-white/10 bg-[#07070F] px-4 py-2.5 font-mono text-xs text-white focus:border-[#FF7A3D] focus:outline-none"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block font-mono text-xs font-bold uppercase text-zinc-300 mb-1">
                  Tagline / Description
                </label>
                <input
                  type="text"
                  value={posterTagline}
                  onChange={(e) => setPosterTagline(e.target.value)}
                  placeholder="e.g. The City Never Sleeps. Neither Do The Bots."
                  className="w-full rounded-xl border border-white/10 bg-[#07070F] px-4 py-2.5 font-mono text-xs text-white focus:border-[#FF7A3D] focus:outline-none"
                />
              </div>

              {/* Category & Release Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-zinc-300 mb-1">
                    Category
                  </label>
                  <select
                    value={posterCategory}
                    onChange={(e) => setPosterCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#07070F] px-4 py-2.5 font-mono text-xs text-white focus:border-[#FF7A3D] focus:outline-none"
                  >
                    {POSTER_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-zinc-300 mb-1">
                    Release Date Badge
                  </label>
                  <input
                    type="text"
                    value={posterReleaseDate}
                    onChange={(e) => setPosterReleaseDate(e.target.value)}
                    placeholder="e.g. OCTOBER 2026"
                    className="w-full rounded-xl border border-white/10 bg-[#07070F] px-4 py-2.5 font-mono text-xs text-white focus:border-[#FF7A3D] focus:outline-none"
                  />
                </div>
              </div>

              {/* Poster Image: URL OR File Upload */}
              <div>
                <label className="block font-mono text-xs font-bold uppercase text-zinc-300 mb-1">
                  Poster Image (URL or Choose File)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={posterImageUrl.startsWith("data:") ? "(Local File Uploaded)" : posterImageUrl}
                    onChange={(e) => setPosterImageUrl(e.target.value)}
                    placeholder="Paste image URL here or click Upload"
                    className="flex-1 rounded-xl border border-white/10 bg-[#07070F] px-4 py-2.5 font-mono text-xs text-white focus:border-[#FF7A3D] focus:outline-none"
                  />
                  <label className="inline-flex items-center justify-center gap-2 cursor-pointer rounded-xl border border-[#FF7A3D]/40 bg-[#FF7A3D]/15 px-4 py-2.5 font-mono text-xs font-bold text-[#FF7A3D] hover:bg-[#FF7A3D]/30 transition-colors shrink-0">
                    <Upload className={`h-4 w-4 ${compressing ? "animate-spin" : ""}`} />
                    <span>{compressing ? "Optimizing..." : "Choose File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={compressing}
                      onChange={handlePosterFileUpload}
                      className="hidden"
                    />
                  </label>
                  {posterImageUrl && (
                    <button
                      type="button"
                      onClick={() => setPosterImageUrl("")}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-xs text-red-400 hover:bg-red-500/20 shrink-0"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {posterImageUrl && (
                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="relative h-20 w-16 overflow-hidden rounded-lg border border-white/20 bg-black">
                      <img
                        src={posterImageUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/backgrounds/bg_home.jpg";
                        }}
                      />
                    </div>
                    <span className="font-mono text-xs text-emerald-400">
                      ✓ Image preview ready
                    </span>
                  </div>
                )}
              </div>

              {/* Download URL & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-zinc-300 mb-1">
                    Download File URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={posterDownloadUrl}
                    onChange={(e) => setPosterDownloadUrl(e.target.value)}
                    placeholder="Leave empty to use Image URL"
                    className="w-full rounded-xl border border-white/10 bg-[#07070F] px-4 py-2.5 font-mono text-xs text-white focus:border-[#FF7A3D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-zinc-300 mb-1">
                    Display Order #
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={posterOrder}
                    onChange={(e) => setPosterOrder(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-[#07070F] px-4 py-2.5 font-mono text-xs text-white focus:border-[#FF7A3D] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setPosterModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-xs font-bold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF2D8D] to-[#FF7A3D] px-6 py-2.5 font-mono text-xs font-black uppercase text-white shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? "Saving..." : "Save Poster"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD / EDIT GALLERY PHOTO */}
      {/* ========================================================================= */}
      {photoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-2xl border border-white/15 bg-[#0F0B1E] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-mono text-lg font-black uppercase text-white">
                  {editingImage ? "Edit Gallery Photo" : "Upload Event Moment"}
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  All fields are optional. You can paste an image URL or choose a file from your device.
                </p>
              </div>
              <button
                onClick={() => setPhotoModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePhoto} className="mt-6 space-y-4">
              {/* Photo Title */}
              <div>
                <label className="block font-mono text-xs font-bold uppercase text-zinc-300 mb-1">
                  Photo Title / Headline
                </label>
                <input
                  type="text"
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  placeholder="e.g. Arena Scrutiny & Bot Inspection"
                  className="w-full rounded-xl border border-white/10 bg-[#07070F] px-4 py-2.5 font-mono text-xs text-white focus:border-[#35D9FF] focus:outline-none"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block font-mono text-xs font-bold uppercase text-zinc-300 mb-1">
                  Caption / Description
                </label>
                <textarea
                  rows={2}
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  placeholder="Describe what is happening in this photo..."
                  className="w-full rounded-xl border border-white/10 bg-[#07070F] px-4 py-2 font-mono text-xs text-white focus:border-[#35D9FF] focus:outline-none resize-none"
                />
              </div>

              {/* Category & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-zinc-300 mb-1">
                    Category
                  </label>
                  <select
                    value={photoCategory}
                    onChange={(e) => setPhotoCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#07070F] px-4 py-2.5 font-mono text-xs text-white focus:border-[#35D9FF] focus:outline-none"
                  >
                    {PHOTO_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-zinc-300 mb-1">
                    Tag / Label (e.g. ARENA ROUND 1)
                  </label>
                  <input
                    type="text"
                    value={photoTag}
                    onChange={(e) => setPhotoTag(e.target.value)}
                    placeholder="e.g. SCRUTINY, PIT CREW"
                    className="w-full rounded-xl border border-white/10 bg-[#07070F] px-4 py-2.5 font-mono text-xs text-white focus:border-[#35D9FF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo Image: URL OR File Upload */}
              <div>
                <label className="block font-mono text-xs font-bold uppercase text-zinc-300 mb-1">
                  Image (URL or Choose File)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={photoImageUrl.startsWith("data:") ? "(Local File Uploaded)" : photoImageUrl}
                    onChange={(e) => setPhotoImageUrl(e.target.value)}
                    placeholder="Paste image URL here or click Upload"
                    className="flex-1 rounded-xl border border-white/10 bg-[#07070F] px-4 py-2.5 font-mono text-xs text-white focus:border-[#35D9FF] focus:outline-none"
                  />
                  <label className="inline-flex items-center justify-center gap-2 cursor-pointer rounded-xl border border-[#35D9FF]/40 bg-[#35D9FF]/15 px-4 py-2.5 font-mono text-xs font-bold text-[#35D9FF] hover:bg-[#35D9FF]/30 transition-colors shrink-0">
                    <Upload className={`h-4 w-4 ${compressing ? "animate-spin" : ""}`} />
                    <span>{compressing ? "Optimizing..." : "Choose File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={compressing}
                      onChange={handlePhotoFileUpload}
                      className="hidden"
                    />
                  </label>
                  {photoImageUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoImageUrl("")}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-xs text-red-400 hover:bg-red-500/20 shrink-0"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {photoImageUrl && (
                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="relative h-20 w-28 overflow-hidden rounded-lg border border-white/20 bg-black">
                      <img
                        src={photoImageUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/backgrounds/bg_missions.jpg";
                        }}
                      />
                    </div>
                    <span className="font-mono text-xs text-emerald-400">
                      ✓ Image preview ready
                    </span>
                  </div>
                )}
              </div>

              {/* Photographer & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-zinc-300 mb-1">
                    Photographer Credit
                  </label>
                  <input
                    type="text"
                    value={photoPhotographer}
                    onChange={(e) => setPhotoPhotographer(e.target.value)}
                    placeholder="e.g. IEEE Media Wing"
                    className="w-full rounded-xl border border-white/10 bg-[#07070F] px-4 py-2.5 font-mono text-xs text-white focus:border-[#35D9FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-zinc-300 mb-1">
                    Display Order #
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={photoOrder}
                    onChange={(e) => setPhotoOrder(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-[#07070F] px-4 py-2.5 font-mono text-xs text-white focus:border-[#35D9FF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setPhotoModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-xs font-bold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#35D9FF] to-[#3B82F6] px-6 py-2.5 font-mono text-xs font-black uppercase text-black shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? "Saving..." : "Save Photo"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
