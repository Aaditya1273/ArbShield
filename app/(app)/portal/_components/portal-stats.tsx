"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Percent, Users } from "lucide-react";
import { useReadContract, useAccount } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { formatUnits } from "viem";

const MOCK_BUIDL_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export function PortalStats() {
  const { address } = useAccount();

  const { data: balance } = useReadContract({
    address: CONTRACTS.MOCK_BUIDL,
    abi: MOCK_BUIDL_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: totalSupply } = useReadContract({
    address: CONTRACTS.MOCK_BUIDL,
    abi: MOCK_BUIDL_ABI,
    functionName: 'totalSupply',
  });

  const userBalance = balance ? Number(formatUnits(balance as bigint, 6)) : 0;
  const supply = totalSupply ? Number(formatUnits(totalSupply as bigint, 6)) : 0;

  const stats = [
    {
      title: "Your BUIDL Balance",
      value: `$${userBalance.toLocaleString()}`,
      change: "Tokenized US Treasuries",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Current APY",
      value: "5.2%",
      change: "Institutional yield",
      icon: TrendingUp,
      color: "text-blue-500",
    },
    {
      title: "Total Supply",
      value: `$${supply.toLocaleString()}`,
      change: "BUIDL tokens",
      icon: Percent,
      color: "text-purple-500",
    },
    {
      title: "Verified Users",
      value: "1,247",
      change: "Compliant investors",
      icon: Users,
      color: "text-yellow-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card 
          key={stat.title}
          className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50 cursor-pointer group"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`size-4 ${stat.color} transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold transition-all duration-300 group-hover:text-primary">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
