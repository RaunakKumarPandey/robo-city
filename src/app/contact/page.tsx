import { eventData } from "@/data/eventData";

export default function ContactPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-1 flex-col justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
          DISPATCH <span className="text-[#00F0FF]">CONTACT</span>
        </h1>
        <p className="mx-auto max-w-2xl text-base text-zinc-400 sm:text-lg">
          For inquiries reach out to {eventData.organizer} at {eventData.email} or {eventData.social}.
        </p>
        <div className="pt-4 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
          [ COMMS DESK — UNDER CONSTRUCTION ]
        </div>
      </div>
    </div>
  );
}
