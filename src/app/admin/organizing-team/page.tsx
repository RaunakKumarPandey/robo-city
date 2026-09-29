"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  ExternalLink,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Zap,
  GraduationCap,
} from "lucide-react";
import { OrganizingMember } from "@/types/database";
import {
  fetchOrganizingTeam,
  saveOrganizingMember,
  deleteOrganizingMember,
} from "@/lib/team";

const SQUAD_CATEGORIES = [
  "Faculty & Advisors",
  "Core Squad",
  "Technical Leads",
  "Operations & Logistics",
] as const;

const YEAR_OPTIONS = [
  "Final Year",
  "3rd Year",
  "2nd Year",
  "1st Year",
  "Faculty / Advisor",
  "Alumni",
] as const;

export default function AdminOrganizingTeamPage() {
  const [members, setMembers] = useState<OrganizingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<OrganizingMember | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields (All optional - no field is mandatory)
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formCategory, setFormCategory] = useState<OrganizingMember["category"]>("Core Squad");
  const [formYear, setFormYear] = useState<string>("Final Year");
  const [formPhotoUrl, setFormPhotoUrl] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formLinkedin, setFormLinkedin] = useState("");
  const [formInstagram, setFormInstagram] = useState("");
  const [formGithub, setFormGithub] = useState("");
  const [formBio, setFormBio] = useState("");
  const [formOrder, setFormOrder] = useState<number>(1);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchOrganizingTeam();
    setMembers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const notify = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setFormName("");
    setFormRole("");
    setFormCategory("Core Squad");
    setFormYear("Final Year");
    setFormPhotoUrl("");
    setFormPhone("");
    setFormEmail("");
    setFormLinkedin("");
    setFormInstagram("");
    setFormGithub("");
    setFormBio("");
    setFormOrder(members.length + 1);
    setModalOpen(true);
  };

  const handleOpenEditModal = (member: OrganizingMember) => {
    setEditingMember(member);
    setFormName(member.name || "");
    setFormRole(member.role || "");
    setFormCategory(member.category || "Core Squad");
    setFormYear(member.year || (member.category?.includes("Faculty") ? "Faculty / Advisor" : "Final Year"));
    setFormPhotoUrl(member.photo_url || "");
    setFormPhone(member.phone || "");
    setFormEmail(member.email || "");
    setFormLinkedin(member.linkedin || "");
    setFormInstagram(member.instagram || "");
    setFormGithub(member.github || "");
    setFormBio(member.bio || "");
    setFormOrder(member.display_order ?? 1);
    setModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert image to Base64 Data URL for instant storage
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setFormPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    const memberName = formName.trim() || "Operative";
    const memberRole = formRole.trim() || "Core Member";

    const payload: OrganizingMember = {
      id: editingMember ? editingMember.id : `org-${Date.now()}`,
      name: memberName,
      role: memberRole,
      category: formCategory || "Core Squad",
      year: formYear || "Final Year",
      photo_url: formPhotoUrl.trim() || null,
      phone: formPhone.trim() || null,
      email: formEmail.trim() || null,
      linkedin: formLinkedin.trim() || null,
      instagram: formInstagram.trim() || null,
      github: formGithub.trim() || null,
      bio: formBio.trim() || null,
      display_order: Number(formOrder) || 1,
    };

    const res = await saveOrganizingMember(payload);
    setSaving(false);

    if (res.success) {
      notify(
        "success",
        editingMember
          ? `Saved updates for ${payload.name}`
          : `Added new member: ${payload.name}`
      );
      setModalOpen(false);
      loadData();
    } else {
      notify("error", res.error || "Failed to save member");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the organising team?`)) {
      return;
    }

    const res = await deleteOrganizingMember(id);
    if (res.success) {
      notify("success", `Removed ${name} from team`);
      loadData();
    } else {
      notify("error", res.error || "Failed to delete member");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <span className="font-mono text-xs font-bold tracking-widest text-[#FF2D8D] uppercase">
              ADMIN // PERSONNEL CONSOLE
            </span>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">
              MANAGE ORGANISING TEAM
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/team"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#35D9FF]/40 bg-[#35D9FF]/10 px-3.5 py-2 font-mono text-xs font-bold text-[#35D9FF] hover:bg-[#35D9FF]/20 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>VIEW LIVE SITE</span>
          </Link>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FF2D8D] to-[#FF7A3D] px-4 py-2 font-mono text-xs font-black uppercase tracking-wider text-white shadow-[0_0_20px_rgba(255,45,141,0.4)] hover:shadow-[0_0_25px_rgba(255,45,141,0.7)] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>ADD MEMBER</span>
          </button>
        </div>
      </div>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 font-mono text-xs font-bold ${
            notification.type === "success"
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
              : "border-rose-500/50 bg-rose-500/10 text-rose-400"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* 2. MEMBERS LIST */}
      <div className="rounded-2xl border border-white/10 bg-[#0A0718]/80 backdrop-blur-xl overflow-hidden">
        <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-300">
            <Users className="h-4 w-4 text-[#35D9FF]" />
            <span>TOTAL PERSONNEL: {members.length}</span>
          </div>
          <span className="font-mono text-[11px] text-zinc-500">
            AUTO-SYNCED TO LIVE /TEAM ROUTE
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center font-mono text-xs text-zinc-400">
            LOADING PERSONNEL ROSTER...
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-mono text-sm text-zinc-400 mb-4">
              No organising team members found.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="rounded-lg bg-[#FF2D8D] px-4 py-2 font-mono text-xs font-bold text-white"
            >
              Add First Member
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-white/20 bg-[#08070D]">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-500">
                        <Users className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-mono text-base font-black text-white uppercase">
                        {member.name}
                      </h4>
                      <span className="rounded bg-[#35D9FF]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#35D9FF]">
                        {member.category}
                      </span>
                      {member.year && (
                        <span className="rounded bg-[#FF7A3D]/10 border border-[#FF7A3D]/30 px-2 py-0.5 font-mono text-[10px] font-bold text-[#FF7A3D]">
                          {member.year}
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs font-semibold text-[#FF4FB3]">
                      {member.role}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                      {member.phone && (
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Phone className="h-3 w-3 text-emerald-400" /> {member.phone}
                        </span>
                      )}
                      {member.email && (
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Mail className="h-3 w-3 text-[#35D9FF]" /> {member.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleOpenEditModal(member)}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-[#35D9FF]" />
                    <span>EDIT</span>
                  </button>
                  <button
                    onClick={() => handleDelete(member.id, member.name)}
                    className="flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 font-mono text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>DELETE</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl border border-white/15 bg-[#0F0B1E] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] my-8">
            {/* Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <span className="font-mono text-xs font-bold text-[#FF2D8D] uppercase">
                {editingMember ? "UPDATE MEMBER" : "NEW OPERATIVE"}
              </span>
              <h2 className="text-xl font-black uppercase text-white font-mono">
                {editingMember ? `EDIT: ${editingMember.name}` : "ADD ORGANISING MEMBER"}
              </h2>
            </div>

            {/* Form with noValidate to prevent browser blocking */}
            <form onSubmit={handleSaveMember} noValidate className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs font-bold text-zinc-300 uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 font-mono text-xs text-white focus:border-[#FF2D8D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold text-zinc-300 uppercase mb-1">
                    Designation / Role
                  </label>
                  <input
                    type="text"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Technical Head"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 font-mono text-xs text-white focus:border-[#FF2D8D] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono text-xs font-bold text-zinc-300 uppercase mb-1">
                    Squad Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) =>
                      setFormCategory(e.target.value as OrganizingMember["category"])
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#160E2E] px-3 py-2 font-mono text-xs text-white focus:border-[#35D9FF] focus:outline-none"
                  >
                    {SQUAD_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold text-zinc-300 uppercase mb-1">
                    Academic Year / Batch
                  </label>
                  <select
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="w-full rounded-xl border border-[#35D9FF]/40 bg-[#160E2E] px-3 py-2 font-mono text-xs text-white focus:border-[#35D9FF] focus:outline-none"
                  >
                    {YEAR_OPTIONS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold text-zinc-300 uppercase mb-1">
                    Priority Order
                  </label>
                  <input
                    type="number"
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    min={1}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white focus:border-[#35D9FF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo Input & Upload */}
              <div>
                <label className="block font-mono text-xs font-bold text-zinc-300 uppercase mb-1">
                  Photo URL or Local Upload
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formPhotoUrl.startsWith("data:") ? "(Local Image Uploaded)" : formPhotoUrl}
                    onChange={(e) => setFormPhotoUrl(e.target.value)}
                    placeholder="Paste image URL here or click Upload"
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 font-mono text-xs text-white focus:border-[#35D9FF] focus:outline-none"
                  />
                  <label className="flex items-center gap-1.5 cursor-pointer rounded-xl border border-white/10 bg-white/10 px-3 py-2 font-mono text-xs font-bold text-zinc-200 hover:bg-white/20 transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {formPhotoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormPhotoUrl("")}
                      className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-2.5 py-2 font-mono text-xs text-rose-400 hover:bg-rose-500/20"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {formPhotoUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={formPhotoUrl}
                      alt="Preview"
                      className="h-10 w-10 rounded-lg object-cover border border-white/20"
                    />
                    <span className="font-mono text-[10px] text-emerald-400">
                      Photo preview ready
                    </span>
                  </div>
                )}
              </div>

              {/* Contact Information (All non-blocking text inputs) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs font-bold text-zinc-300 uppercase mb-1">
                    Phone / Mobile Number
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 font-mono text-xs text-white focus:border-[#35D9FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold text-zinc-300 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="text"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="name@mmmut.ac.in"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 font-mono text-xs text-white focus:border-[#35D9FF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Social Links (All non-blocking text inputs) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="text"
                    value={formLinkedin}
                    onChange={(e) => setFormLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-white focus:border-[#35D9FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Instagram URL
                  </label>
                  <input
                    type="text"
                    value={formInstagram}
                    onChange={(e) => setFormInstagram(e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-white focus:border-[#35D9FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="text"
                    value={formGithub}
                    onChange={(e) => setFormGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-white focus:border-[#35D9FF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Bio / Dossier */}
              <div>
                <label className="block font-mono text-xs font-bold text-zinc-300 uppercase mb-1">
                  Bio / Responsibilities Brief
                </label>
                <textarea
                  rows={2}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Short role description or department brief..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 font-mono text-xs text-white focus:border-[#35D9FF] focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-xs font-bold text-zinc-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF2D8D] to-[#FF7A3D] px-6 py-2.5 font-mono text-xs font-black uppercase text-white shadow-[0_0_20px_rgba(255,45,141,0.5)] hover:shadow-[0_0_30px_rgba(255,45,141,0.8)] disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? "SAVING..." : "SAVE & PUBLISH LIVE"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
