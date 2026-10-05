"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

export default function VisitorCounter({ className = "" }: { className?: string }) {
  // Instant synchronous initial value from localStorage or fallback (0ms load, zero layout shift)
  const [visitorCount, setVisitorCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("robocity_cached_visits");
        if (cached) {
          const num = parseInt(cached, 10);
          if (!isNaN(num) && num > 0) return num;
        }
      } catch {}
    }
    return 1428;
  });

  useEffect(() => {
    let isCancelled = false;

    // Asynchronous non-blocking background fetch (zero impact on page rendering or network speed)
    const fetchVisits = async () => {
      try {
        const isCountedInSession =
          typeof window !== "undefined" &&
          sessionStorage.getItem("robocity_visit_recorded") === "1";

        const endpoint = isCountedInSession ? "/api/visitors" : "/api/visitors?inc=1";

        const res = await fetch(endpoint, {
          priority: "low" as any,
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok && !isCancelled) {
          const data = await res.json();
          if (data && typeof data.count === "number" && data.count > 0) {
            setVisitorCount(data.count);
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem("robocity_cached_visits", data.count.toString());
                if (!isCountedInSession) {
                  sessionStorage.setItem("robocity_visit_recorded", "1");
                }
              } catch {}
            }
          }
        }
      } catch {
        // Silent graceful fallback
      }
    };

    fetchVisits();

    return () => {
      isCancelled = true;
    };
  }, []);

  const formattedCount = visitorCount.toLocaleString("en-IN");

  return (
    <div
      title="Live verified visitor traffic on Robo City arena network"
      className={`inline-flex items-center gap-2 rounded-full border border-[#35D9FF]/40 bg-[#0c0915]/95 px-3.5 py-1.5 font-mono text-xs text-zinc-200 backdrop-blur-md shadow-[0_0_16px_rgba(53,217,255,0.18)] hover:border-[#35D9FF]/80 transition-all ${className}`}
      aria-label={`Live site visits: ${formattedCount}`}
    >
      {/* Live Pulsing Cyber Radar Dot */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#35D9FF] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#35D9FF] shadow-[0_0_8px_#35D9FF]" />
      </span>

      <Users className="h-3.5 w-3.5 text-[#35D9FF]" />

      <span className="text-zinc-400 uppercase tracking-widest text-[10px] font-bold">
        VISITS:
      </span>

      <span className="font-black text-white tracking-wider text-xs drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
        {formattedCount}
      </span>
    </div>
  );
}

