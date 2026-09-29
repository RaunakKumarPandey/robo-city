"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Shield, Sparkles, Radio, Zap } from "lucide-react";
import { NavItem } from "@/types";

const navLinks: NavItem[] = [
  { name: "HOME", href: "/" },
  { name: "MISSIONS", href: "/missions" },
  { name: "GARAGE", href: "/workshops" },
  { name: "LEADERBOARD", href: "/leaderboard" },
  { name: "ABOUT", href: "/about" },
  { name: "CONTACT", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Hide public navbar inside admin portal pages (admin has its own sidebar)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    return null;
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled || isOpen
          ? "border-b border-[#FF2D8D]/25 bg-[#08070D]/90 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.85)]"
          : "border-b border-white/5 bg-gradient-to-b from-[#08070D]/90 via-[#08070D]/50 to-transparent backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* 1. Left Brand Logo: IEEE Badge + ROBO CITY // ROBOVERSE '26 */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF2D8D] via-[#FF7A3D] to-[#35D9FF] p-[2px] shadow-[0_0_15px_rgba(255,45,141,0.4)] transition-transform duration-200 group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-[#08070D]">
              <span className="font-mono text-[11px] font-black tracking-wider text-[#35D9FF] group-hover:text-white transition-colors">
                IEEE
              </span>
            </div>
            {/* Corner HUD tick */}
            <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-[#FF2D8D]" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-[0.18em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D8D] via-[#FF7A3D] to-[#35D9FF] filter drop-shadow-[0_0_12px_rgba(255,45,141,0.4)]">
              ROBO CITY
            </span>
            <span className="font-mono text-[9px] font-extrabold tracking-[0.25em] text-[#FFE8C7]/80 uppercase -mt-0.5 flex items-center gap-1.5">
              <span>ROBOVERSE &apos;26</span>
            </span>
          </div>
        </Link>

        {/* 2. Center HUD Desktop Navigation Links */}
        <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-[#120B20]/70 px-3 py-1 backdrop-blur-xl md:flex shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative rounded-full px-3.5 py-1.5 font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-[#FF2D8D]/30 to-[#FF7A3D]/30 text-white shadow-[0_0_15px_rgba(255,45,141,0.45)] border border-[#FF2D8D]/60"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{link.name}</span>
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-[#35D9FF] shadow-[0_0_8px_#35D9FF]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* 3. Right Status & Quick Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Organising Team Button (Replaced circled status badge) */}
          <Link
            href="/team"
            className={`group relative inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[11px] font-bold tracking-wider transition-all duration-200 ${
              pathname === "/team"
                ? "border-[#FF2D8D] bg-[#FF2D8D]/20 text-white shadow-[0_0_20px_rgba(255,45,141,0.5)]"
                : "border-[#35D9FF]/40 bg-[#120B20]/80 text-[#35D9FF] shadow-[0_0_12px_rgba(53,217,255,0.2)] hover:border-[#35D9FF] hover:bg-[#35D9FF]/20 hover:text-white hover:shadow-[0_0_20px_rgba(53,217,255,0.5)]"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#35D9FF] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#35D9FF] shadow-[0_0_6px_#35D9FF]" />
            </span>
            <span className="font-black text-white group-hover:text-[#35D9FF] transition-colors uppercase tracking-wider">
              ORGANISING TEAM
            </span>
          </Link>

          {/* Quick Register CTA */}
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#FF2D8D] to-[#FF7A3D] px-3.5 py-1.5 font-mono text-xs font-black uppercase tracking-wider text-white shadow-[0_0_18px_rgba(255,45,141,0.45)] hover:shadow-[0_0_25px_rgba(255,45,141,0.7)] transition-all hover:scale-105"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#FFE8C7]" />
            <span>JOIN CREW</span>
          </Link>

          {/* Admin Desk Link */}
          <Link
            href="/admin/login"
            title="Organizer Admin Portal"
            className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:text-[#35D9FF] hover:border-[#35D9FF]/50 hover:bg-[#35D9FF]/10 transition-colors"
          >
            <Zap className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile Header Buttons */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Organising Team Link */}
          <Link
            href="/team"
            className="inline-flex items-center gap-1 rounded-lg border border-[#35D9FF]/40 bg-[#35D9FF]/10 px-2 py-1 font-mono text-[10px] font-bold text-[#35D9FF]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#35D9FF]" />
            <span>TEAM</span>
          </Link>

          {/* Mobile Join Button */}
          <Link
            href="/register"
            className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#FF2D8D] to-[#FF7A3D] px-2.5 py-1 font-mono text-[11px] font-black uppercase tracking-wider text-white shadow-[0_0_10px_rgba(255,45,141,0.4)]"
          >
            <span>JOIN</span>
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Navigation Menu"
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white/10 hover:text-white focus:outline-none"
          >
            {isOpen ? <X className="h-5 w-5 text-[#FF2D8D]" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile HUD Menu Drawer */}
      {isOpen && (
        <div className="border-b border-[#FF2D8D]/40 bg-[#08070D]/98 px-5 pt-4 pb-7 backdrop-blur-2xl md:hidden shadow-[0_20px_50px_rgba(0,0,0,0.95)]">
          {/* Mobile HUD Top Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              GPS: 26.73° N, 83.43° E // ROBOVERSE
            </div>
            <div className="font-mono text-[10px] font-black tracking-widest text-[#35D9FF]">
              SYSTEM READY
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 font-mono text-xs font-bold tracking-widest uppercase transition-all ${
                    isActive
                      ? "border border-[#FF2D8D]/60 bg-gradient-to-r from-[#FF2D8D]/25 to-transparent text-white shadow-[0_0_15px_rgba(255,45,141,0.3)]"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && <span className="h-2 w-2 rounded-full bg-[#35D9FF] shadow-[0_0_8px_#35D9FF]" />}
                </Link>
              );
            })}

            {/* Mobile Organising Team Link */}
            <Link
              href="/team"
              onClick={() => setIsOpen(false)}
              className={`flex items-center justify-between rounded-lg px-4 py-3 font-mono text-xs font-bold tracking-widest uppercase transition-all ${
                pathname === "/team"
                  ? "border border-[#FF2D8D]/60 bg-gradient-to-r from-[#FF2D8D]/25 to-transparent text-white shadow-[0_0_15px_rgba(255,45,141,0.3)]"
                  : "text-[#35D9FF] bg-[#35D9FF]/10 border border-[#35D9FF]/20 hover:bg-[#35D9FF]/20"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#35D9FF] animate-ping" />
                <span>ORGANISING TEAM</span>
              </div>
              <span className="text-[10px] font-bold text-zinc-400">HQ</span>
            </Link>

            {/* Mobile Registration Button */}
            <Link
              href="/register"
              onClick={() => setIsOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#FF2D8D] via-[#FF7A3D] to-[#35D9FF] py-3.5 font-mono text-xs font-black tracking-widest text-white shadow-[0_0_25px_rgba(255,45,141,0.5)] uppercase"
            >
              <Sparkles className="h-4 w-4 text-[#FFE8C7]" />
              <span>BUILD YOUR CREW → REGISTER</span>
            </Link>

            {/* Mobile Admin Portal Link */}
            <Link
              href="/admin/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-xs font-bold tracking-wider text-zinc-400 hover:text-white hover:border-[#35D9FF]/40 transition-colors"
            >
              <span>ORGANIZER ADMIN DESK</span>
              <Shield className="h-4 w-4 text-zinc-500" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
