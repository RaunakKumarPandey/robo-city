import Link from "next/link";
import { Radio, ArrowLeft } from "lucide-react";

export default function AdminAnnouncementsPlaceholderPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <span className="font-mono text-xs font-bold tracking-widest text-[#8A2BE2] uppercase">
            ADMIN // ANNOUNCEMENTS
          </span>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">
            ROBO RADIO DISPATCH
          </h1>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0A0718]/80 p-12 text-center backdrop-blur-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#8A2BE2]/10 text-[#8A2BE2] mb-4">
          <Radio className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-white uppercase font-mono">
          ROBO RADIO BROADCAST CONSOLE
        </h2>
        <p className="mt-2 text-xs text-zinc-400 max-w-md mx-auto">
          Broadcast feed, emergency alerts, ticker announcement creation and publishing will be wired in the radio dispatch step.
        </p>
      </div>
    </div>
  );
}
