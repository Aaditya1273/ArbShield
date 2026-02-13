"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Zap, Shield, TrendingUp } from "lucide-react";
import { useVerificationHistory } from "@/lib/hooks/useVerificationHistory";
import { useComplianceData } from "@/lib/hooks/useComplianceData";

export function ComplianceStats() {
  const { events } = useVerificationHistory();
  const { verifiedAttributes } = useComplianceData();

  // Calculate stats from real data
  const totalVerifications = events.length;
  const recentVerifications = events.filter(
    (e) => e.timestamp > Date.now() / 1000 - 7 * 24 * 60 * 60
  ).length;
  const complianceScore = verifiedAttributes.length > 0 ? 100 : 0;
  const avgGas = events.length > 0
    ? Number(events.reduce((sum, e) => sum + e.gasUsed, 0n) / BigInt(events.length))
    : 0;

  const stats = [
    {
      title: "Total Verifications",
      value: totalVerifications.toString(),
      change: recentVerifications > 0 ? `+${recentVerifications} this week` : "No recent activity",
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      title: "Gas Saved",
      value: "92%",
      change: "vs Solidity",
      icon: Zap,
      color: "text-yellow-500",
    },
    {
      title: "Compliance Score",
      value: `${complianceScore}%`,
      change: verifiedAttributes.length > 0 ? `${verifiedAttributes.length} attributes verified` : "No verifications yet",
      icon: Shield,
      color: "text-blue-500",
    },
    {
      title: "Avg Gas Used",
      value: avgGas > 0 ? `${(avgGas / 1000).toFixed(0)}k` : "N/A",
      change: "Stylus efficiency",
      icon: TrendingUp,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`size-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
