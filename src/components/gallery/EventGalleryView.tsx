"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Image as ImageIcon,
  Download,
  Eye,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Camera,
  Layers,
  Share2,
  ExternalLink,
  ShieldCheck,
  Flame,
  Plus,
} from "lucide-react";
import { EventPoster, EventGalleryImage } from "@/types/database";
import {
  fetchEventPosters,
  fetchGalleryImages,
  getCachedPosters,
  getCachedGalleryImages,
} from "@/lib/gallery";

const GALLERY_CATEGORIES = [
  "ALL PHOTOS",
  "ARENA BATTLES",
  "WORKSHOPS & GARAGE",
  "AWARDS & PODIUM",
  "CREW MOMENTS",
  "VIP & GUESTS",
  "SCRUTINY & INSPECTION",
] as const;

export default function EventGalleryView() {
  const [posters, setPosters] = useState<EventPoster[]>(() => getCachedPosters());
  const [images, setImages] = useState<EventGalleryImage[]>(() => getCachedGalleryImages());
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL PHOTOS");
  const [searchQuery, setSearchQuery] = useState("");

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxType, setLightboxType] = useState<"poster" | "image">("poster");
  const [activePoster, setActivePoster] = useState<EventPoster | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const loadData = async () => {
    try {
      const [postersData, imagesData] = await Promise.all([
        fetchEventPosters(),
        fetchGalleryImages(),
      ]);
      if (Array.isArray(postersData)) setPosters(postersData);
      if (Array.isArray(imagesData)) setImages(imagesData);
    } catch {
      // Keep cached data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener("gallery_updated", handleUpdate);
    return () => window.removeEventListener("gallery_updated", handleUpdate);
  }, []);

  const [visibleCount, setVisibleCount] = useState(24);

  // Reset pagination on filter / search change
  useEffect(() => {
    setVisibleCount(24);
  }, [selectedCategory, searchQuery]);

  // Filtered gallery photos
  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      const matchCat =
        selectedCategory === "ALL PHOTOS" ||
        img.category.toLowerCase().includes(selectedCategory.toLowerCase().replace("&", "").trim()) ||
        selectedCategory.toLowerCase().includes(img.category.toLowerCase());

      const matchSearch =
        !searchQuery ||
        (img.title && img.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (img.caption && img.caption.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (img.photographer && img.photographer.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (img.tag && img.tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCat && matchSearch;
    });
  }, [images, selectedCategory, searchQuery]);

  const displayedImages = useMemo(() => {
    return filteredImages.slice(0, visibleCount);
  }, [filteredImages, visibleCount]);

  const openPosterLightbox = (poster: EventPoster) => {
    setActivePoster(poster);
    setLightboxType("poster");
    setLightboxOpen(true);
  };

  const openImageLightbox = (index: number) => {
    setActiveImageIndex(index);
    setLightboxType("image");
    setLightboxOpen(true);
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % filteredImages.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
  };

  const handleShare = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "Escape") setLightboxOpen(false);
      if (lightboxType === "image") {
        if (e.key === "ArrowRight") handleNextImage();
        if (e.key === "ArrowLeft") handlePrevImage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, lightboxType, filteredImages.length]);

  return (
    <div className="relative min-h-screen w-full px-4 pt-28 pb-24 sm:px-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {copiedLink && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 rounded-xl border border-[#35D9FF]/50 bg-[#0A0718]/95 px-4 py-2.5 font-mono text-xs font-bold text-[#35D9FF] backdrop-blur-2xl shadow-[0_0_25px_rgba(53,217,255,0.4)]"
          >
            IMAGE LINK COPIED TO CLIPBOARD
          </motion.div>
        )}
      </AnimatePresence>

      {/* 75% Centered Content Container */}
      <div className="relative mx-auto w-[94%] sm:w-[90%] md:w-[85%] lg:w-[75%] max-w-6xl space-y-14">
        
        {/* ========================================================================= */}
        {/* 1. HERO HEADER */}
        {/* ========================================================================= */}
        <div className="mx-auto max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#35D9FF]/40 bg-[#120B20]/80 px-4 py-1.5 font-mono text-xs font-bold tracking-widest text-[#35D9FF] uppercase shadow-[0_0_20px_rgba(53,217,255,0.25)] backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5 text-[#FF2D8D]" />
            <span>ROBOVERSE &apos;26 // OFFICIAL MEDIA ARCHIVES</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-[0.95]">
            <span className="block text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
              EVENT POSTERS &amp;
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D8D] via-[#FF7A3D] to-[#35D9FF] filter drop-shadow-[0_0_30px_rgba(255,45,141,0.5)]">
              PHOTO GALLERY
            </span>
          </h1>

          <p className="mx-auto max-w-2xl font-mono text-xs sm:text-sm text-zinc-300 tracking-wider uppercase leading-relaxed">
            Official promotional event posters, arena combat highlights, robot scrutiny snapshots, and festival memories.
          </p>

          {/* Quick Jump Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#event-posters"
              className="inline-flex items-center gap-2 rounded-xl border border-[#FF7A3D]/40 bg-[#FF7A3D]/10 px-4 py-2 font-mono text-xs font-bold text-[#FF7A3D] hover:bg-[#FF7A3D]/20 hover:border-[#FF7A3D] transition-all shadow-[0_0_15px_rgba(255,122,61,0.2)]"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>OFFICIAL POSTERS ({posters.length})</span>
            </a>

            <a
              href="#photo-gallery"
              className="inline-flex items-center gap-2 rounded-xl border border-[#35D9FF]/40 bg-[#35D9FF]/10 px-4 py-2 font-mono text-xs font-bold text-[#35D9FF] hover:bg-[#35D9FF]/20 hover:border-[#35D9FF] transition-all shadow-[0_0_15px_rgba(53,217,255,0.2)]"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>EVENT GALLERY ({images.length})</span>
            </a>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TOP SECTION: OFFICIAL EVENT POSTERS */}
        {/* ========================================================================= */}
        <div id="event-posters" className="space-y-6 scroll-mt-28">
          {/* Section Sub-header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/15 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF7A3D] shadow-[0_0_10px_#FF7A3D]" />
              <h2 className="font-mono text-lg sm:text-xl font-black uppercase tracking-wider text-white">
                OFFICIAL EVENT POSTERS
              </h2>
              <span className="text-zinc-500 font-mono text-xs hidden sm:inline">//</span>
              <span className="text-zinc-400 font-mono text-xs hidden sm:inline">
                HIGH-RESOLUTION FESTIVAL ARTWORK
              </span>
            </div>
            <span className="rounded-md border border-[#FF7A3D]/40 bg-[#FF7A3D]/15 px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#FF7A3D] uppercase">
              {posters.length} {posters.length === 1 ? "POSTER" : "POSTERS"} ACTIVE
            </span>
          </div>

          {/* Posters Grid */}
          {loading ? (
            <div className="py-12 text-center font-mono text-sm text-zinc-400">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#FF7A3D] border-t-transparent mb-3" />
              <div>RETRIEVING EVENT POSTERS...</div>
            </div>
          ) : posters.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#120B20]/60 p-12 text-center backdrop-blur-xl">
              <Layers className="mx-auto h-12 w-12 text-zinc-600 mb-3" />
              <div className="font-mono text-base font-bold text-white uppercase">
                NO POSTERS UPLOADED YET
              </div>
              <p className="mt-1 text-xs text-zinc-400 font-mono">
                Official festival posters will appear here as soon as published by the organizers.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posters.map((poster, pIdx) => (
                <motion.div
                  key={poster.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-b from-[#160E2E]/90 to-[#0A0714]/95 p-4 backdrop-blur-xl transition-all duration-300 hover:border-[#FF7A3D]/70 hover:shadow-[0_0_35px_rgba(255,122,61,0.25)]"
                >
                  {/* Top Laser Accent */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF7A3D] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                  {/* Corner HUD ticks */}
                  <div className="absolute top-2 left-2 h-2 w-2 border-t-2 border-l-2 border-white/30" />
                  <div className="absolute top-2 right-2 h-2 w-2 border-t-2 border-r-2 border-white/30" />
                  <div className="absolute bottom-2 left-2 h-2 w-2 border-b-2 border-l-2 border-white/30" />
                  <div className="absolute bottom-2 right-2 h-2 w-2 border-b-2 border-r-2 border-white/30" />

                  <div>
                    {/* Top Info Bar: Category + Date */}
                    <div className="mb-3 flex items-center justify-between gap-1 font-mono text-[10px] font-bold">
                      <span className="rounded-md border border-[#FF7A3D]/40 bg-[#FF7A3D]/15 px-2 py-0.5 text-[#FF7A3D] uppercase truncate">
                        {poster.category || "OFFICIAL POSTER"}
                      </span>
                      {poster.release_date && (
                        <span className="text-zinc-400 uppercase">
                          {poster.release_date}
                        </span>
                      )}
                    </div>

                    {/* Poster Image Frame */}
                    <div
                      onClick={() => openPosterLightbox(poster)}
                      className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-white/15 bg-[#08070D] flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.8)] cursor-pointer group-hover:border-[#FF7A3D]/70 transition-all"
                    >
                      {/* Ambient Blurred Background */}
                      <img
                        src={poster.image_url}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover blur-xl scale-125 opacity-30 pointer-events-none"
                      />

                      {/* Main Full Poster */}
                      <img
                        src={poster.image_url}
                        alt={poster.title}
                        loading={pIdx < 2 ? "eager" : "lazy"}
                        decoding="async"
                        className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain object-center drop-shadow-md transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/backgrounds/bg_home.jpg";
                        }}
                      />
                      {/* Hover Overlay Button */}
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
                        <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF2D8D] to-[#FF7A3D] px-4 py-2 font-mono text-xs font-black uppercase text-white shadow-lg">
                          <Eye className="h-4 w-4" />
                          <span>EXPAND POSTER</span>
                        </div>
                      </div>
                    </div>

                    {/* Poster Details */}
                    <div className="mt-3.5 space-y-1">
                      <h3 className="font-mono text-sm sm:text-base font-black tracking-wide text-white uppercase group-hover:text-[#FFE8C7] transition-colors leading-tight">
                        {poster.title}
                      </h3>
                      {poster.tagline && (
                        <p className="font-mono text-xs text-zinc-400 line-clamp-2">
                          {poster.tagline}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Poster Actions */}
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                    <button
                      type="button"
                      onClick={() => openPosterLightbox(poster)}
                      className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#35D9FF] hover:text-white transition-colors cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>VIEW FULL</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleShare(poster.image_url)}
                        title="Copy Poster URL"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:border-white hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </button>

                      <a
                        href={poster.download_url || poster.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        title="Download Poster"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#FF7A3D]/40 bg-[#FF7A3D]/15 px-3 py-1.5 font-mono text-xs font-bold text-[#FF7A3D] hover:bg-[#FF7A3D]/30 transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>DOWNLOAD</span>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 3. BOTTOM SECTION: EVENT MOMENTS & PHOTO GALLERY */}
        {/* ========================================================================= */}
        <div id="photo-gallery" className="space-y-6 scroll-mt-28">
          {/* Section Sub-header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/15 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#35D9FF] shadow-[0_0_10px_#35D9FF]" />
              <h2 className="font-mono text-lg sm:text-xl font-black uppercase tracking-wider text-white">
                EVENT MOMENTS &amp; PHOTO GALLERY
              </h2>
              <span className="text-zinc-500 font-mono text-xs hidden sm:inline">//</span>
              <span className="text-zinc-400 font-mono text-xs hidden sm:inline">
                LIVE ARENA HIGHLIGHTS
              </span>
            </div>
            <span className="rounded-md border border-[#35D9FF]/40 bg-[#35D9FF]/15 px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#35D9FF] uppercase">
              {filteredImages.length} PHOTOS DISPLAYED
            </span>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-white/10 bg-[#120B20]/80 p-1.5 backdrop-blur-xl shadow-md">
                {GALLERY_CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-xl px-3 py-1.5 font-mono text-[11px] font-bold tracking-wider uppercase transition-all duration-200 ${
                        active
                          ? "bg-gradient-to-r from-[#35D9FF] to-[#3B82F6] text-black font-black shadow-[0_0_15px_rgba(53,217,255,0.4)]"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search caption, tag..."
                  className="w-full rounded-xl border border-white/10 bg-[#120B20]/80 pl-10 pr-4 py-2 font-mono text-xs text-white placeholder-zinc-500 backdrop-blur-xl transition-colors focus:border-[#35D9FF] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Photo Gallery Grid */}
          {loading ? (
            <div className="py-12 text-center font-mono text-sm text-zinc-400">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#35D9FF] border-t-transparent mb-3" />
              <div>LOADING PHOTO ARCHIVES...</div>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#120B20]/60 p-12 text-center backdrop-blur-xl">
              <Camera className="mx-auto h-12 w-12 text-zinc-600 mb-3" />
              <div className="font-mono text-base font-bold text-white uppercase">
                NO PHOTOS FOUND IN THIS CATEGORY
              </div>
              <p className="mt-1 text-xs text-zinc-400 font-mono">
                Try selecting &apos;ALL PHOTOS&apos; or adjust your search filter.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
                {displayedImages.map((img, idx) => (
                  <motion.div
                    key={img.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-b from-[#160E2E]/90 to-[#0A0714]/95 p-4 backdrop-blur-xl transition-all duration-300 hover:border-[#35D9FF]/70 hover:shadow-[0_0_35px_rgba(53,217,255,0.25)]"
                  >
                    {/* Top Laser Accent */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#35D9FF] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                    {/* Corner HUD ticks */}
                    <div className="absolute top-2 left-2 h-2 w-2 border-t-2 border-l-2 border-white/30" />
                    <div className="absolute top-2 right-2 h-2 w-2 border-t-2 border-r-2 border-white/30" />
                    <div className="absolute bottom-2 left-2 h-2 w-2 border-b-2 border-l-2 border-white/30" />
                    <div className="absolute bottom-2 right-2 h-2 w-2 border-b-2 border-r-2 border-white/30" />

                    <div>
                      {/* Top Category Badge & Tag */}
                      <div className="mb-3 flex items-center justify-between gap-1 font-mono text-[10px] font-bold">
                        <span className="rounded-md border border-[#35D9FF]/40 bg-[#35D9FF]/15 px-2 py-0.5 text-[#35D9FF] uppercase tracking-wider truncate">
                          {img.category}
                        </span>
                        {img.tag && (
                          <span className="rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-zinc-400 uppercase truncate">
                            {img.tag}
                          </span>
                        )}
                      </div>

                      {/* Uniform Image Container with Uncropped Shape + Ambient Glow */}
                      <div
                        onClick={() => openImageLightbox(idx)}
                        className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/15 bg-[#08070D] flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.8)] cursor-pointer group-hover:border-[#35D9FF]/70 transition-all"
                      >
                        {/* Ambient Blurred Background (Matches photo color scheme) */}
                        <img
                          src={img.image_url}
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 h-full w-full object-cover blur-xl scale-125 opacity-30 pointer-events-none"
                        />

                        {/* Main Full Photo - Complete shape preserved without any cropping */}
                        <img
                          src={img.image_url}
                          alt={img.title || "Event Photo"}
                          loading="lazy"
                          decoding="async"
                          className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain object-center drop-shadow-md transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/backgrounds/bg_missions.jpg";
                          }}
                        />

                        {/* Hover View Full Button Overlay */}
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
                          <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#3B82F6] px-4 py-2 font-mono text-xs font-black uppercase text-black shadow-lg">
                            <Eye className="h-4 w-4" />
                            <span>EXPAND PHOTO</span>
                          </div>
                        </div>
                      </div>

                      {/* Photo Details (Placed cleanly below image, so 100% photo is visible) */}
                      <div className="mt-3.5 space-y-1">
                        <h3 className="font-mono text-sm sm:text-base font-black tracking-wide text-white uppercase group-hover:text-[#35D9FF] transition-colors leading-tight">
                          {img.title || "Event Moment"}
                        </h3>
                        {img.caption && (
                          <p className="font-mono text-xs text-zinc-400 line-clamp-2">
                            {img.caption}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Photo Actions Footer */}
                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="font-mono text-[10px] text-zinc-400 truncate">
                        📸 {img.photographer || "IEEE Media Wing"}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleShare(img.image_url)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          title="Share Photo"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => openImageLightbox(idx)}
                          className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#35D9FF] hover:text-white transition-colors cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>VIEW FULL</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Load More Button */}
              {filteredImages.length > visibleCount && (
                <div className="pt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-[#35D9FF]/40 bg-[#120B20]/90 px-8 py-3.5 font-mono text-xs font-black uppercase text-[#35D9FF] shadow-[0_0_25px_rgba(53,217,255,0.25)] hover:border-[#35D9FF] hover:bg-[#35D9FF]/15 hover:scale-105 transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>
                      LOAD MORE PHOTOS ({filteredImages.length - visibleCount} REMAINING)
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. FULLSCREEN LIGHTBOX MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl"
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/25 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Poster Lightbox Content */}
            {lightboxType === "poster" && activePoster && (
              <div className="relative flex max-h-[90vh] max-w-4xl flex-col items-center justify-center space-y-4">
                <div className="relative max-h-[75vh] w-auto overflow-hidden rounded-2xl border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.9)]">
                  <img
                    src={activePoster.image_url}
                    alt={activePoster.title}
                    className="max-h-[75vh] w-auto object-contain rounded-2xl"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full border-t border-white/15 pt-3">
                  <div>
                    <h3 className="font-mono text-base font-black uppercase text-white">
                      {activePoster.title}
                    </h3>
                    <p className="font-mono text-xs text-zinc-400">
                      {activePoster.tagline}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleShare(activePoster.image_url)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 font-mono text-xs font-bold text-white hover:bg-white/20 transition-colors cursor-pointer"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>SHARE</span>
                    </button>

                    <a
                      href={activePoster.download_url || activePoster.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#FF2D8D] to-[#FF7A3D] px-4 py-2 font-mono text-xs font-black uppercase text-white shadow-lg hover:scale-105 transition-all"
                    >
                      <Download className="h-4 w-4" />
                      <span>DOWNLOAD POSTER</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Gallery Image Lightbox Content with Prev/Next */}
            {lightboxType === "image" && filteredImages[activeImageIndex] && (
              <div className="relative flex max-h-[90vh] max-w-5xl flex-col items-center justify-center space-y-4 w-full">
                {/* Previous Button */}
                {filteredImages.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white hover:bg-[#35D9FF] hover:text-black transition-colors cursor-pointer shadow-lg"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                )}

                {/* Next Button */}
                {filteredImages.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white hover:bg-[#35D9FF] hover:text-black transition-colors cursor-pointer shadow-lg"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                )}

                {/* Image Container */}
                <div className="relative max-h-[75vh] w-auto overflow-hidden rounded-2xl border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.9)]">
                  <img
                    src={filteredImages[activeImageIndex].image_url}
                    alt={filteredImages[activeImageIndex].title || "Gallery Moment"}
                    className="max-h-[75vh] w-auto object-contain rounded-2xl"
                  />
                </div>

                {/* Caption Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full border-t border-white/15 pt-3 max-w-4xl px-2">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 font-mono text-xs">
                      <span className="rounded bg-[#35D9FF] px-1.5 py-0.2 font-black text-black uppercase text-[10px]">
                        {filteredImages[activeImageIndex].category}
                      </span>
                      <span className="font-bold text-white">
                        {filteredImages[activeImageIndex].title || "RoboVerse '26 Moment"}
                      </span>
                    </div>
                    {filteredImages[activeImageIndex].caption && (
                      <p className="font-mono text-xs text-zinc-300">
                        {filteredImages[activeImageIndex].caption}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-zinc-500">
                      {activeImageIndex + 1} / {filteredImages.length}
                    </span>

                    <button
                      onClick={() => handleShare(filteredImages[activeImageIndex].image_url)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 font-mono text-xs font-bold text-white hover:bg-white/20 transition-colors cursor-pointer"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>SHARE</span>
                    </button>

                    <a
                      href={filteredImages[activeImageIndex].image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#35D9FF]/40 bg-[#35D9FF]/20 px-3 py-1.5 font-mono text-xs font-black uppercase text-[#35D9FF] hover:bg-[#35D9FF]/30 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>DOWNLOAD</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
