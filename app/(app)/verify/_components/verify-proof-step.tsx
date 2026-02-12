"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, ExternalLink, Info, Loader2, Zap } from "lucide-react";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";

export function VerifyProofStep() {
  const { prevStep, reset } = useOnboardingStore();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  const [gasUsed, setGasUsed] = useState<number>(0);

  const handleVerifyProof = async () => {
    setIsVerifying(true);
    
    // Simulate on-chain verification
    await new Promise((resolve) => setTimeout(resolve, 4000));
    
    // Mock transaction hash
    const mockTxHash = `0x${Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}`;
    
    setTxHash(mockTxHash);
    setGasUsed(198543); // ~200k gas (Stylus efficiency)
    setVerificationComplete(true);
    setIsVerifying(false);
  };

  const handleViewDashboard = () => {
    reset();
    window.location.href = "/compliance";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="size-5 text-primary" />
          Verify Proof On-Chain
        </CardTitle>
        <CardDescription>
          Submit your proof to the Stylus Rust verifier on Arbitrum Sepolia
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="size-4" />
          <AlertDescription>
            The Stylus Rust verifier uses arkworks and Poseidon hashing for efficient ZK proof verification.
            Expected gas cost: ~200k gas (10x cheaper than Solidity implementation).
          </AlertDescription>
        </Alert>

        {verificationComplete ? (
          <div className="space-y-4">
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="size-4 text-green-500" />
              <AlertDescription className="text-green-500">
                Proof verified successfully on Arbitrum Sepolia!
              </AlertDescription>
            </Alert>

            <div className="grid gap-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Transaction Hash</span>
                  <a
                    href={`https://sepolia.arbiscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    View on Arbiscan
                    <ExternalLink className="size-3" />
                  </a>
                </div>
                <div className="text-xs font-mono text-muted-foreground break-all">
                  {txHash}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium mb-1">Gas Used</div>
                  <div className="text-2xl font-bold text-primary">
                    {gasUsed.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    ~10x cheaper than Solidity
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="text-sm font-medium mb-1">Verification Time</div>
                  <div className="text-2xl font-bold text-primary">
                    3.2s
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Stylus WASM execution
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="text-sm font-medium mb-2">Gas Comparison</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Solidity Verifier:</span>
                    <span className="font-mono">~2,500,000 gas</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Stylus Rust Verifier:</span>
                    <span className="font-mono text-green-500">~{gasUsed.toLocaleString()} gas</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium pt-2 border-t">
                    <span>Savings:</span>
                    <span className="text-green-500">92% reduction</span>
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={handleViewDashboard} className="w-full" size="lg">
              View Compliance Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="text-sm font-medium">Verification Details</div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>• Verifier: Stylus Rust Contract</div>
                <div>• Network: Arbitrum Sepolia</div>
                <div>• Expected Gas: ~200k</div>
                <div>• Proof Type: Groth16 (arkworks)</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={prevStep} variant="outline" className="flex-1">
                Back
              </Button>
              
              <Button
                onClick={handleVerifyProof}
                disabled={isVerifying}
                className="flex-1"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Verifying On-Chain...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 size-4" />
                    Verify Proof
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
