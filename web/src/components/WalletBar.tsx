"use client";

import { useState } from "react";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";

import { ConnectSheet } from "@/components/ConnectSheet";

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function WalletBar() {
  const { address, chainId, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [sheetOpen, setSheetOpen] = useState(false);

  const wrongNetwork = isConnected && chainId !== base.id;

  return (
    <>
      <header className="relative z-20 flex shrink-0 flex-col gap-2 border-b border-cyan-500/20 bg-[#050810]/90 px-3 py-2 backdrop-blur-md">
        {wrongNetwork ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-500/40 bg-amber-950/40 px-3 py-2 text-xs text-amber-100">
            <span>Wrong network — switch to Base</span>
            <button
              type="button"
              disabled={isSwitching}
              className="rounded-lg bg-amber-400/20 px-3 py-1 font-medium text-amber-200 ring-1 ring-amber-400/50 hover:bg-amber-400/30 disabled:opacity-50"
              onClick={() => switchChain({ chainId: base.id })}
            >
              {isSwitching ? "Switching…" : "Switch"}
            </button>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-2">
          <span className="font-[family-name:var(--font-display)] text-[10px] uppercase tracking-[0.2em] text-cyan-400/80">
            Base
          </span>
          {isConnected && address ? (
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-slate-900/80 px-2 py-1 font-mono text-xs text-lime-300">
                {shortAddress(address)}
              </span>
              <button
                type="button"
                className="text-xs text-fuchsia-300/90 hover:text-fuchsia-200"
                onClick={() => disconnect()}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="rounded-lg bg-gradient-to-r from-cyan-500/30 to-fuchsia-600/30 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white ring-1 ring-cyan-400/50 hover:from-cyan-500/45 hover:to-fuchsia-600/45"
              onClick={() => setSheetOpen(true)}
            >
              Connect wallet
            </button>
          )}
        </div>
      </header>
      <ConnectSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
