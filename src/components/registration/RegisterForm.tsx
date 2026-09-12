"use client";

import { useState } from "react";
import {
  Users,
  Bot,
  UserPlus,
  Trash2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Sparkles,
  Trophy,
  ChevronRight,
  ExternalLink,
  Radio,
} from "lucide-react";
import { submitRegistration, validateRegistration } from "@/lib/registrations";
import { RegistrationSubmission } from "@/types/database";
import RegistrationSuccess from "./RegistrationSuccess";

interface MemberFormState {
  name: string;
  email: string;
  phone: string;
  branch: string;
  year: string;
  role: string;
}

const INITIAL_MEMBERS: MemberFormState[] = [
  { name: "", email: "", phone: "", branch: "ECE", year: "3rd", role: "Captain / Driver" },
  { name: "", email: "", phone: "", branch: "CSE", year: "2nd", role: "Programmer" },
  { name: "", email: "", phone: "", branch: "ME", year: "2nd", role: "Hardware Lead" },
];

export default function RegisterForm() {
  const [teamName, setTeamName] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [captainEmail, setCaptainEmail] = useState("");
  const [captainPhone, setCaptainPhone] = useState("");
  const [robotName, setRobotName] = useState("");
  const [robotImageUrl, setRobotImageUrl] = useState("");
  const [members, setMembers] = useState<MemberFormState[]>(INITIAL_MEMBERS);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registrationSuccessData, setRegistrationSuccessData] = useState<{
    registrationNumber: string;
    submission: RegistrationSubmission;
  } | null>(null);

  // Auto-sync captain name/contact to first member if empty
  const handleCaptainNameChange = (val: string) => {
    setCaptainName(val);
    if (members.length > 0 && (!members[0].name || members[0].name === captainName)) {
      updateMember(0, "name", val);
    }
  };

  const handleCaptainEmailChange = (val: string) => {
    setCaptainEmail(val);
    if (members.length > 0 && (!members[0].email || members[0].email === captainEmail)) {
      updateMember(0, "email", val);
    }
  };

  const handleCaptainPhoneChange = (val: string) => {
    setCaptainPhone(val);
    if (members.length > 0 && (!members[0].phone || members[0].phone === captainPhone)) {
      updateMember(0, "phone", val);
    }
  };

  const updateMember = (index: number, field: keyof MemberFormState, value: string) => {
    setMembers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addMember = () => {
    if (members.length >= 5) return;
    setMembers((prev) => [
      ...prev,
      { name: "", email: "", phone: "", branch: "ECE", year: "2nd", role: "Member" },
    ]);
  };

  const removeMember = (index: number) => {
    if (members.length <= 3) return;
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const submissionData: RegistrationSubmission = {
      teamName,
      captainName,
      captainEmail,
      captainPhone,
      robotName,
      robotImageUrl: robotImageUrl || null,
      members: members.map((m) => ({
        name: m.name,
        email: m.email,
        phone: m.phone || undefined,
        branch: m.branch || undefined,
        year: m.year || undefined,
        role: m.role || "Member",
      })),
    };

    // Client-side quick validation
    const val = validateRegistration(submissionData);
    if (!val.valid) {
      setErrorMessage(val.error || "Please complete all required fields");
      return;
    }

    setSubmitting(true);

    try {
      const res = await submitRegistration(submissionData);
      if (res.success && res.registrationNumber) {
        setRegistrationSuccessData({
          registrationNumber: res.registrationNumber,
          submission: submissionData,
        });
      } else {
        setErrorMessage(
          res.error || "REGISTRATION FAILED. Please check your information and try again."
        );
      }
    } catch {
      setErrorMessage("REGISTRATION FAILED. Please check your information and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (registrationSuccessData) {
    return (
      <RegistrationSuccess
        registrationNumber={registrationSuccessData.registrationNumber}
        formData={registrationSuccessData.submission}
        onReset={() => {
          setRegistrationSuccessData(null);
          setTeamName("");
          setCaptainName("");
          setCaptainEmail("");
          setCaptainPhone("");
          setRobotName("");
          setRobotImageUrl("");
          setMembers(INITIAL_MEMBERS);
        }}
      />
    );
  }

  return (
    <div className="relative mx-auto max-w-4xl px-4 py-8 sm:py-12">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 -top-20 flex justify-center opacity-30">
        <div className="h-96 w-[600px] rounded-full bg-gradient-to-r from-[#FF2A85]/20 via-[#8A2BE2]/20 to-[#00F0FF]/20 blur-[130px]" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* ========================================================================= */}
        {/* PAGE HERO HEADER */}
        {/* ========================================================================= */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/30 bg-[#FF6B35]/10 px-4 py-1 text-xs font-mono font-bold tracking-widest text-[#FF6B35] uppercase shadow-[0_0_15px_rgba(255,107,53,0.2)]">
            <Users className="h-3.5 w-3.5 text-[#00F0FF]" />
            <span>ROBO CITY // REGISTRATION DESK</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-tight font-mono">
            BUILD YOUR{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A85] via-[#FF6B35] to-[#FFAA00] filter drop-shadow-[0_0_20px_rgba(255,42,133,0.4)]">
              CREW
            </span>
          </h1>

          <p className="font-mono text-xs sm:text-sm font-bold tracking-widest text-[#00F0FF] uppercase">
            ENTER ROBO CITY
          </p>

          <p className="mx-auto max-w-xl text-xs sm:text-sm text-zinc-400 font-mono tracking-wider">
            BUILD YOUR CREW. BUILD YOUR BOT. OWN THE CITY.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* OFFICIAL CIRCULATED GOOGLE FORM BANNER */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden rounded-2xl border border-[#FF6B35]/40 bg-gradient-to-r from-[#FF6B35]/15 via-[#FF2A85]/15 to-[#8A2BE2]/15 p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_35px_rgba(255,107,53,0.25)]">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-0.5 text-[11px] font-mono font-bold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>OFFICIAL REGISTRATION LIVE</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black uppercase text-white font-mono">
                CIRCULATED GOOGLE FORM
              </h2>
              <p className="text-xs text-zinc-300 font-mono leading-relaxed max-w-xl">
                The official RoboVerse&apos;26 registration Google Form is currently open. Submissions through the circulated link are automatically synchronized into the Robo City database.
              </p>
            </div>

            <a
              href="https://forms.gle/ac4YoLdKzPRNNqq88"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF2A85] via-[#FF6B35] to-[#FFAA00] px-6 py-4 text-xs font-mono font-black uppercase text-white shadow-[0_0_25px_rgba(255,42,133,0.4)] hover:scale-105 transition-transform shrink-0"
            >
              <span>OPEN GOOGLE FORM</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ERROR NOTIFICATION ALERT */}
        {/* ========================================================================= */}
        {errorMessage && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-xs font-mono font-bold text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
            <div className="flex-1">
              <span className="uppercase block font-black">
                {errorMessage === "THIS CREW ALREADY EXISTS"
                  ? "THIS CREW ALREADY EXISTS"
                  : "REGISTRATION FAILED"}
              </span>
              <span className="text-[11px] font-normal text-red-300">
                {errorMessage === "THIS CREW ALREADY EXISTS"
                  ? "A team with this name is already registered in Robo City. Please choose a unique crew name."
                  : errorMessage}
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* REGISTRATION FORM */}
        {/* ========================================================================= */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 01: CREW IDENTITY & CAPTAIN */}
          <div className="rounded-2xl border border-white/10 bg-[#0A0718]/90 p-6 sm:p-8 backdrop-blur-xl space-y-6 shadow-[0_0_30px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF2A85]/20 text-[#FF2A85] font-mono text-xs font-black">
                  01
                </div>
                <h2 className="text-base sm:text-lg font-black uppercase text-white font-mono tracking-wider">
                  YOUR CREW & CAPTAIN
                </h2>
              </div>
              <span className="text-[11px] font-mono text-zinc-400 uppercase">
                * REQUIRED FIELDS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Team Name */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                  CREW / TEAM NAME *
                </label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. CYBER VIPERS, TITAN MECH..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 font-mono transition-colors focus:border-[#FF2A85] focus:bg-white/[0.08] focus:outline-none"
                />
              </div>

              {/* Captain Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                  CAPTAIN NAME *
                </label>
                <input
                  type="text"
                  required
                  value={captainName}
                  onChange={(e) => handleCaptainNameChange(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 font-mono transition-colors focus:border-[#FF6B35] focus:bg-white/[0.08] focus:outline-none"
                />
              </div>

              {/* Captain Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                  CAPTAIN EMAIL *
                </label>
                <input
                  type="email"
                  required
                  value={captainEmail}
                  onChange={(e) => handleCaptainEmailChange(e.target.value)}
                  placeholder="captain@mmmut.ac.in"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 font-mono transition-colors focus:border-[#FF6B35] focus:bg-white/[0.08] focus:outline-none"
                />
              </div>

              {/* Captain Phone */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                  CAPTAIN PHONE NUMBER *
                </label>
                <input
                  type="tel"
                  required
                  value={captainPhone}
                  onChange={(e) => handleCaptainPhoneChange(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 font-mono transition-colors focus:border-[#FF6B35] focus:bg-white/[0.08] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 02: CREW MEMBERS (3 TO 5 MEMBERS) */}
          <div className="rounded-2xl border border-white/10 bg-[#0A0718]/90 p-6 sm:p-8 backdrop-blur-xl space-y-6 shadow-[0_0_30px_rgba(0,0,0,0.6)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00F0FF]/20 text-[#00F0FF] font-mono text-xs font-black">
                  02
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black uppercase text-white font-mono tracking-wider">
                    CREW MEMBERS
                  </h2>
                  <p className="text-[11px] font-mono text-zinc-400">
                    MANDATORY: 3 TO 5 MEMBERS PER SQUAD
                  </p>
                </div>
              </div>

              {/* Crew Size Counter Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#00F0FF]/40 bg-[#00F0FF]/10 px-3.5 py-1 text-xs font-mono font-bold text-[#00F0FF] self-start sm:self-auto">
                <Users className="h-3.5 w-3.5" />
                <span>CREW SIZE: {members.length} / 5</span>
              </div>
            </div>

            {/* Member Cards */}
            <div className="space-y-4">
              {members.map((member, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 space-y-4 transition-all hover:border-white/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00F0FF]/20 text-[#00F0FF] font-mono text-xs font-black">
                        #{idx + 1}
                      </span>
                      <span className="font-mono text-xs font-black uppercase text-white">
                        {idx === 0 ? "MEMBER 1 (CREW CAPTAIN)" : `MEMBER ${idx + 1}`}
                      </span>
                    </div>

                    {/* Delete button (only if > 3 members) */}
                    {members.length > 3 && (
                      <button
                        type="button"
                        onClick={() => removeMember(idx)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[11px] font-mono font-bold text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>REMOVE</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Name */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase">
                        FULL NAME *
                      </label>
                      <input
                        type="text"
                        required
                        value={member.name}
                        onChange={(e) => updateMember(idx, "name", e.target.value)}
                        placeholder="Member name"
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-zinc-500 font-mono focus:border-[#00F0FF] focus:outline-none"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase">
                        EMAIL *
                      </label>
                      <input
                        type="email"
                        required
                        value={member.email}
                        onChange={(e) => updateMember(idx, "email", e.target.value)}
                        placeholder="member@domain.com"
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-zinc-500 font-mono focus:border-[#00F0FF] focus:outline-none"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase">
                        PHONE
                      </label>
                      <input
                        type="tel"
                        value={member.phone}
                        onChange={(e) => updateMember(idx, "phone", e.target.value)}
                        placeholder="Optional phone"
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-zinc-500 font-mono focus:border-[#00F0FF] focus:outline-none"
                      />
                    </div>

                    {/* Branch */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase">
                        BRANCH
                      </label>
                      <input
                        type="text"
                        value={member.branch}
                        onChange={(e) => updateMember(idx, "branch", e.target.value)}
                        placeholder="ECE, CSE, ME, EE..."
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-zinc-500 font-mono focus:border-[#00F0FF] focus:outline-none"
                      />
                    </div>

                    {/* Year */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase">
                        YEAR
                      </label>
                      <input
                        type="text"
                        value={member.year}
                        onChange={(e) => updateMember(idx, "year", e.target.value)}
                        placeholder="1st, 2nd, 3rd, 4th"
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-zinc-500 font-mono focus:border-[#00F0FF] focus:outline-none"
                      />
                    </div>

                    {/* Role */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono text-zinc-400 uppercase">
                        SQUAD ROLE
                      </label>
                      <input
                        type="text"
                        value={member.role}
                        onChange={(e) => updateMember(idx, "role", e.target.value)}
                        placeholder="Driver, Lead, Dev..."
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-zinc-500 font-mono focus:border-[#00F0FF] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Member Button */}
            {members.length < 5 && (
              <button
                type="button"
                onClick={addMember}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#00F0FF]/40 bg-[#00F0FF]/5 py-3 text-xs font-mono font-bold text-[#00F0FF] uppercase hover:bg-[#00F0FF]/10 transition-colors cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                <span>+ ADD CREW MEMBER ({members.length}/5)</span>
              </button>
            )}
          </div>

          {/* SECTION 03: ROBOT DETAILS */}
          <div className="rounded-2xl border border-white/10 bg-[#0A0718]/90 p-6 sm:p-8 backdrop-blur-xl space-y-6 shadow-[0_0_30px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFAA00]/20 text-[#FFAA00] font-mono text-xs font-black">
                  03
                </div>
                <h2 className="text-base sm:text-lg font-black uppercase text-white font-mono tracking-wider">
                  YOUR ROBOT
                </h2>
              </div>
              <Bot className="h-5 w-5 text-[#FFAA00]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Robot Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                  ROBOT NAME *
                </label>
                <input
                  type="text"
                  required
                  value={robotName}
                  onChange={(e) => setRobotName(e.target.value)}
                  placeholder="e.g. THUNDER CLAW, CYBER VIPER..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 font-mono transition-colors focus:border-[#FFAA00] focus:bg-white/[0.08] focus:outline-none"
                />
              </div>

              {/* Robot Image URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                  ROBOT IMAGE URL (OPTIONAL)
                </label>
                <input
                  type="url"
                  value={robotImageUrl}
                  onChange={(e) => setRobotImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 font-mono transition-colors focus:border-[#FFAA00] focus:bg-white/[0.08] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 04: CONFIRMATION SUMMARY & SUBMIT */}
          <div className="rounded-2xl border border-white/10 bg-[#0A0718]/90 p-6 sm:p-8 backdrop-blur-xl space-y-6 shadow-[0_0_30px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-black">
                  04
                </div>
                <h2 className="text-base sm:text-lg font-black uppercase text-white font-mono tracking-wider">
                  CONFIRM & REGISTER
                </h2>
              </div>
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>

            {/* Live Dossier Review Box */}
            <div className="rounded-xl border border-white/10 bg-black/40 p-5 space-y-4 font-mono text-xs">
              <span className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase block">
                ROBO CITY CREW SUMMARY
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase block">TEAM</span>
                  <span className="font-bold text-white text-sm">
                    {teamName || "(ENTER TEAM NAME)"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase block">CAPTAIN</span>
                  <span className="font-bold text-white text-sm">
                    {captainName || "(ENTER CAPTAIN)"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase block">ROBOT</span>
                  <span className="font-bold text-[#FFAA00] text-sm">
                    {robotName || "(ENTER ROBOT NAME)"}
                  </span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3">
                <span className="text-[10px] text-zinc-400 uppercase block mb-1">
                  ROSTER ({members.length} CREW MEMBERS)
                </span>
                <div className="flex flex-wrap gap-2">
                  {members.map((m, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-white/5 border border-white/10 px-2 py-1 text-[11px] text-zinc-300"
                    >
                      #{i + 1} {m.name || "Unnamed"} ({m.role || "Member"})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button with Double-Submission Protection */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || members.length < 3 || members.length > 5}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-4 text-sm font-mono font-black tracking-wider uppercase text-white shadow-[0_0_25px_rgba(255,42,133,0.35)] transition-all ${
                  submitting || members.length < 3
                    ? "bg-zinc-700 cursor-not-allowed opacity-60"
                    : "bg-gradient-to-r from-[#FF2A85] via-[#FF6B35] to-[#FFAA00] hover:scale-[1.01] cursor-pointer"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>REGISTERING CREW...</span>
                  </>
                ) : (
                  <>
                    <span>SUBMIT REGISTRATION</span>
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
