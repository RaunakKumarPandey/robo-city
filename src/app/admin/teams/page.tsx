"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { TeamWithDetails, TeamMember } from "@/types/database";
import {
  fetchTeamsWithDetails,
  createTeamWithMembers,
  updateTeamWithMembers,
  deleteTeamRecord,
} from "@/lib/teams";
import {
  Users,
  Plus,
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  Eye,
  X,
  Bot,
  Trophy,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ShieldAlert,
} from "lucide-react";

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<TeamWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "newest" | "score">("newest");

  // Notifications
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamWithDetails | null>(null);
  const [viewingTeam, setViewingTeam] = useState<TeamWithDetails | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<TeamWithDetails | null>(null);

  // Form State
  const [formTeamName, setFormTeamName] = useState("");
  const [formLogoUrl, setFormLogoUrl] = useState("");
  const [formRobotUrl, setFormRobotUrl] = useState("");
  const [formMembers, setFormMembers] = useState<
    { name: string; branch: string; year: string }[]
  >([
    { name: "", branch: "", year: "" },
    { name: "", branch: "", year: "" },
    { name: "", branch: "", year: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load Teams on Mount
  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    setLoading(true);
    const data = await fetchTeamsWithDetails();
    setTeams(data);
    setLoading(false);
  };

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingTeam(null);
    setFormTeamName("");
    setFormLogoUrl("");
    setFormRobotUrl("");
    setFormMembers([
      { name: "", branch: "", year: "" },
      { name: "", branch: "", year: "" },
      { name: "", branch: "", year: "" },
    ]);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (team: TeamWithDetails) => {
    setEditingTeam(team);
    setFormTeamName(team.team_name);
    setFormLogoUrl(team.team_logo_url || "");
    setFormRobotUrl(team.robot_image_url || "");

    const existingMembers = (team.members || []).map((m) => ({
      name: m.name || "",
      branch: m.branch || "",
      year: m.year || "",
    }));

    // Ensure at least 3 member inputs are present
    while (existingMembers.length < 3) {
      existingMembers.push({ name: "", branch: "", year: "" });
    }

    setFormMembers(existingMembers);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Form Member Operations
  const handleAddMemberInput = () => {
    if (formMembers.length < 5) {
      setFormMembers([...formMembers, { name: "", branch: "", year: "" }]);
    }
  };

  const handleRemoveMemberInput = (index: number) => {
    if (formMembers.length > 3) {
      const updated = formMembers.filter((_, i) => i !== index);
      setFormMembers(updated);
    }
  };

  const handleMemberChange = (
    index: number,
    field: "name" | "branch" | "year",
    value: string
  ) => {
    const updated = [...formMembers];
    updated[index][field] = value;
    setFormMembers(updated);
  };

  // Save Team (Create or Edit)
  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formTeamName.trim()) {
      setFormError("TEAM NAME IS REQUIRED");
      return;
    }

    const filledMembers = formMembers.filter((m) => m.name.trim().length > 0);
    if (filledMembers.length < 3 || filledMembers.length > 5) {
      setFormError(
        `PLEASE ADD 3–5 MEMBERS WITH NAMES (Currently: ${filledMembers.length})`
      );
      return;
    }

    setSubmitting(true);

    if (editingTeam) {
      // Update
      const res = await updateTeamWithMembers(
        editingTeam.id,
        formTeamName,
        formLogoUrl || null,
        formRobotUrl || null,
        filledMembers
      );

      if (!res.success) {
        setFormError(res.error || "FAILED TO UPDATE TEAM");
        setSubmitting(false);
        return;
      }

      showFeedback("success", "TEAM UPDATED SUCCESSFULLY");
    } else {
      // Create
      const res = await createTeamWithMembers(
        formTeamName,
        formLogoUrl || null,
        formRobotUrl || null,
        filledMembers
      );

      if (!res.success) {
        setFormError(res.error || "FAILED TO CREATE TEAM");
        setSubmitting(false);
        return;
      }

      showFeedback("success", "TEAM CREATED SUCCESSFULLY");
    }

    setSubmitting(false);
    setIsFormModalOpen(false);
    await loadTeams();
  };

  // Delete Team
  const handleConfirmDelete = async () => {
    if (!deletingTeam) return;
    setSubmitting(true);

    const res = await deleteTeamRecord(deletingTeam.id);
    if (res.success) {
      showFeedback("success", "TEAM DELETED");
      setDeletingTeam(null);
      await loadTeams();
    } else {
      showFeedback("error", res.error || "FAILED TO DELETE TEAM");
    }

    setSubmitting(false);
  };

  // Filtered and Sorted Teams
  const filteredTeams = useMemo(() => {
    let result = teams.filter((t) =>
      t.team_name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    if (sortBy === "name") {
      result.sort((a, b) => a.team_name.localeCompare(b.team_name));
    } else if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sortBy === "score") {
      result.sort(
        (a, b) => (b.score?.total_score || 0) - (a.score?.total_score || 0)
      );
    }

    return result;
  }, [teams, searchQuery, sortBy]);

  return (
    <div className="space-y-8">
      {/* 1. TOP HEADER & NOTIFICATIONS */}
      <div>
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
          <div>
            <span className="font-mono text-xs font-bold tracking-widest text-[#FF2A85] uppercase">
              ADMIN // TEAM GARAGE
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1">
              TEAM GARAGE
            </h1>
            <p className="mt-1 text-xs text-zinc-400 font-mono">
              MANAGE ROBO CITY CREWS &middot; OFFICIAL 3–5 MEMBERS PER TEAM
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#FF2A85] via-[#FF6B35] to-[#8A2BE2] px-5 py-2.5 text-xs font-black tracking-widest text-white shadow-[0_0_20px_rgba(255,42,133,0.3)] transition-all hover:scale-105 cursor-pointer uppercase font-mono"
          >
            <Plus className="h-4 w-4" />
            <span>+ ADD TEAM</span>
          </button>
        </div>

        {/* Feedback Alert Toast */}
        {feedback && (
          <div
            className={`mt-4 flex items-center gap-2.5 rounded-lg border p-3.5 text-xs font-mono font-bold tracking-wider uppercase transition-all ${
              feedback.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/40 bg-red-500/10 text-red-400"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      {/* 2. SEARCH & SORT BAR */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teams by name..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-3.5 text-xs text-white placeholder-zinc-500 backdrop-blur-sm transition-colors focus:border-[#FF2A85] focus:outline-none"
          />
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-[11px] font-mono text-zinc-400 uppercase">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-white/10 bg-[#0A0718] py-1.5 px-3 text-xs text-zinc-300 focus:border-[#FF2A85] focus:outline-none"
          >
            <option value="newest">Newest Teams</option>
            <option value="name">Team Name (A-Z)</option>
            <option value="score">Highest Score</option>
          </select>
        </div>
      </div>

      {/* 3. TEAMS LIST / TABLE */}
      {loading ? (
        <div className="flex h-60 flex-col items-center justify-center space-y-3">
          <Loader2 className="h-7 w-7 animate-spin text-[#FF2A85]" />
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">
            LOADING TEAMS...
          </span>
        </div>
      ) : filteredTeams.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-white/10 bg-[#0A0718]/80 p-12 text-center backdrop-blur-md">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF2A85]/10 text-[#FF2A85] mb-4 shadow-[0_0_20px_rgba(255,42,133,0.2)]">
            <Bot className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-black uppercase tracking-wider text-white font-mono">
            NO CREWS IN THE CITY
          </h2>
          <p className="mt-2 text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Add the first team to begin building the competition database.
          </p>
          <div className="mt-6">
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FF2A85] to-[#FF6B35] px-6 py-2.5 text-xs font-black tracking-widest text-white uppercase shadow-[0_0_15px_rgba(255,42,133,0.3)] transition-all hover:scale-105 cursor-pointer font-mono"
            >
              <Plus className="h-4 w-4" />
              <span>+ ADD TEAM</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-hidden rounded-xl border border-white/10 bg-[#0A0718]/80 backdrop-blur-md md:block">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-white/10 bg-white/5 text-zinc-400 uppercase tracking-widest">
                <tr>
                  <th className="py-3.5 px-4 font-bold">TEAM</th>
                  <th className="py-3.5 px-4 font-bold">ROBOT</th>
                  <th className="py-3.5 px-4 font-bold">MEMBERS</th>
                  <th className="py-3.5 px-4 font-bold">SCORE</th>
                  <th className="py-3.5 px-4 font-bold">CREATED</th>
                  <th className="py-3.5 px-4 text-right font-bold">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {filteredTeams.map((team) => (
                  <tr
                    key={team.id}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    {/* Team Name */}
                    <td className="py-4 px-4 font-bold text-white font-sans text-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FF2A85]/10 text-[#FF2A85] text-xs font-mono font-black">
                          {team.team_name.charAt(0).toUpperCase()}
                        </div>
                        <span>{team.team_name}</span>
                      </div>
                    </td>

                    {/* Robot Preview */}
                    <td className="py-4 px-4">
                      {team.robot_image_url ? (
                        <span className="inline-flex items-center gap-1 rounded bg-[#00F0FF]/10 px-2 py-0.5 text-[11px] text-[#00F0FF]">
                          <Bot className="h-3 w-3" /> Image set
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Members Count */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-zinc-300">
                        <Users className="h-3 w-3 text-[#FF6B35]" />
                        <span>{team.members?.length || 0} Members</span>
                      </span>
                    </td>

                    {/* Score */}
                    <td className="py-4 px-4 font-bold text-[#00F0FF]">
                      <span className="inline-flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-[#00F0FF]" />
                        <span>{team.score?.total_score ?? 0} pts</span>
                      </span>
                    </td>

                    {/* Created */}
                    <td className="py-4 px-4 text-zinc-500 text-[11px]">
                      {new Date(team.created_at).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setViewingTeam(team)}
                          title="View Details"
                          className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(team)}
                          title="Edit Team"
                          className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-[#00F0FF] cursor-pointer"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingTeam(team)}
                          title="Delete Team"
                          className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-red-500/20 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards */}
          <div className="grid grid-cols-1 gap-3.5 md:hidden">
            {filteredTeams.map((team) => (
              <div
                key={team.id}
                className="rounded-xl border border-white/10 bg-[#0A0718]/90 p-4 backdrop-blur-md space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-black text-white text-base">
                      {team.team_name}
                    </h3>
                    <div className="mt-1 flex items-center gap-3 text-xs font-mono text-zinc-400">
                      <span>{team.members?.length || 0} Members</span>
                      <span>&bull;</span>
                      <span className="text-[#00F0FF] font-bold">
                        {team.score?.total_score ?? 0} pts
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingTeam(team)}
                      className="rounded-md p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(team)}
                      className="rounded-md p-1.5 text-zinc-400 hover:bg-white/10 hover:text-[#00F0FF]"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingTeam(team)}
                      className="rounded-md p-1.5 text-zinc-400 hover:bg-red-500/20 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 4. ADD / EDIT TEAM MODAL */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0A0718] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto my-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <span className="font-mono text-xs font-bold text-[#FF2A85] uppercase">
                  {editingTeam ? "EDIT CREW" : "REGISTER CREW"}
                </span>
                <h2 className="text-xl font-black uppercase text-white tracking-tight">
                  {editingTeam ? "EDIT TEAM SPECIFICATIONS" : "ADD NEW TEAM"}
                </h2>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Alert inside Modal */}
            {formError && (
              <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400 font-mono">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveTeam} className="space-y-6">
              {/* Team Name */}
              <div>
                <label className="block font-mono text-xs font-bold tracking-wider text-zinc-300 uppercase mb-1.5">
                  TEAM NAME *
                </label>
                <input
                  type="text"
                  value={formTeamName}
                  onChange={(e) => setFormTeamName(e.target.value)}
                  placeholder="e.g. CyberViper X"
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 px-3.5 text-sm text-white placeholder-zinc-500 focus:border-[#FF2A85] focus:outline-none"
                />
              </div>

              {/* Media URLs */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs font-bold tracking-wider text-zinc-300 uppercase mb-1.5">
                    ROBOT IMAGE URL
                  </label>
                  <input
                    type="url"
                    value={formRobotUrl}
                    onChange={(e) => setFormRobotUrl(e.target.value)}
                    placeholder="https://example.com/bot.jpg"
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-2 px-3 text-xs text-white placeholder-zinc-500 focus:border-[#00F0FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold tracking-wider text-zinc-300 uppercase mb-1.5">
                    TEAM LOGO URL
                  </label>
                  <input
                    type="url"
                    value={formLogoUrl}
                    onChange={(e) => setFormLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-2 px-3 text-xs text-white placeholder-zinc-500 focus:border-[#00F0FF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Team Members Section (3–5 Members) */}
              <div className="border-t border-white/10 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-mono text-xs font-bold tracking-wider text-zinc-200 uppercase">
                      TEAM MEMBERS (OFFICIAL 3–5 MEMBERS)
                    </label>
                    <p className="text-[11px] font-mono text-zinc-400">
                      Members: {formMembers.filter((m) => m.name.trim()).length} / 5
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddMemberInput}
                    disabled={formMembers.length >= 5}
                    className="inline-flex items-center gap-1 rounded-md border border-[#00F0FF]/40 bg-[#00F0FF]/10 px-2.5 py-1 text-xs font-mono font-bold text-[#00F0FF] uppercase disabled:opacity-30 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>+ ADD MEMBER</span>
                  </button>
                </div>

                {/* Member Input Rows */}
                <div className="space-y-2.5">
                  {formMembers.map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2.5"
                    >
                      <span className="font-mono text-xs font-bold text-[#FF6B35] w-5">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) =>
                          handleMemberChange(idx, "name", e.target.value)
                        }
                        placeholder={`Member Name ${idx < 3 ? "*" : ""}`}
                        required={idx < 3}
                        className="flex-1 rounded border border-white/10 bg-black/40 py-1.5 px-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#FF2A85] focus:outline-none"
                      />
                      <input
                        type="text"
                        value={member.branch}
                        onChange={(e) =>
                          handleMemberChange(idx, "branch", e.target.value)
                        }
                        placeholder="Branch (e.g. EE)"
                        className="w-24 rounded border border-white/10 bg-black/40 py-1.5 px-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#FF2A85] focus:outline-none"
                      />
                      <input
                        type="text"
                        value={member.year}
                        onChange={(e) =>
                          handleMemberChange(idx, "year", e.target.value)
                        }
                        placeholder="Year"
                        className="w-16 rounded border border-white/10 bg-black/40 py-1.5 px-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#FF2A85] focus:outline-none"
                      />
                      {formMembers.length > 3 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMemberInput(idx)}
                          className="rounded p-1 text-zinc-500 hover:text-red-400 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs font-mono font-bold uppercase text-zinc-400 hover:bg-white/5 cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FF2A85] to-[#FF6B35] px-6 py-2 text-xs font-black tracking-widest text-white uppercase shadow-[0_0_15px_rgba(255,42,133,0.3)] disabled:opacity-50 cursor-pointer font-mono"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>SAVING...</span>
                    </>
                  ) : (
                    <span>{editingTeam ? "SAVE CHANGES" : "CREATE TEAM"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TEAM DETAILS INSPECTION MODAL (READ ONLY SCORE) */}
      {/* ========================================================================= */}
      {viewingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0A0718] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <span className="font-mono text-xs font-bold text-[#00F0FF] uppercase">
                  CREW DOSSIER
                </span>
                <h2 className="text-xl font-black uppercase text-white tracking-tight">
                  {viewingTeam.team_name}
                </h2>
              </div>
              <button
                onClick={() => setViewingTeam(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Media Preview */}
              {viewingTeam.robot_image_url && (
                <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-center">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase block mb-2">
                    ROBOT ASSET
                  </span>
                  <p className="text-xs text-zinc-400 break-all font-mono">
                    {viewingTeam.robot_image_url}
                  </p>
                </div>
              )}

              {/* Members Roster */}
              <div className="space-y-3">
                <h3 className="font-mono text-xs font-bold text-zinc-400 uppercase">
                  CREW MEMBERS ({viewingTeam.members?.length || 0})
                </h3>
                <div className="space-y-2">
                  {viewingTeam.members?.map((member, i) => (
                    <div
                      key={member.id || i}
                      className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#FF6B35]">
                          #{i + 1}
                        </span>
                        <span className="font-bold text-white font-sans">
                          {member.name}
                        </span>
                      </div>
                      <div className="font-mono text-zinc-400">
                        {member.branch || "—"} {member.year ? `(${member.year})` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Read Only Current Score */}
              <div className="rounded-xl border border-[#00F0FF]/30 bg-[#00F0FF]/5 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#00F0FF]/20 pb-2">
                  <span className="font-mono text-xs font-black text-[#00F0FF] uppercase">
                    CURRENT SCORE (READ ONLY)
                  </span>
                  <Trophy className="h-4 w-4 text-[#00F0FF]" />
                </div>
                <div className="grid grid-cols-4 gap-2 text-center font-mono">
                  <div className="rounded bg-black/40 p-2">
                    <span className="text-[10px] text-zinc-400 uppercase block">R1</span>
                    <span className="font-bold text-white">
                      {viewingTeam.score?.round1_score ?? 0}
                    </span>
                  </div>
                  <div className="rounded bg-black/40 p-2">
                    <span className="text-[10px] text-zinc-400 uppercase block">R2</span>
                    <span className="font-bold text-white">
                      {viewingTeam.score?.round2_score ?? 0}
                    </span>
                  </div>
                  <div className="rounded bg-black/40 p-2">
                    <span className="text-[10px] text-zinc-400 uppercase block">R3</span>
                    <span className="font-bold text-white">
                      {viewingTeam.score?.round3_score ?? 0}
                    </span>
                  </div>
                  <div className="rounded bg-[#00F0FF]/20 border border-[#00F0FF]/40 p-2">
                    <span className="text-[10px] text-[#00F0FF] uppercase block font-black">TOTAL</span>
                    <span className="font-black text-[#00F0FF]">
                      {viewingTeam.score?.total_score ?? 0}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400 text-center font-mono">
                  Score modifications are restricted to the /admin/scores portal.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingTeam(null)}
                className="rounded-lg border border-white/10 bg-white/5 px-5 py-2 text-xs font-mono font-bold text-zinc-300 uppercase hover:bg-white/10"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deletingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-500/40 bg-[#0A0718] p-6 sm:p-8 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 text-red-400 mb-4">
              <ShieldAlert className="h-6 w-6" />
            </div>

            <h2 className="text-xl font-black uppercase tracking-tight text-white font-mono">
              DELETE TEAM?
            </h2>

            <div className="mt-3 space-y-2 text-xs text-zinc-400 leading-relaxed font-mono">
              <p>
                Are you sure you want to delete{" "}
                <span className="text-white font-bold">{deletingTeam.team_name}</span>?
              </p>
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-400 space-y-1">
                <p className="font-bold">This will permanently remove:</p>
                <p>&bull; Team entity</p>
                <p>&bull; All registered crew members</p>
                <p>&bull; Associated score record</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setDeletingTeam(null)}
                className="rounded-lg border border-white/10 px-4 py-2 text-xs font-mono font-bold uppercase text-zinc-400 hover:bg-white/5 cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-5 py-2 text-xs font-mono font-bold tracking-wider text-white uppercase hover:bg-red-600 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>DELETING...</span>
                  </>
                ) : (
                  <span>DELETE TEAM</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
