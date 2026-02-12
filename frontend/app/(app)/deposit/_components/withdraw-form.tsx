"use client";

import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { LIQUIDITY_VAULT_ABI } from "@/lib/abis";
import { CONTRACTS } from "@/lib/contracts";

type WithdrawFormProps = {};

export function WithdrawForm({}: WithdrawFormProps) {
  const { address, isConnected } = useAccount();
  const [lpTokensAmount, setLpTokensAmount] = useState("");

  // Contract interactions
  const { writeContract: writeVault, data: withdrawHash } = useWriteContract();

  // Transaction receipt
  const { isLoading: isWithdrawing, isSuccess: isWithdrawSuccess } =
    useWaitForTransactionReceipt({
      hash: withdrawHash,
    });

  // Get user's position
  const { data: position, isLoading: isLoadingPosition } = useReadContract({
    address: CONTRACTS.LiquidityVault,
    abi: LIQUIDITY_VAULT_ABI,
    functionName: "getPosition",
    args: address ? [address] : undefined,
  });

  const handleWithdraw = async () => {
    if (!address || !lpTokensAmount) return;

    try {
      const lpTokensWei = parseUnits(lpTokensAmount, 18); // LP tokens are 18 decimals

      await writeVault({
        address: CONTRACTS.LiquidityVault,
        abi: LIQUIDITY_VAULT_ABI,
        functionName: "withdrawPair",
        args: [lpTokensWei],
      });
      toast.success("Withdraw initiated");
    } catch (error) {
      toast.error("Failed to withdraw");
      console.error("Withdraw error:", error);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Withdraw Liquidity</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="size-4" />
            <AlertDescription>
              Please connect your wallet to withdraw liquidity
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingPosition) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Withdraw Liquidity</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="size-32" />
        </CardContent>
      </Card>
    );
  }

  // Check if user has an active position
  const hasActivePosition = position && position[9]; // active field
  const lpTokensBalance = position ? formatUnits(position[2], 18) : "0"; // lpTokens field

  if (!hasActivePosition) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Withdraw Liquidity</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="size-4" />
            <AlertDescription>
              No active liquidity position found. Deposit first to create a
              position.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdraw Liquidity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Position Info */}
        <div className="space-y-2">
          <Label>Current Position</Label>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>LP Tokens: {parseFloat(lpTokensBalance).toFixed(4)}</div>
            <div>wSTT: {position ? formatUnits(position[0], 18) : "0"}</div>
            <div>USDC: {position ? formatUnits(position[1], 6) : "0"}</div>
          </div>
        </div>

        {/* Withdraw Amount */}
        <div className="space-y-2">
          <Label htmlFor="lp-tokens-amount">LP Tokens to Withdraw</Label>
          <div className="flex gap-2">
            <Input
              id="lp-tokens-amount"
              type="number"
              placeholder="0.0"
              value={lpTokensAmount}
              onChange={(e) => setLpTokensAmount(e.target.value)}
              disabled={isWithdrawing}
              max={lpTokensBalance}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLpTokensAmount(lpTokensBalance)}
              disabled={isWithdrawing}
            >
              Max
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Available: {parseFloat(lpTokensBalance).toFixed(4)} LP tokens
          </div>
        </div>

        {/* Withdraw Button */}
        <Button
          onClick={handleWithdraw}
          disabled={
            isWithdrawing ||
            !lpTokensAmount ||
            parseFloat(lpTokensAmount) > parseFloat(lpTokensBalance)
          }
          className="w-full"
        >
          {isWithdrawing ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Withdrawing...
            </>
          ) : isWithdrawSuccess ? (
            <>
              <CheckCircle className="size-4 mr-2" />
              Withdraw Complete!
            </>
          ) : (
            "Withdraw Liquidity"
          )}
        </Button>

        {isWithdrawSuccess && (
          <Alert>
            <CheckCircle className="size-4" />
            <AlertDescription>
              Withdraw successful! Your tokens have been returned to your
              wallet.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
