"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Zap, TrendingUp } from "lucide-react";

export function NetworkStats() {
  const stats = [
    {
      title: "Total Verifications",
      value: "1,247",
      change: "+18% this week",
      icon: Activity,
      color: "text-blue-500",
    },
    {
      title: "Active Users",
      value: "342",
      change: "+12% this week",
      icon: Users,
      color: "text-green-500",
    },
    {
      title: "Gas Saved",
      value: "2.3M",
      change: "vs Solidity implementation",
      icon: Zap,
      color: "text-yellow-500",
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
