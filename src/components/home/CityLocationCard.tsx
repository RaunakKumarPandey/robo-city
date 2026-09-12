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
  Radio,
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
          borderHover: "hover:border-[#FF2A85]/80 hover:shadow-[0_0_25px_rgba(255,42,133,0.35)]",
          badge: "bg-[#FF2A85]/15 text-[#FF2A85] border-[#FF2A85]/30",
          iconBg: "bg-[#FF2A85]/10 text-[#FF2A85] border-[#FF2A85]/30 group-hover:bg-[#FF2A85] group-hover:text-white",
          accentText: "text-[#FF2A85]",
          dotColor: "bg-[#FF2A85]",
          glowColor: "rgba(255,42,133,0.2)",
        };
      case "orange":
        return {
          borderHover: "hover:border-[#FF6B35]/80 hover:shadow-[0_0_25px_rgba(255,107,53,0.35)]",
          badge: "bg-[#FF6B35]/15 text-[#FF6B35] border-[#FF6B35]/30",
          iconBg: "bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/30 group-hover:bg-[#FF6B35] group-hover:text-white",
          accentText: "text-[#FF6B35]",
          dotColor: "bg-[#FF6B35]",
          glowColor: "rgba(255,107,53,0.2)",
        };
      case "cyan":
        return {
          borderHover: "hover:border-[#00F0FF]/80 hover:shadow-[0_0_25px_rgba(0,240,255,0.35)]",
          badge: "bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/30",
          iconBg: "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30 group-hover:bg-[#00F0FF] group-hover:text-black",
          accentText: "text-[#00F0FF]",
          dotColor: "bg-[#00F0FF]",
          glowColor: "rgba(0,240,255,0.2)",
        };
      case "purple":
        return {
          borderHover: "hover:border-[#8A2BE2]/80 hover:shadow-[0_0_25px_rgba(138,43,226,0.35)]",
          badge: "bg-[#8A2BE2]/15 text-[#8A2BE2] border-[#8A2BE2]/30",
          iconBg: "bg-[#8A2BE2]/10 text-[#8A2BE2] border-[#8A2BE2]/30 group-hover:bg-[#8A2BE2] group-hover:text-white",
          accentText: "text-[#8A2BE2]",
          dotColor: "bg-[#8A2BE2]",
          glowColor: "rgba(138,43,226,0.2)",
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <Link
      href={location.href}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-[#0A0718]/80 p-5 sm:p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 ${theme.borderHover}`}
    >
      {/* Subtle Background Glow on Hover */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-60"
        style={{ backgroundColor: theme.glowColor }}
      />

      <div>
        {/* Top Node Header */}
        <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${theme.dotColor} shadow-[0_0_8px_currentColor]`} />
            <span className="font-mono text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
              DISTRICT {location.number}
            </span>
          </div>

          {/* Status Badge */}
          {location.status && (
            <div
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase ${theme.badge}`}
            >
              {location.statusType === "live" && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00F0FF]" />
                </span>
              )}
              <span>{location.status}</span>
            </div>
          )}
        </div>

        {/* Card Body: Icon & Titles */}
        <div className="mt-5 flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 group-hover:scale-105 ${theme.iconBg}`}
          >
            {getIcon()}
          </div>

          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white group-hover:text-white">
              {location.title}
            </h3>
            <p className={`font-mono text-[11px] font-bold tracking-wider uppercase ${theme.accentText}`}>
              {location.subtitle}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="mt-4 text-xs sm:text-sm text-zinc-400 leading-relaxed">
          {location.description}
        </p>
      </div>

      {/* Footer Navigation CTA */}
      <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-xs font-black tracking-widest text-zinc-400 uppercase transition-colors group-hover:text-white">
        <span>ENTER DISTRICT</span>
        <div className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 transition-all duration-200 group-hover:border-white/30 group-hover:bg-white/15 group-hover:translate-x-1">
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  );
}
