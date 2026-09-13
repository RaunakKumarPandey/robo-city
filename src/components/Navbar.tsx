"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Radio } from "lucide-react";

const navLinks = [
  { name: "HOME", href: "/" },
  { name: "CITY HQ", href: "/about" },
  { name: "MISSIONS", href: "/missions" },
  { name: "WORKSHOPS", href: "/workshops" },
  { name: "LEADERBOARD", href: "/leaderboard" },
  { name: "REGISTER", href: "/register" },
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
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Do not render public navbar on admin pages
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled || isOpen
          ? "border-b border-white/10 bg-[#07070F]/90 backdrop-blur-xl shadow-lg shadow-black/60"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF2A85] via-[#8A2BE2] to-[#00F0FF] p-[2px] transition-transform duration-200 group-hover:scale-105 shadow-[0_0_12px_rgba(255,42,133,0.3)]">
            <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-[#07070F]">
              <span className="font-mono text-xs font-black tracking-wider text-[#00F0FF]">
                RC
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A85] via-[#FF6B35] to-[#00F0FF] uppercase">
              ROBO CITY
            </span>
            <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase -mt-1">
              RoboVerse &apos;26
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 lg:gap-1.5 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`rounded-md px-2.5 py-1.5 text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
                  isActive
                    ? "bg-[#FF2A85]/20 text-[#FF2A85] shadow-[0_0_12px_rgba(255,42,133,0.35)]"
                    : "text-zinc-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Desktop LIVE SIGNAL Badge & Admin Link */}
        <div className="hidden md:flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-black tracking-widest text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="text-[11px] uppercase font-mono font-bold">LIVE SIGNAL</span>
          </div>

          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#FF2A85]/50 bg-[#FF2A85]/10 px-3.5 py-1 text-xs font-mono font-black uppercase tracking-wider text-white hover:border-[#00F0FF] hover:bg-[#00F0FF]/20 hover:text-[#00F0FF] transition-all shadow-[0_0_10px_rgba(255,42,133,0.3)]"
          >
            <span className="text-[#FF2A85]">⚡</span>
            <span>ADMIN</span>
          </Link>
        </div>

        {/* Mobile Header Action Buttons */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile direct ADMIN link */}
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1 rounded-lg border border-[#FF2A85]/60 bg-[#FF2A85]/20 px-2.5 py-1 text-[11px] font-mono font-black uppercase tracking-wider text-white shadow-[0_0_10px_rgba(255,42,133,0.4)]"
          >
            <span>ADMIN</span>
          </Link>

          {/* Small pulse dot on mobile header */}
          <div className="flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>LIVE</span>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Navigation Menu"
            className="rounded-lg p-2 text-zinc-300 hover:bg-white/10 hover:text-white focus:outline-none"
          >
            {isOpen ? <X className="h-6 w-6 text-[#FF2A85]" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="border-b border-[#FF2A85]/30 bg-[#07070F]/98 px-4 pt-3 pb-6 backdrop-blur-2xl md:hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-bold tracking-wider uppercase transition-colors ${
                    isActive
                      ? "border border-[#FF2A85]/40 bg-[#FF2A85]/20 text-[#FF2A85]"
                      : "text-zinc-200 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && <span className="h-2 w-2 rounded-full bg-[#FF2A85]" />}
                </Link>
              );
            })}

            {/* Mobile Admin Link */}
            <Link
              href="/admin/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold tracking-wider uppercase text-zinc-300 hover:border-[#FF2A85]/40 hover:bg-[#FF2A85]/20 hover:text-white transition-colors"
            >
              <span>ORGANIZER ADMIN DESK</span>
            </Link>

            {/* Mobile LIVE SIGNAL Badge */}
            <div className="pt-2">
              <div className="flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 py-2.5 text-xs font-black tracking-widest text-red-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                <span>🔴 LIVE SIGNAL // ROBOVERSE &apos;26</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
