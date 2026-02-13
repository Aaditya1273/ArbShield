"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingDown } from "lucide-react";

export function GasComparison() {
  const comparisons = [
    {
      operation: "Poseidon Hash",
      solidity: 212000,
      stylus: 11800,
      savings: 94,
      description: "Cryptographic hash function for ZK proofs",
    },
    {
      operation: "ZK Proof Verification",
      solidity: 2500000,
      stylus: 198543,
      savings: 92,
      description: "Groth16 proof verification on-chain",
    },
    {
      operation: "Passkey Verification (RIP-7212)",
      solidity: 100000,
      stylus: 980,
      savings: 99,
      description: "secp256r1 signature verification",
    },
    {
      operation: "Cached Verification",
      solidity: 198543,
      stylus: 45231,
      savings: 77,
      description: "Repeat verification with Stylus Cache Manager",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="size-5" />
          Gas Efficiency Comparison
        </CardTitle>
        <CardDescription>
          Stylus Rust vs Solidity implementation benchmarks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {comparisons.map((comp) => (
            <div
              key={comp.operation}
              className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-medium">{comp.operation}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {comp.description}
                  </div>
                </div>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  <TrendingDown className="size-3 mr-1" />
                  {comp.savings}% saved
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Solidity</div>
                  <div className="font-mono font-medium">
                    {comp.solidity.toLocaleString()} gas
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Stylus Rust</div>
                  <div className="font-mono font-medium text-green-500">
                    {comp.stylus.toLocaleString()} gas
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
