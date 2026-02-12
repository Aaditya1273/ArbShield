"use client";

import { formatUnits } from "viem";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CONTRACTS, TOKENS } from "@/lib/contracts";

function TokenBalance({
  token,
  label,
}: {
  token: keyof typeof TOKENS;
  label: string;
}) {
  const { address } = useAccount();
  const tokenConfig = TOKENS[token];

  const { data: balance, isLoading } = useBalance({
    address,
    token: tokenConfig.address,
  });

  if (isLoading) {
    return <Skeleton className="size-16" />;
  }

  return (
    <div className="text-center">
      <div className="text-2xl font-bold">
        {balance
          ? parseFloat(
              formatUnits(balance.value, tokenConfig.decimals),
            ).toFixed(2)
          : "0.00"}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function NativeSTTBalance() {
  const { address } = useAccount();
  const { data: balance, isLoading } = useBalance({
    address,
  });

  if (isLoading) {
    return <Skeleton className="size-16" />;
  }

  return (
    <div className="text-center">
      <div className="text-2xl font-bold">
        {balance
          ? parseFloat(formatUnits(balance.value, 18)).toFixed(2)
          : "0.00"}
      </div>
      <div className="text-sm text-muted-foreground">Native STT</div>
    </div>
  );
}

export function DepositStats() {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Wallet Balances
            <Badge variant="secondary">Connect Wallet</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Connect your wallet to view token balances
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Wallet Balances
          <Badge variant="default">Connected</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-6">
          <NativeSTTBalance />
          <TokenBalance token="WSTT" label="wSTT Balance" />
          <TokenBalance token="USDC" label="USDC Balance" />
        </div>
      </CardContent>
    </Card>
  );
}
