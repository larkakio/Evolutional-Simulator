"use client";

import { useConnect } from "wagmi";
import { base } from "wagmi/chains";

type ConnectSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function ConnectSheet({ open, onClose }: ConnectSheetProps) {
  const { connectAsync, connectors, isPending } = useConnect();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Connect wallet"
      onClick={onClose}
    >
      <div
        className="w-full max-h-[min(70vh,520px)] overflow-y-auto rounded-t-2xl border border-cyan-400/40 bg-[#070b14] p-5 shadow-[0_-8px_40px_rgba(0,255,255,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-cyan-500/50" />
        <h2 className="mb-4 text-center font-[family-name:var(--font-display)] text-lg tracking-wide text-cyan-200">
          Connect wallet
        </h2>
        <ul className="flex flex-col gap-2">
          {connectors.map((c) => (
            <li key={c.uid}>
              <button
                type="button"
                disabled={isPending}
                className="flex w-full items-center justify-center rounded-xl border border-fuchsia-500/35 bg-fuchsia-950/20 px-4 py-3 text-sm font-medium text-fuchsia-100 transition hover:border-fuchsia-400/60 hover:bg-fuchsia-900/30 disabled:opacity-40"
                onClick={() => {
                  void connectAsync({ connector: c, chainId: base.id }).then(
                    () => onClose(),
                  );
                }}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-4 w-full py-2 text-sm text-slate-500 hover:text-slate-300"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
