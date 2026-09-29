"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Users,
  Shield,
  Phone,
  Mail,
  Search,
  Sparkles,
  ExternalLink,
  Plus,
  Zap,
  GraduationCap,
} from "lucide-react";
import { OrganizingMember } from "@/types/database";
import { fetchOrganizingTeam } from "@/lib/team";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.2a1.64 1.64 0 0 0-1.66 1.64c0 .91.74 1.65 1.66 1.65 1 0 1.65-.74 1.65-1.65 0-.9-.65-1.64-1.65-1.64Z"/>
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"/>
    </svg>
  );
}

const CATEGORIES = [
  "ALL SQUADS",
  "CORE SQUAD",
  "OPERATIONS & LOGISTICS",
  "TECHNICAL LEADS",
  "FACULTY & ADVISORS",
] as const;

const YEAR_FILTERS = [
  "ALL YEARS",
  "FINAL YEAR",
  "3RD YEAR",
  "2ND YEAR",
  "FACULTY / ADVISOR",
] as const;

export default function OrganizingTeamView() {
  const [members, setMembers] = useState<OrganizingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL SQUADS");
  const [selectedYear, setSelectedYear] = useState<string>("ALL YEARS");
  const [searchQuery, setSearchQuery] = useState("");

  const loadMembers = async () => {
    setLoading(true);
    const data = await fetchOrganizingTeam();
    setMembers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMembers();

    const handleUpdate = () => {
      loadMembers();
    };
    window.addEventListener("organizing_team_updated", handleUpdate);
    return () => window.removeEventListener("organizing_team_updated", handleUpdate);
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // 1. Squad category match
      const matchCat =
        selectedCategory === "ALL SQUADS" ||
        m.category.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === "TECHNICAL LEADS" && m.category.includes("Technical")) ||
        (selectedCategory === "OPERATIONS & LOGISTICS" && m.category.includes("Operations")) ||
        (selectedCategory === "CORE SQUAD" && m.category.includes("Core")) ||
        (selectedCategory === "FACULTY & ADVISORS" && m.category.includes("Faculty"));

      // 2. Year filter match
      const memberYear = (m.year || "").toLowerCase();
      const matchYear =
        selectedYear === "ALL YEARS" ||
        (selectedYear === "FINAL YEAR" && (memberYear.includes("final") || memberYear.includes("4"))) ||
        (selectedYear === "3RD YEAR" && memberYear.includes("3")) ||
        (selectedYear === "2ND YEAR" && memberYear.includes("2")) ||
        (selectedYear === "FACULTY / ADVISOR" && (memberYear.includes("faculty") || memberYear.includes("advisor") || m.category.includes("Faculty")));

      // 3. Search query match
      const matchSearch =
        !searchQuery ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.year && m.year.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.bio && m.bio.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCat && matchYear && matchSearch;
    });
  }, [members, selectedCategory, selectedYear, searchQuery]);

  const getYearBadgeStyle = (year?: string | null, category?: string) => {
    const y = (year || "").toLowerCase();
    if (y.includes("final") || y.includes("4")) {
      return "border-[#FF7A3D]/50 bg-[#FF7A3D]/20 text-[#FF7A3D]";
    }
    if (y.includes("3")) {
      return "border-[#35D9FF]/50 bg-[#35D9FF]/20 text-[#35D9FF]";
    }
    if (y.includes("2")) {
      return "border-[#FF2D8D]/50 bg-[#FF2D8D]/20 text-[#FF2D8D]";
    }
    if (y.includes("faculty") || y.includes("advisor") || category?.includes("Faculty")) {
      return "border-[#A855F7]/50 bg-[#A855F7]/20 text-[#C084FC]";
    }
    return "border-white/20 bg-white/10 text-zinc-300";
  };

  return (
    <div className="relative min-h-screen w-full px-3 pt-28 pb-20 sm:px-6 lg:px-8 xl:px-12">
      {/* 1. HERO HEADER */}
      <div className="mx-auto max-w-5xl text-center">
        {/* Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-[0.95]">
          <span className="block text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
            ORGANISING
          </span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D8D] via-[#FF7A3D] to-[#35D9FF] filter drop-shadow-[0_0_30px_rgba(255,45,141,0.5)]">
            COMMAND TEAM
          </span>
        </h1>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <div className="mx-auto mt-12 max-w-[1650px] space-y-6">
        {/* Squad Tabs & Search Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Squad Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-[#120B20]/80 p-1.5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-3.5 py-1.5 font-mono text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-[#FF2D8D] to-[#FF7A3D] text-white shadow-[0_0_15px_rgba(255,45,141,0.5)]"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member, role, year..."
              className="w-full rounded-xl border border-white/10 bg-[#120B20]/80 pl-10 pr-4 py-2 font-mono text-xs text-white placeholder-zinc-500 backdrop-blur-xl transition-colors focus:border-[#35D9FF] focus:outline-none focus:ring-1 focus:ring-[#35D9FF]"
            />
          </div>
        </div>

        {/* Year Filter Sub-Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
          <span className="font-mono text-xs font-bold text-zinc-400 uppercase flex items-center gap-1 mr-1">
            <GraduationCap className="h-3.5 w-3.5 text-[#35D9FF]" />
            <span>BATCH / YEAR:</span>
          </span>
          {YEAR_FILTERS.map((yr) => {
            const active = selectedYear === yr;
            return (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`rounded-lg px-3 py-1 font-mono text-[11px] font-bold tracking-wider uppercase transition-all ${
                  active
                    ? "border border-[#35D9FF] bg-[#35D9FF]/20 text-[#35D9FF] shadow-[0_0_12px_rgba(53,217,255,0.4)]"
                    : "border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {yr}
              </button>
            );
          })}
        </div>

        {/* Member Count Watermark */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 font-mono text-xs text-zinc-400">
          <span>OPERATIONAL PERSONNEL: {filteredMembers.length} ACTIVE</span>
          <span className="text-[#35D9FF]">IEEE STUDENT BRANCH // ROBOVERSE &apos;26</span>
        </div>

        {/* 3. MEMBER CARDS GRID (4 to 5 members per row on desktop/large screens) */}
        {loading ? (
          <div className="py-20 text-center font-mono text-sm text-zinc-400">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#FF2D8D] border-t-transparent mb-3" />
            <div>RETRIEVING PERSONNEL DOSSIERS...</div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#120B20]/60 p-12 text-center backdrop-blur-xl">
            <Users className="mx-auto h-12 w-12 text-zinc-600 mb-3" />
            <div className="font-mono text-base font-bold text-white uppercase">
              NO OPERATIVES FOUND IN THIS SECTOR
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Try adjusting your search criteria or switch squad/year filters.
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            <AnimatePresence>
              {filteredMembers.map((member) => (
                <motion.div
                  layout
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#160E2E]/90 to-[#0A0714]/95 p-3.5 backdrop-blur-xl transition-all duration-300 hover:border-[#FF2D8D]/60 hover:shadow-[0_0_25px_rgba(255,45,141,0.25)]"
                >
                  {/* Neon Top Edge Accent */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF2D8D] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                  {/* Corner HUD ticks */}
                  <div className="absolute top-1.5 left-1.5 h-1.5 w-1.5 border-t border-l border-white/30" />
                  <div className="absolute top-1.5 right-1.5 h-1.5 w-1.5 border-t border-r border-white/30" />
                  <div className="absolute bottom-1.5 left-1.5 h-1.5 w-1.5 border-b border-l border-white/30" />
                  <div className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 border-b border-r border-white/30" />

                  <div>
                    {/* 1. TOP HEADER (Above Photo): Squad Category + Year Badge + Order # */}
                    <div className="mb-2.5 flex items-center justify-between gap-1">
                      <div className="flex flex-wrap items-center gap-1 min-w-0">
                        <span className="rounded border border-[#35D9FF]/30 bg-[#35D9FF]/10 px-1.5 py-0.5 font-mono text-[9px] font-extrabold tracking-wider text-[#35D9FF] uppercase truncate">
                          {member.category}
                        </span>
                        {member.year && (
                          <span
                            className={`rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase truncate ${getYearBadgeStyle(
                              member.year,
                              member.category
                            )}`}
                          >
                            {member.year}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] font-bold text-zinc-500 flex-shrink-0">
                        #{String(member.display_order).padStart(2, "0")}
                      </span>
                    </div>

                    {/* 2. PHOTO (60% Area of the Card / Portrait Aspect) */}
                    <div className="relative w-full aspect-[4/4.8] overflow-hidden rounded-xl border border-white/15 bg-[#08070D] shadow-[0_0_15px_rgba(0,0,0,0.8)] group-hover:border-[#FF2D8D]/70 transition-colors">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.name}
                          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FF2D8D]/20 to-[#35D9FF]/20 text-[#35D9FF]">
                          <Users className="h-10 w-10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0714]/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                    </div>

                    {/* 3. DETAILS BELOW PHOTO: Name, Designation / Role, Bio */}
                    <div className="mt-3">
                      <h3 className="truncate font-mono text-sm sm:text-base font-black tracking-wide text-white uppercase group-hover:text-[#FFE8C7] transition-colors">
                        {member.name}
                      </h3>
                      <div className="mt-0.5 flex items-center gap-1 font-mono text-[11px] font-bold text-[#FF4FB3]">
                        <Zap className="h-3 w-3 flex-shrink-0 text-[#FF7A3D]" />
                        <span className="truncate">{member.role}</span>
                      </div>
                      {member.bio && (
                        <p className="mt-1 line-clamp-2 text-[10px] text-zinc-400 font-sans leading-tight">
                          {member.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 4. CONTACT & SOCIAL ACTIONS: Email, Call, LinkedIn, Instagram */}
                  <div className="mt-3 border-t border-white/10 pt-2.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1 min-w-0 flex-1">
                        {/* Email Button */}
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            title={`Email: ${member.email}`}
                            className="flex h-7 items-center gap-1 rounded-lg border border-[#35D9FF]/30 bg-[#35D9FF]/10 px-2 font-mono text-[10px] font-bold text-[#35D9FF] hover:bg-[#35D9FF]/20 transition-colors truncate"
                          >
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">EMAIL</span>
                          </a>
                        )}

                        {/* Call Button */}
                        {member.phone && (
                          <a
                            href={`tel:${member.phone}`}
                            title={`Call: ${member.phone}`}
                            className="flex h-7 items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 font-mono text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors flex-shrink-0"
                          >
                            <Phone className="h-3 w-3" />
                            <span>CALL</span>
                          </a>
                        )}
                      </div>

                      {/* Social links */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="LinkedIn Profile"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:border-[#0077B5] hover:bg-[#0077B5]/20 hover:text-white transition-colors"
                          >
                            <LinkedinIcon className="h-3 w-3" />
                          </a>
                        )}

                        {member.instagram && (
                          <a
                            href={member.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Instagram"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:border-[#E1306C] hover:bg-[#E1306C]/20 hover:text-[#E1306C] transition-colors"
                          >
                            <InstagramIcon className="h-3 w-3" />
                          </a>
                        )}

                        {member.github && (
                          <a
                            href={member.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="GitHub"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:border-white hover:bg-white/20 hover:text-white transition-colors"
                          >
                            <GithubIcon className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
