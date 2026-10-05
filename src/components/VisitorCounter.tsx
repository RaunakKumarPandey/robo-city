"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

export default function VisitorCounter() {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Run in idle time / deprioritized so it NEVER blocks initial page load or critical assets
    const scheduleFetch = () => {
      const isCountedInSession =
        typeof window !== "undefined" &&
        sessionStorage.getItem("robocity_visit_recorded") === "1";

      const url = isCountedInSession ? "/api/visitors" : "/api/visitors?inc=1";

      fetch(url, {
        priority: "low" as any,
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data.count === "number") {
            setVisitorCount(data.count);
            if (!isCountedInSession && typeof window !== "undefined") {
              sessionStorage.setItem("robocity_visit_recorded", "1");
            }
          }
        })
        .catch(() => {
          // Graceful silent fallback without affecting UI
        });
    };

    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(scheduleFetch, { timeout: 2500 });
      } else {
        setTimeout(scheduleFetch, 1000);
      }
    }
  }, []);

  // Format count nicely (e.g. 1,450)
  const formattedCount =
    visitorCount !== null ? visitorCount.toLocaleString("en-IN") : "---";

  return (
    <div
      title="Total visitor traffic logged by Robo City arena network"
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0c0915]/80 px-3 py-1 text-[11px] font-mono text-zinc-300 backdrop-blur-md shadow-[0_0_12px_rgba(53,217,255,0.08)] hover:border-[#35D9FF]/40 transition-colors"
      aria-label={`Total site visits: ${formattedCount}`}
    >
      {/* Live Pulsing Dot */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#35D9FF] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#35D9FF]" />
      </span>

      <Users className="h-3 w-3 text-zinc-400" />

      <span className="text-zinc-400 uppercase tracking-wider text-[10px]">
        VISITS:
      </span>

      <span className="font-bold text-white tracking-wide">
        {isMounted ? formattedCount : "..."}
      </span>
    </div>
  );
}
