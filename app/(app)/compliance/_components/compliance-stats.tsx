"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Zap, Shield, TrendingUp } from "lucide-react";

export function ComplianceStats() {
  const stats = [
    {
      title: "Total Verifications",
      value: "12",
      change: "+3 this week",
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
      value: "100%",
      change: "All attributes verified",
      icon: Shield,
      color: "text-blue-500",
    },
    {
      title: "Avg Verification Time",
      value: "3.2s",
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
