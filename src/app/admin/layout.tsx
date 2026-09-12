"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  Users,
  Trophy,
  Wrench,
  Radio,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";

const adminNavItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Teams", href: "/admin/teams", icon: Users },
  { name: "Scores", href: "/admin/scores", icon: Trophy },
  { name: "Workshops", href: "/admin/workshops", icon: Wrench },
  { name: "Announcements", href: "/admin/announcements", icon: Radio },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on login page, render directly without the dashboard shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      router.push("/admin/login");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#07070F] text-zinc-100">
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden w-64 flex-col justify-between border-r border-white/10 bg-[#090615]/95 p-6 backdrop-blur-xl md:flex">
        <div className="space-y-8">
          {/* Brand Header */}
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF2A85] to-[#8A2BE2] p-[2px] shadow-[0_0_12px_rgba(255,42,133,0.3)]">
              <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-[#07070F]">
                <ShieldCheck className="h-4 w-4 text-[#00F0FF]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A85] via-[#FF6B35] to-[#00F0FF] uppercase">
                ROBO CITY
              </span>
              <span className="font-mono text-[9px] font-bold tracking-widest text-zinc-400 uppercase">
                ADMIN CONSOLE
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 ${
                    isActive
                      ? "border border-[#FF2A85]/40 bg-[#FF2A85]/20 text-[#FF2A85] shadow-[0_0_15px_rgba(255,42,133,0.25)]"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="space-y-3 border-t border-white/10 pt-4">
          <Link
            href="/"
            className="flex w-full items-center justify-center rounded-lg border border-white/10 bg-white/5 py-2 text-[11px] font-mono font-bold tracking-wider text-zinc-400 uppercase transition-colors hover:bg-white/10 hover:text-white"
          >
            ← View Main Site
          </Link>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 py-2 text-[11px] font-mono font-bold tracking-wider text-red-400 uppercase transition-colors hover:bg-red-500 hover:text-white cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>LOGOUT</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#090615]/90 px-4 backdrop-blur-md md:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="font-black text-sm tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A85] to-[#00F0FF] uppercase">
              ROBO CITY ADMIN
            </span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Admin Navigation"
            className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-[#FF2A85]" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="border-b border-white/10 bg-[#090615] px-4 py-4 md:hidden">
            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-mono font-bold uppercase transition-colors ${
                      isActive
                        ? "bg-[#FF2A85]/20 text-[#FF2A85]"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <div className="pt-3 border-t border-white/10 space-y-2">
                <Link
                  href="/"
                  className="block text-center rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-mono font-bold uppercase text-zinc-400"
                >
                  View Main Site
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 py-2 text-xs font-mono font-bold uppercase text-red-400"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>LOGOUT</span>
                </button>
              </div>
            </nav>
          </div>
        )}

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
