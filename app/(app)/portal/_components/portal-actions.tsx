"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDownToLine, ArrowUpFromLine, Coins, ExternalLink } from "lucide-react";
import { useIsCompliant } from "@/lib/hooks/useComplianceData";
import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { parseUnits } from "viem";
import { toast } from "sonner";

const MOCK_BUIDL_ABI = [
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export function PortalActions() {
  const { address } = useAccount();
  const { isCompliant: hasKYC } = useIsCompliant("kyc_verified");
  const { isCompliant: isAccredited } = useIsCompliant("accredited_investor");
  const [mintAmount, setMintAmount] = useState("");
  const [redeemAmount, setRedeemAmount] = useState("");

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const canAccess = hasKYC && isAccredited;

  const handleMint = async () => {
    if (!mintAmount || Number(mintAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      writeContract({
        address: CONTRACTS.MOCK_BUIDL,
        abi: MOCK_BUIDL_ABI,
        functionName: 'mint',
        args: [parseUnits(mintAmount, 6)],
      });
      toast.success("Minting BUIDL tokens...");
      setMintAmount("");
    } catch (error) {
      console.error("Mint failed:", error);
      toast.error("Failed to mint tokens");
    }
  };

  const handleRedeem = async () => {
    if (!redeemAmount || Number(redeemAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      writeContract({
        address: CONTRACTS.MOCK_BUIDL,
        abi: MOCK_BUIDL_ABI,
        functionName: 'burn',
        args: [parseUnits(redeemAmount, 6)],
      });
      toast.success("Redeeming BUIDL tokens...");
      setRedeemAmount("");
    } catch (error) {
      console.error("Redeem failed:", error);
      toast.error("Failed to redeem tokens");
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Mint BUIDL */}
      <Card className="transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownToLine className="size-5 transition-all duration-300 group-hover:translate-y-1" />
            Mint BUIDL
          </CardTitle>
          <CardDescription>
            Purchase tokenized US Treasury tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mint-amount">Amount (USD)</Label>
            <Input
              id="mint-amount"
              type="number"
              placeholder="1000"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              disabled={!canAccess}
              className="transition-all duration-300 focus:scale-[1.02]"
            />
          </div>
          <Button
            className="w-full transition-all duration-300 hover:scale-105"
            onClick={handleMint}
            disabled={!canAccess || isPending || isConfirming}
          >
            {isPending || isConfirming ? (
              "Processing..."
            ) : (
              <>
                <Coins className="size-4 mr-2" />
                Mint BUIDL
              </>
            )}
          </Button>
          {!canAccess && (
            <p className="text-xs text-muted-foreground text-center">
              Complete verification requirements to mint
            </p>
          )}
        </CardContent>
      </Card>

      {/* Redeem BUIDL */}
      <Card className="transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpFromLine className="size-5 transition-all duration-300 group-hover:-translate-y-1" />
            Redeem BUIDL
          </CardTitle>
          <CardDescription>
            Redeem tokens for USD (T+1 settlement)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="redeem-amount">Amount (BUIDL)</Label>
            <Input
              id="redeem-amount"
              type="number"
              placeholder="1000"
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(e.target.value)}
              disabled={!canAccess}
              className="transition-all duration-300 focus:scale-[1.02]"
            />
          </div>
          <Button
            className="w-full transition-all duration-300 hover:scale-105"
            variant="outline"
            onClick={handleRedeem}
            disabled={!canAccess || isPending || isConfirming}
          >
            {isPending || isConfirming ? (
              "Processing..."
            ) : (
              <>
                <ArrowUpFromLine className="size-4 mr-2" />
                Redeem BUIDL
              </>
            )}
          </Button>
          {!canAccess && (
            <p className="text-xs text-muted-foreground text-center">
              Complete verification requirements to redeem
            </p>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="md:col-span-2 transition-all duration-300 hover:shadow-lg hover:border-primary/30">
        <CardHeader>
          <CardTitle>About BUIDL</CardTitle>
          <CardDescription>
            BlackRock USD Institutional Digital Liquidity Fund
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            BUIDL is a tokenized money market fund that provides qualified investors with access to US Treasury yields on-chain. 
            This is a demo implementation on Arbitrum Sepolia testnet.
          </p>
          <div className="flex items-center gap-4">
            <a
              href={`https://sepolia.arbiscan.io/address/${CONTRACTS.MOCK_BUIDL}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1 transition-all duration-300 hover:gap-2"
            >
              View Contract
              <ExternalLink className="size-3" />
            </a>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              Network: Arbitrum Sepolia
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
