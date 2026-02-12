"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import { Skeleton } from "@/components/ui/skeleton";
import { LIQUIDITY_VAULT_ABI } from "@/lib/abis";
import { CONTRACTS } from "@/lib/contracts";

export function DashboardRouteGuard() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [automationEnabled, setAutomationEnabled] = useState<boolean | null>(null);
  const [isCheckingAutomation, setIsCheckingAutomation] = useState(true);

  const { data: position, isLoading } = useReadContract({
    address: CONTRACTS.LiquidityVault,
    abi: LIQUIDITY_VAULT_ABI,
    functionName: "getPosition",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  });

  // Check automation status (allows staying on dashboard for demo even without positions)
  useEffect(() => {
    let mounted = true;
    async function checkAutomation() {
      try {
        const res = await fetch("/api/agents/automation/status");
        const j = await res.json();
        if (mounted) setAutomationEnabled(!!j?.enabled);
      } catch {
        if (mounted) setAutomationEnabled(false);
      } finally {
        if (mounted) setIsCheckingAutomation(false);
      }
    }
    checkAutomation();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isConnected || !address) return; // wait for a real address
    if (isLoading || isCheckingAutomation) return;

    // If automation is enabled, allow user to remain on dashboard even if no positions yet
    if (automationEnabled) return;

    if (position) {
      const lpTokens = position[2];
      const active = position[9];
      const hasDeposit = lpTokens > BigInt(0) && active === true;
      if (!hasDeposit) router.replace("/deposit");
    } else {
      router.replace("/deposit");
    }
  }, [isConnected, address, isLoading, isCheckingAutomation, automationEnabled, position, router]);

  // Minimal placeholder to avoid content flash while checking
  if (!isConnected || !address || isLoading || isCheckingAutomation) {
    return (
      <div className="flex items-center justify-center py-8">
        <Skeleton className="h-6 w-40" />
      </div>
    );
  }

  return null;
}
