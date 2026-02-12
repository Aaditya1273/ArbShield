"use client";

import { Info, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LIQUIDITY_VAULT_ABI, MOCK_USDC_ABI, WRAPPED_STT_ABI } from "@/lib/abis";
import { CONTRACTS, TOKENS } from "@/lib/contracts";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";

export function DepositStep() {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>("");

  const {
    wsttAmount,
    usdcAmount,
    setWsttAmount,
    setUsdcAmount,
    setDepositCompleted,
    setCurrentStep,
  } = useOnboardingStore();

  // Get balances
  const { data: wsttBalance } = useBalance({
    address,
    token: TOKENS.WSTT.address,
  });

  const { data: usdcBalance } = useBalance({
    address,
    token: TOKENS.USDC.address,
  });

  // Check allowances - always enabled when connected to check existing approvals
  const { data: wsttAllowance, isLoading: isLoadingWSTTAllowance } = useReadContract({
    address: TOKENS.WSTT.address,
    abi: WRAPPED_STT_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.LiquidityVault] : undefined,
    query: { enabled: isConnected && !!address },
  });

  const { data: usdcAllowance, isLoading: isLoadingUSDCAllowance } = useReadContract({
    address: TOKENS.USDC.address,
    abi: MOCK_USDC_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.LiquidityVault] : undefined,
    query: { enabled: isConnected && !!address },
  });

  // Contract interactions
  const { writeContract: writeApproveWSTT, data: approveWSTTHash } =
    useWriteContract();
  const { writeContract: writeApproveUSDC, data: approveUSDCHash } =
    useWriteContract();
  const { writeContract: writeVault, data: depositHash } = useWriteContract();

  // Transaction receipts
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

  // Auto-advance to step 3 after successful deposit
  useEffect(() => {
    if (isDepositSuccess) {
      setDepositCompleted(true);
      toast.success("Deposit successful! Your liquidity is now being managed by AI agents.");
      // Auto-advance to step 3
      setTimeout(() => {
        setCurrentStep(3);
      }, 1500);
    }
  }, [isDepositSuccess, setDepositCompleted, setCurrentStep]);

  // Handle approval flow automatically
  useEffect(() => {
    if (isApproveWSTTSuccess && currentAction === "approving-wstt") {
      // Invalidate and refetch wSTT allowance to update the UI
      queryClient.invalidateQueries({
        queryKey: [
          "readContract",
          {
            address: TOKENS.WSTT.address,
            functionName: "allowance",
          },
        ],
      });

      setCurrentAction("approving-usdc");
      // Automatically proceed to USDC approval
      if (address && usdcAmount) {
        const usdcAmountWei = parseUnits(usdcAmount, TOKENS.USDC.decimals);
        writeApproveUSDC({
          address: TOKENS.USDC.address,
          abi: MOCK_USDC_ABI,
          functionName: "approve",
          args: [CONTRACTS.LiquidityVault, usdcAmountWei],
        });
        toast.success("wSTT approved. Please approve USDC in your wallet.");
      }
    }
  }, [isApproveWSTTSuccess, currentAction, address, usdcAmount, writeApproveUSDC, queryClient]);

  // After USDC approval, proceed to deposit
  useEffect(() => {
    if (isApproveUSDCSuccess && currentAction === "approving-usdc") {
      // Invalidate and refetch USDC allowance to update the UI
      queryClient.invalidateQueries({
        queryKey: [
          "readContract",
          {
            address: TOKENS.USDC.address,
            functionName: "allowance",
          },
        ],
      });

      setCurrentAction("depositing");
      // Automatically proceed to deposit
      if (address && wsttAmount && usdcAmount) {
        const wsttAmountWei = parseUnits(wsttAmount, TOKENS.WSTT.decimals);
        const usdcAmountWei = parseUnits(usdcAmount, TOKENS.USDC.decimals);
        writeVault({
          address: CONTRACTS.LiquidityVault,
          abi: LIQUIDITY_VAULT_ABI,
          functionName: "depositPair",
          args: [wsttAmountWei, usdcAmountWei],
        });
        toast.success("USDC approved. Please confirm deposit in your wallet.");
      }
    }
  }, [
    isApproveUSDCSuccess,
    currentAction,
    address,
    wsttAmount,
    usdcAmount,
    writeVault,
    queryClient,
  ]);

  // Reset processing state when deposit completes or fails
  useEffect(() => {
    if (isDepositSuccess || (depositHash && !isDepositing)) {
      setIsProcessing(false);
      setCurrentAction("");
    }
  }, [isDepositSuccess, depositHash, isDepositing]);

  const handleDeposit = async () => {
    if (!address || !wsttAmount || !usdcAmount) return;

    // Wait for allowance checks to complete
    if (isLoadingWSTTAllowance || isLoadingUSDCAllowance) {
      toast.info("Checking token approvals...");
      return;
    }

    try {
      setIsProcessing(true);
      const wsttAmountWei = parseUnits(wsttAmount, TOKENS.WSTT.decimals);
      const usdcAmountWei = parseUnits(usdcAmount, TOKENS.USDC.decimals);

      // Check if approvals are needed - compare with BigInt
      // If user previously approved, allowance will be >= required amount
      const needsWSTTApproval =
        wsttAllowance === undefined || wsttAllowance === null || wsttAllowance < wsttAmountWei;
      const needsUSDCApproval =
        usdcAllowance === undefined || usdcAllowance === null || usdcAllowance < usdcAmountWei;

      if (needsWSTTApproval) {
        setCurrentAction("approving-wstt");
        writeApproveWSTT({
          address: TOKENS.WSTT.address,
          abi: WRAPPED_STT_ABI,
          functionName: "approve",
          args: [CONTRACTS.LiquidityVault, wsttAmountWei],
        });
        toast.info("Please approve wSTT in your wallet.");
      } else if (needsUSDCApproval) {
        setCurrentAction("approving-usdc");
        writeApproveUSDC({
          address: TOKENS.USDC.address,
          abi: MOCK_USDC_ABI,
          functionName: "approve",
          args: [CONTRACTS.LiquidityVault, usdcAmountWei],
        });
        toast.info("Please approve USDC in your wallet.");
      } else {
        // Both already approved (sufficient allowance exists), proceed directly to deposit
        setCurrentAction("depositing");
        writeVault({
          address: CONTRACTS.LiquidityVault,
          abi: LIQUIDITY_VAULT_ABI,
          functionName: "depositPair",
          args: [wsttAmountWei, usdcAmountWei],
        });
        toast.success("Deposit initiated. Please confirm in your wallet.");
      }
    } catch (error) {
      toast.error("Failed to initiate deposit");
      console.error("Deposit error:", error);
      setIsProcessing(false);
      setCurrentAction("");
    }
  };

  const canDeposit =
    wsttAmount &&
    usdcAmount &&
    parseFloat(wsttAmount) > 0 &&
    parseFloat(usdcAmount) > 0 &&
    !isProcessing &&
    !isDepositing &&
    !isApprovingWSTT &&
    !isApprovingUSDC &&
    !isDepositSuccess &&
    !isLoadingWSTTAllowance &&
    !isLoadingUSDCAllowance;

  // Determine button text based on current action
  const getButtonText = () => {
    if (isApprovingWSTT || currentAction === "approving-wstt") {
      return "Approving wSTT...";
    }
    if (isApprovingUSDC || currentAction === "approving-usdc") {
      return "Approving USDC...";
    }
    if (isDepositing || currentAction === "depositing") {
      return "Depositing...";
    }
    return "Deposit Liquidity";
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deposit Liquidity</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Please connect your wallet to deposit liquidity
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposit Liquidity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="size-4" />
          <AlertDescription>
            Deposit your prepared tokens into the liquidity vault. Token approvals will be handled automatically when you click "Deposit Liquidity". The vault will manage your liquidity position and optimize it using AI agents.
            <br />
            <span className="text-xs text-muted-foreground">
              LiquidityVault {" "}
              <a
                className="underline"
                href={`https://shannon-explorer.somnia.network/address/${CONTRACTS.LiquidityVault}`}
                target="_blank"
                rel="noreferrer"
              >
                {CONTRACTS.LiquidityVault}
              </a>
            </span>
          </AlertDescription>
        </Alert>

        {/* Balance Display */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
          <div>
            <div className="text-sm text-muted-foreground">wSTT Balance</div>
            <div className="text-lg font-semibold">
              {wsttBalance
                ? parseFloat(formatUnits(wsttBalance.value, TOKENS.WSTT.decimals)).toFixed(4)
                : "0.0000"}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">USDC Balance</div>
            <div className="text-lg font-semibold">
              {usdcBalance
                ? parseFloat(formatUnits(usdcBalance.value, TOKENS.USDC.decimals)).toFixed(4)
                : "0.0000"}
            </div>
          </div>
        </div>

        {/* Deposit Amounts */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deposit-wstt">wSTT Amount</Label>
            <Input
              id="deposit-wstt"
              type="number"
              placeholder="0.0"
              value={wsttAmount}
              onChange={(e) => setWsttAmount(e.target.value)}
              disabled={isProcessing || isDepositing || isDepositSuccess}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deposit-usdc">USDC Amount</Label>
            <Input
              id="deposit-usdc"
              type="number"
              placeholder="0.0"
              value={usdcAmount}
              onChange={(e) => setUsdcAmount(e.target.value)}
              disabled={isProcessing || isDepositing || isDepositSuccess}
            />
          </div>
        </div>

        {/* Deposit Button */}
        <Button
          onClick={handleDeposit}
          disabled={!canDeposit}
          variant="gradient"
          size="lg"
          className="w-full px-8 py-3 rounded-md text-base font-medium"
        >
          {isProcessing || isDepositing || isApprovingWSTT || isApprovingUSDC ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              {getButtonText()}
            </>
          ) : (
            "Deposit Liquidity"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
