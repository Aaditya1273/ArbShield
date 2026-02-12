"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function GasBenchmarks() {
  const benchmarks = [
    {
      operation: "Poseidon Hash (Stylus)",
      gas: 11800,
      comparison: "vs 212k (Solidity)",
      savings: 94,
    },
    {
      operation: "ZK Proof Verification (Stylus)",
      gas: 198543,
      comparison: "vs 2.5M (Solidity)",
      savings: 92,
    },
    {
      operation: "Passkey Verify (RIP-7212)",
      gas: 980,
      comparison: "vs 100k (traditional)",
      savings: 99,
    },
    {
      operation: "Cached Verification (Stylus Cache)",
      gas: 45231,
      comparison: "vs 198k (non-cached)",
      savings: 77,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gas Efficiency Benchmarks</CardTitle>
        <CardDescription>
          Stylus Rust vs Solidity implementation comparison
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {benchmarks.map((benchmark) => (
            <div key={benchmark.operation} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{benchmark.operation}</span>
                <span className="text-muted-foreground">{benchmark.comparison}</span>
              </div>
              <div className="flex items-center gap-4">
                <Progress value={100 - benchmark.savings} className="flex-1" />
                <div className="text-right min-w-[100px]">
                  <div className="text-sm font-bold text-green-500">
                    {benchmark.savings}% saved
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {benchmark.gas.toLocaleString()} gas
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
