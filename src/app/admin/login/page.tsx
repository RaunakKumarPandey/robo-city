"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, verifyAdminStatus } from "@/lib/supabase";
import { Lock, Mail, ArrowLeft, ShieldAlert, KeyRound, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error || !data.user) {
        setErrorMessage("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      // 2. Authorize against admin_users table
      const isAdmin = await verifyAdminStatus(data.user.id);

      if (!isAdmin) {
        // Sign out unauthorized user immediately
        await supabase.auth.signOut();
        setErrorMessage(
          "Access Denied: Your account is not authorized as an administrator."
        );
        setLoading(false);
        return;
      }

      // 3. Authorized -> Proceed to Admin Dashboard
      router.push("/admin");
    } catch {
      setErrorMessage("Authentication failed. Please verify your connection.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#07070F] px-4 py-12">
      {/* Background Neon Glow */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-30">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-[#FF2A85]/20 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-[#8A2BE2]/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Return to website link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-zinc-400 uppercase transition-colors hover:text-[#00F0FF]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to ROBO CITY</span>
          </Link>
        </div>

        {/* Login Glass Panel */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0A0718]/90 p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF2A85] to-[#8A2BE2] p-[2px] shadow-[0_0_20px_rgba(255,42,133,0.3)] mb-3">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#07070F]">
                <KeyRound className="h-5 w-5 text-[#00F0FF]" />
              </div>
            </div>

            <h1 className="text-xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A85] via-[#FF6B35] to-[#00F0FF]">
              ROBO CITY
            </h1>
            <p className="mt-1 font-mono text-xs font-bold tracking-widest text-zinc-400 uppercase">
              ADMIN CONTROL CENTER
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-400">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-mono text-xs font-bold tracking-widest text-zinc-300 uppercase mb-2">
                EMAIL
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@robocity.local"
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-zinc-500 backdrop-blur-sm transition-colors focus:border-[#FF2A85] focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#FF2A85]"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs font-bold tracking-widest text-zinc-300 uppercase mb-2">
                PASSWORD
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-zinc-500 backdrop-blur-sm transition-colors focus:border-[#FF2A85] focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#FF2A85]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#FF2A85] via-[#FF6B35] to-[#8A2BE2] py-3 text-xs font-black tracking-widest text-white shadow-[0_0_20px_rgba(255,42,133,0.35)] transition-all duration-200 hover:shadow-[0_0_30px_rgba(255,42,133,0.6)] disabled:opacity-50 uppercase cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                <span>ACCESS CONTROL CENTER</span>
              )}
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-wider text-zinc-600">
          SECURE SYSTEM // RESTRICTED ACCESS ONLY
        </p>
      </div>
    </div>
  );
}
