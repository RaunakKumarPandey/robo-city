"use client";

import Link from "next/link";
import { CityLocation } from "@/types";
import {
  Building2,
  Flag,
  Trophy,
  Bot,
  Wrench,
  CircleDollarSign,
  Users,
  ArrowRight,
} from "lucide-react";

interface CityLocationCardProps {
  location: CityLocation;
}

export default function CityLocationCard({ location }: CityLocationCardProps) {
  const getIcon = () => {
    const props = { className: "h-6 w-6" };
    switch (location.iconName) {
      case "building":
        return <Building2 {...props} />;
      case "flag":
        return <Flag {...props} />;
      case "trophy":
        return <Trophy {...props} />;
      case "bot":
        return <Bot {...props} />;
      case "wrench":
        return <Wrench {...props} />;
      case "vault":
        return <CircleDollarSign {...props} />;
      case "users":
        return <Users {...props} />;
      default:
        return <Building2 {...props} />;
    }
  };

  const getThemeStyles = () => {
    switch (location.themeColor) {
      case "pink":
        return {
          borderHover: "hover:border-[#FF2D8D] hover:shadow-[0_0_30px_rgba(255,45,141,0.35)]",
          badge: "bg-[#FF2D8D]/15 text-[#FF4FB3] border-[#FF2D8D]/40",
          iconBg: "bg-[#FF2D8D]/15 text-[#FF4FB3] border-[#FF2D8D]/30 group-hover:bg-[#FF2D8D] group-hover:text-white",
          accentText: "text-[#FF4FB3]",
          dotColor: "bg-[#FF2D8D]",
          glowColor: "rgba(255,45,141,0.3)",
        };
      case "orange":
        return {
          borderHover: "hover:border-[#FF7A3D] hover:shadow-[0_0_30px_rgba(255,122,61,0.35)]",
          badge: "bg-[#FF7A3D]/15 text-[#FF7A3D] border-[#FF7A3D]/40",
          iconBg: "bg-[#FF7A3D]/15 text-[#FF7A3D] border-[#FF7A3D]/30 group-hover:bg-[#FF7A3D] group-hover:text-white",
          accentText: "text-[#FF7A3D]",
          dotColor: "bg-[#FF7A3D]",
          glowColor: "rgba(255,122,61,0.3)",
        };
      case "cyan":
        return {
          borderHover: "hover:border-[#35D9FF] hover:shadow-[0_0_30px_rgba(53,217,255,0.35)]",
          badge: "bg-[#35D9FF]/15 text-[#35D9FF] border-[#35D9FF]/40",
          iconBg: "bg-[#35D9FF]/15 text-[#35D9FF] border-[#35D9FF]/30 group-hover:bg-[#35D9FF] group-hover:text-black",
          accentText: "text-[#35D9FF]",
          dotColor: "bg-[#35D9FF]",
          glowColor: "rgba(53,217,255,0.3)",
        };
      case "purple":
        return {
          borderHover: "hover:border-[#FF4FB3] hover:shadow-[0_0_30px_rgba(255,79,179,0.35)]",
          badge: "bg-[#FF4FB3]/15 text-[#FF4FB3] border-[#FF4FB3]/40",
          iconBg: "bg-[#FF4FB3]/15 text-[#FF4FB3] border-[#FF4FB3]/30 group-hover:bg-[#FF4FB3] group-hover:text-white",
          accentText: "text-[#FF4FB3]",
          dotColor: "bg-[#FF4FB3]",
          glowColor: "rgba(255,79,179,0.3)",
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <Link
      href={location.href}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#120B20]/80 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] ${theme.borderHover}`}
    >
      {/* Background radial glow on hover */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-60"
        style={{ backgroundColor: theme.glowColor }}
      />

      <div>
        {/* Top Node Header */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${theme.dotColor} shadow-[0_0_8px_currentColor]`} />
            <span className="font-mono text-xs font-bold tracking-widest text-zinc-300 uppercase">
              SECTOR {location.number}
            </span>
          </div>

          {/* Status Badge */}
          {location.status && (
            <div
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-black tracking-wider uppercase ${theme.badge}`}
            >
              {location.statusType === "live" && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#35D9FF]" />
                </span>
              )}
              <span>{location.status}</span>
            </div>
          )}
        </div>

        {/* Card Body: Icon & Titles */}
        <div className="mt-5 flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-110 shadow-lg ${theme.iconBg}`}
          >
            {getIcon()}
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-white">
              {location.title}
            </h3>
            <p className={`font-mono text-xs font-bold tracking-wider uppercase ${theme.accentText}`}>
              {location.subtitle}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="mt-4 font-sans text-xs sm:text-sm text-zinc-300 leading-relaxed">
          {location.description}
        </p>
      </div>

      {/* Card Action Footer */}
      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3.5 font-mono text-xs font-bold tracking-wider uppercase text-zinc-400 group-hover:text-white">
        <span>ACCESS SECTOR</span>
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 text-[#35D9FF]" />
      </div>
    </Link>
  );
}
