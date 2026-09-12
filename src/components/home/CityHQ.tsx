import { eventData } from "@/data/eventData";
import {
  Ticket,
  Users,
  Trophy,
  Award,
  Wrench,
  Calendar,
  Building2,
  Sparkles,
} from "lucide-react";

const highlightCards = [
  {
    number: "01",
    title: "FREE REGISTRATION",
    description: "No entry fee.",
    icon: Ticket,
    accentColor: "pink",
    borderColor: "border-[#FF2A85]/30 hover:border-[#FF2A85] hover:shadow-[0_0_20px_rgba(255,42,133,0.25)]",
    iconBg: "bg-[#FF2A85]/10 text-[#FF2A85]",
    numberColor: "text-[#FF2A85]",
  },
  {
    number: "02",
    title: "3–5 MEMBERS",
    description: "Build your crew with 3 to 5 members.",
    icon: Users,
    accentColor: "orange",
    borderColor: "border-[#FF6B35]/30 hover:border-[#FF6B35] hover:shadow-[0_0_20px_rgba(255,107,53,0.25)]",
    iconBg: "bg-[#FF6B35]/10 text-[#FF6B35]",
    numberColor: "text-[#FF6B35]",
  },
  {
    number: "03",
    title: "₹12,000 PRIZE POOL",
    description: "Cash prizes for winners and runners-up.",
    icon: Trophy,
    accentColor: "cyan",
    borderColor: "border-[#00F0FF]/30 hover:border-[#00F0FF] hover:shadow-[0_0_20px_rgba(0,240,255,0.25)]",
    iconBg: "bg-[#00F0FF]/10 text-[#00F0FF]",
    numberColor: "text-[#00F0FF]",
  },
  {
    number: "04",
    title: "CERTIFICATES + GOODIES",
    description: "All participants receive appreciation certificates.",
    icon: Award,
    accentColor: "purple",
    borderColor: "border-[#8A2BE2]/30 hover:border-[#8A2BE2] hover:shadow-[0_0_20px_rgba(138,43,226,0.25)]",
    iconBg: "bg-[#8A2BE2]/10 text-[#8A2BE2]",
    numberColor: "text-[#8A2BE2]",
  },
  {
    number: "05",
    title: "WORKSHOPS",
    description: "Hands-on expert-led training before the competition.",
    icon: Wrench,
    accentColor: "cyan",
    borderColor: "border-[#00F0FF]/30 hover:border-[#00F0FF] hover:shadow-[0_0_20px_rgba(0,240,255,0.25)]",
    iconBg: "bg-[#00F0FF]/10 text-[#00F0FF]",
    numberColor: "text-[#00F0FF]",
  },
  {
    number: "06",
    title: "3-DAY EVENT",
    description: "Three days of robotics, challenges and competition.",
    icon: Calendar,
    accentColor: "orange",
    borderColor: "border-[#FF6B35]/30 hover:border-[#FF6B35] hover:shadow-[0_0_20px_rgba(255,107,53,0.25)]",
    iconBg: "bg-[#FF6B35]/10 text-[#FF6B35]",
    numberColor: "text-[#FF6B35]",
  },
];

export default function CityHQ() {
  return (
    <section
      id="city-hq"
      className="relative z-10 w-full overflow-hidden border-t border-white/10 bg-[#07070F] py-20 px-4 sm:px-6 lg:px-8"
    >
      {/* Background Atmosphere & Grid */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:36px_36px]" />
        <div className="absolute top-1/3 left-1/3 h-72 w-72 rounded-full bg-[#FF2A85]/10 blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/3 h-72 w-72 rounded-full bg-[#FF6B35]/10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF2A85]/30 bg-[#FF2A85]/10 px-4 py-1 text-xs font-mono font-bold tracking-widest text-[#FF2A85] uppercase mb-4 shadow-[0_0_15px_rgba(255,42,133,0.2)]">
            <Building2 className="h-3.5 w-3.5 text-[#00F0FF]" />
            <span>ROBO CITY // CITY HQ</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            WELCOME TO{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A85] via-[#FF6B35] to-[#FFAA00]">
              ROBOVERSE&apos;26
            </span>
          </h2>

          <p className="mt-4 mx-auto max-w-2xl text-sm sm:text-base text-zinc-400 leading-relaxed">
            RoboVerse&apos;26 is a robotics festival organized by {eventData.organizer}.
          </p>
        </div>

        {/* 6 Event Highlight Cards Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {highlightCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.number}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-[#0A0718]/80 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 ${card.borderColor}`}
              >
                {/* Header Node / Number */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                    <span className="font-mono text-[11px] font-bold tracking-widest text-zinc-500 uppercase">
                      SPEC
                    </span>
                  </div>
                  <span className={`font-mono text-xs font-black tracking-wider ${card.numberColor}`}>
                    {card.number}
                  </span>
                </div>

                {/* Body: Icon + Title + Description */}
                <div className="mt-5 space-y-3">
                  <div
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 transition-transform duration-300 group-hover:scale-105 ${card.iconBg}`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>

                  <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                    {card.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Subtle Bottom Accent Indicator */}
                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">
                    VERIFIED // OFFICIAL
                  </span>
                  <Sparkles className="h-3.5 w-3.5 text-zinc-600 group-hover:text-white transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
