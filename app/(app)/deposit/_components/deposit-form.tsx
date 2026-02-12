"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import {
  LIQUIDITY_VAULT_ABI,
  MOCK_USDC_ABI,
  WRAPPED_STT_ABI,
} from "@/lib/abis";
import { CONTRACTS, TOKENS } from "@/lib/contracts";

type DepositFormProps = {};

export function DepositForm({}: DepositFormProps) {
  const { address, isConnected } = useAccount();
  const [wsttAmount, setWsttAmount] = useState("");
  const [usdcAmount, setUsdcAmount] = useState("");

  // Contract interactions
  const { writeContract: writeWrappedSTT, data: wrapHash } = useWriteContract();
  const { writeContract: writeMockUSDC, data: mintHash } = useWriteContract();
  const { writeContract: writeVault, data: depositHash } = useWriteContract();
  const { writeContract: writeApproveWSTT, data: approveWSTTHash } =
    useWriteContract();
  const { writeContract: writeApproveUSDC, data: approveUSDCHash } =
    useWriteContract();

  // Transaction receipts
  const { isLoading: isWrapping, isSuccess: isWrapSuccess } =
    useWaitForTransactionReceipt({
      hash: wrapHash,
    });
  const { isLoading: isMinting, isSuccess: isMintSuccess } =
    useWaitForTransactionReceipt({
      hash: mintHash,
    });
  const { isLoading: isApprovingWSTT, isSuccess: isApproveWSTTSuccess } =
    useWaitForTransactionReceipt({
      hash: approveWSTTHash,
    });
  const { isLoading: isApprovingUSDC, isSuccess: isApproveUSDCSuccess } =
    useWaitForTransactionReceipt({
      hash: approveUSDCHash,
    });
  const { isLoading: isDepositing, isSuccess: isDepositSuccess } =
    useWaitForTransactionReceipt({
      hash: depositHash,
    });

  // Check if user has enough STT for wrapping
  const { data: sttBalance } = useReadContract({
    address: CONTRACTS.WrappedSTT,
    abi: WRAPPED_STT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const handleWrapSTT = async () => {
    if (!address || !wsttAmount) return;

    try {
      const amount = parseUnits(wsttAmount, 18);
      await writeWrappedSTT({
        address: CONTRACTS.WrappedSTT,
        abi: WRAPPED_STT_ABI,
        functionName: "deposit",
        value: amount,
      });
      toast.success("STT wrapping initiated");
    } catch (error) {
      toast.error("Failed to wrap STT");
      console.error("Wrap STT error:", error);
    }
  };

  const handleMintUSDC = async () => {
    if (!address || !usdcAmount) return;

    try {
      const amount = parseUnits(usdcAmount, 6);
      await writeMockUSDC({
        address: CONTRACTS.MockUSDC,
        abi: MOCK_USDC_ABI,
        functionName: "mint",
        args: [address, amount],
      });
      toast.success("USDC minting initiated");
    } catch (error) {
      toast.error("Failed to mint USDC");
      console.error("Mint USDC error:", error);
    }
  };

  const handleApproveWSTT = async () => {
    if (!address || !wsttAmount) return;

    try {
      const amount = parseUnits(wsttAmount, 18);
      await writeApproveWSTT({
        address: CONTRACTS.WrappedSTT,
        abi: WRAPPED_STT_ABI,
        functionName: "approve",
        args: [CONTRACTS.LiquidityVault, amount],
      });
      toast.success("wSTT approval initiated");
    } catch (error) {
      toast.error("Failed to approve wSTT");
      console.error("Approve wSTT error:", error);
    }
  };

  const handleApproveUSDC = async () => {
    if (!address || !usdcAmount) return;

    try {
      const amount = parseUnits(usdcAmount, 6);
      await writeApproveUSDC({
        address: CONTRACTS.MockUSDC,
        abi: MOCK_USDC_ABI,
        functionName: "approve",
        args: [CONTRACTS.LiquidityVault, amount],
      });
      toast.success("USDC approval initiated");
    } catch (error) {
      toast.error("Failed to approve USDC");
      console.error("Approve USDC error:", error);
    }
  };

  const handleDeposit = async () => {
    if (!address || !wsttAmount || !usdcAmount) return;

    try {
      const wsttAmountWei = parseUnits(wsttAmount, 18);
      const usdcAmountWei = parseUnits(usdcAmount, 6);

      await writeVault({
        address: CONTRACTS.LiquidityVault,
        abi: LIQUIDITY_VAULT_ABI,
        functionName: "depositPair",
        args: [wsttAmountWei, usdcAmountWei],
      });
      toast.success("Deposit initiated");
    } catch (error) {
      toast.error("Failed to deposit");
      console.error("Deposit error:", error);
    }
  };

  // Poll latest adapter tx hash for link
  const { data: latestTx } = useQuery({
    queryKey: ["latest-adapter-tx"],
    queryFn: async () => {
      const res = await fetch("/api/agents/tx/latest");
      const json = await res.json();
      return json?.txHash as string | null;
    },
    refetchInterval: 5000,
  });

  // Toast when a new adapter tx is detected
  const lastTxRef = useRef<string | null>(null);
  useEffect(() => {
    if (latestTx && lastTxRef.current !== latestTx) {
      lastTxRef.current = latestTx;
      toast.success(
        `Agent executed: ${latestTx.slice(0, 10)}...${latestTx.slice(-8)}`,
        {
          description: "View on Shannon Explorer",
          action: {
            label: "Open",
            onClick: () =>
              window.open(
                `https://shannon-explorer.somnia.network/tx/${latestTx}`,
                "_blank",
              ),
          },
        },
      );
    }
  }, [latestTx]);

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deposit Liquidity</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="size-4" />
            <AlertDescription>
              Please connect your wallet to deposit liquidity
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Token Preparation */}
      <Card>
        <CardHeader>
          <CardTitle>Prepare Tokens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Wrap STT */}
          <div className="space-y-2">
            <Label htmlFor="wstt-amount">Wrap STT to wSTT</Label>
            <div className="flex gap-2">
              <Input
                id="wstt-amount"
                type="number"
                placeholder="0.0"
                value={wsttAmount}
                onChange={(e) => setWsttAmount(e.target.value)}
                disabled={isWrapping}
              />
              <Button
                onClick={handleWrapSTT}
                disabled={isWrapping || !wsttAmount}
                size="sm"
              >
                {isWrapping ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isWrapSuccess ? (
                  <CheckCircle className="size-4" />
                ) : (
                  "Wrap"
                )}
              </Button>
            </div>
          </div>

          {/* Mint USDC */}
          <div className="space-y-2">
            <Label htmlFor="usdc-amount">Mint Test USDC</Label>
            <div className="flex gap-2">
              <Input
                id="usdc-amount"
                type="number"
                placeholder="0.0"
                value={usdcAmount}
                onChange={(e) => setUsdcAmount(e.target.value)}
                disabled={isMinting}
              />
              <Button
                onClick={handleMintUSDC}
                disabled={isMinting || !usdcAmount}
                size="sm"
              >
                {isMinting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isMintSuccess ? (
                  <CheckCircle className="size-4" />
                ) : (
                  "Mint"
                )}
              </Button>
            </div>
          </div>

          {/* Approve Tokens */}
          <div className="space-y-2">
            <Label>Approve Tokens for Vault</Label>
            <div className="flex gap-2">
              <Button
                onClick={handleApproveWSTT}
                disabled={isApprovingWSTT || !wsttAmount || !isWrapSuccess}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                {isApprovingWSTT ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isApproveWSTTSuccess ? (
                  <CheckCircle className="size-4" />
                ) : (
                  "Approve wSTT"
                )}
              </Button>
              <Button
                onClick={handleApproveUSDC}
                disabled={isApprovingUSDC || !usdcAmount || !isMintSuccess}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                {isApprovingUSDC ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isApproveUSDCSuccess ? (
                  <CheckCircle className="size-4" />
                ) : (
                  "Approve USDC"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deposit to Vault */}
      <Card>
        <CardHeader>
          <CardTitle>Deposit to Vault</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Deposit Amounts</Label>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>wSTT: {wsttAmount || "0"}</div>
              <div>USDC: {usdcAmount || "0"}</div>
            </div>
          </div>

          <Button
            onClick={handleDeposit}
            disabled={
              isDepositing ||
              !wsttAmount ||
              !usdcAmount ||
              !isApproveWSTTSuccess ||
              !isApproveUSDCSuccess
            }
            className="w-full"
          >
            {isDepositing ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Depositing...
              </>
            ) : isDepositSuccess ? (
              <>
                <CheckCircle className="size-4 mr-2" />
                Deposit Complete!
              </>
            ) : (
              "Deposit Liquidity"
            )}
          </Button>

          {isDepositSuccess && (
            <Alert>
              <CheckCircle className="size-4" />
              <AlertDescription>
                Deposit successful! Your liquidity is now being managed by AI
                agents.
                {latestTx ? (
                  <div className="mt-2 text-xs">
                    Latest router tx:{" "}
                    <a
                      className="underline"
                      href={`https://shannon-explorer.somnia.network/tx/${latestTx}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {latestTx.slice(0, 10)}...{latestTx.slice(-8)}
                    </a>
                  </div>
                ) : null}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
