"use client";
import Image from "next/image";
export default function Header() {
  return (
    <div className="hidden sm:flex sticky top-0 z-30 items-center gap-2 border-b border-zinc-200/60 bg-white/80 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
      <div className="flex relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm tracking-normal hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800">
          <span className="text-sm">
            <Image src="/globe.svg" alt="Athena AI" width={16} height={16} />
          </span>
          Athena AI v3.5
        </div>
      </div>
    </div>
  );
}
