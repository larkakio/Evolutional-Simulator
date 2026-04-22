"use client";

import { useAccount, useReadContract, useSwitchChain, useWriteContract } from "wagmi";
import { base } from "wagmi/chains";

import { getCheckInDataSuffix } from "@/lib/builderSuffix";
import { checkInAbi, getCheckInAddress } from "@/lib/contracts/checkIn";

export function CheckInPanel() {
  const { address, chainId, isConnected } = useAccount();
  const contractAddress = getCheckInAddress();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const { data: streak, refetch: refetchStreak } = useReadContract({
    address: contractAddress,
    abi: checkInAbi,
    functionName: "streak",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(contractAddress && address) },
  });

  const busy = isSwitching || isWriting;
  const onBase = chainId === base.id;
  const canSubmit =
    isConnected &&
    address &&
    contractAddress &&
    onBase &&
    !busy;

  async function onCheckIn() {
    if (!address || !contractAddress) return;
    const baseId = base.id;
    if (chainId !== baseId) {
      await switchChainAsync({ chainId: baseId });
    }
    const dataSuffix = getCheckInDataSuffix();
    await writeContractAsync({
      address: contractAddress,
      abi: checkInAbi,
      functionName: "checkIn",
      chainId: baseId,
      ...(dataSuffix ? { dataSuffix } : {}),
    });
    await refetchStreak();
  }

  if (!contractAddress) {
    return (
      <section className="rounded-xl border border-slate-700/60 bg-slate-950/50 p-4 text-center text-xs text-slate-500">
        Daily check-in contract address is not configured.
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-lime-400/25 bg-gradient-to-br from-emerald-950/40 to-slate-950/80 p-4 shadow-[0_0_24px_rgba(50,255,100,0.08)]">
      <h3 className="mb-1 font-[family-name:var(--font-display)] text-sm tracking-wide text-lime-200">
        Daily check-in
      </h3>
      <p className="mb-3 text-[11px] leading-relaxed text-slate-400">
        Once per UTC day on Base. You only pay gas — no fee to the contract.
      </p>
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="text-slate-500">Streak</span>
        <span className="font-mono text-lime-300">{streak?.toString() ?? "—"}</span>
      </div>
      <button
        type="button"
        disabled={!canSubmit}
        className="w-full rounded-lg bg-lime-400/15 py-2.5 text-sm font-semibold text-lime-100 ring-1 ring-lime-400/40 hover:bg-lime-400/25 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => void onCheckIn()}
      >
        {!isConnected
          ? "Connect wallet to check in"
          : !onBase
            ? "Switch to Base first"
            : busy
              ? "Confirm in wallet…"
              : "Check in on-chain"}
      </button>
    </section>
  );
}
