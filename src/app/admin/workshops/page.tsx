import Link from "next/link";
import { Wrench, ArrowLeft } from "lucide-react";

export default function AdminWorkshopsPlaceholderPage() {
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
          <span className="font-mono text-xs font-bold tracking-widest text-[#00F0FF] uppercase">
            ADMIN // WORKSHOPS
          </span>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">
            MANAGE WORKSHOPS
          </h1>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0A0718]/80 p-12 text-center backdrop-blur-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#00F0FF]/10 text-[#00F0FF] mb-4">
          <Wrench className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-white uppercase font-mono">
          WORKSHOP SCHEDULING CONSOLE
        </h2>
        <p className="mt-2 text-xs text-zinc-400 max-w-md mx-auto">
          Workshop session creation, instructor assignment, topics, and venue configuration will be implemented in the workshops step.
        </p>
      </div>
    </div>
  );
}
