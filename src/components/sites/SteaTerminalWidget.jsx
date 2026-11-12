import React from "react";

/**
 * SteaTerminalWidget — macOS/iOS-style terminal panel that closes the directory
 * page. Replaces the old four ecosystem cards: same information, told as a
 * boot log instead of a marketing grid.
 */
function SteaTerminalWidget() {
  return (
    <section className="mx-auto my-8 w-full max-w-3xl px-4 md:my-12">
      <div
        role="region"
        aria-label="STEA ecosystem terminal"
        className="overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A] shadow-2xl"
      >
        {/* ── window chrome ── */}
        <div className="flex h-10 items-center gap-2 border-b border-white/5 bg-[#151515] px-4">
          <span className="flex items-center gap-2" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-[#FF5F56]" />
            <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
            <span className="h-3 w-3 rounded-full bg-[#27C93F]" />
          </span>
          <span className="flex-1 truncate text-center font-mono text-xs text-zinc-500">
            stea@sites: ~/ecosystem
          </span>
          <span className="w-[52px]" aria-hidden="true" />
        </div>

        {/* ── boot log ── */}
        <div className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed md:p-6 md:text-sm">
          <p className="whitespace-pre-wrap break-words">
            <span className="text-emerald-400">➜</span>{" "}
            <span className="text-blue-400">~</span>{" "}
            <span className="text-white">stea --init ecosystem</span>
          </p>
          <p className="whitespace-pre-wrap break-words text-zinc-500">
            // Booting STEA Core Modules...
          </p>

          <ul className="mt-2 space-y-1">
            <li className="whitespace-pre-wrap break-words text-white">
              <span className="text-zinc-500">[</span>
              <span className="text-emerald-400">OK</span>
              <span className="text-zinc-500">]</span> STEA Code (Dev Studio)
              initialized.
            </li>
            <li className="whitespace-pre-wrap break-words text-white">
              <span className="text-zinc-500">[</span>
              <span className="text-emerald-400">OK</span>
              <span className="text-zinc-500">]</span> STEA 360 (Business & Tax)
              synced.
            </li>
            <li className="whitespace-pre-wrap break-words text-white">
              <span className="text-zinc-500">[</span>
              <span className="text-emerald-400">OK</span>
              <span className="text-zinc-500">]</span> STEA VPN (Secure Private
              Internet) tunneling.
            </li>
            <li className="whitespace-pre-wrap break-words text-white">
              <span className="text-zinc-500">[</span>
              <span className="text-emerald-400">OK</span>
              <span className="text-zinc-500">]</span> Isaya Masika (Portfolio)
              loaded.
            </li>
          </ul>

          <p className="mt-3 whitespace-pre-wrap break-words">
            <span className="text-emerald-400">➜</span>{" "}
            <span className="text-blue-400">~</span>{" "}
            <span className="animate-pulse text-white">▌</span>
          </p>
        </div>
      </div>
    </section>
  );
}

export default SteaTerminalWidget;
