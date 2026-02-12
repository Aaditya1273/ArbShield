"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Fingerprint, Info, Loader2 } from "lucide-react";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { useAccount } from "wagmi";
import { WalletConnect } from "@/components/wallet-connect";

export function PasskeyAuthStep() {
  const { nextStep } = useOnboardingStore();
  const { address, isConnected } = useAccount();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const handlePasskeyAuth = async () => {
    setIsAuthenticating(true);
    
    // Simulate passkey authentication (RIP-7212)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setAuthSuccess(true);
    setIsAuthenticating(false);
    
    // Auto-proceed after success
    setTimeout(() => {
      nextStep();
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="size-5 text-primary" />
          Biometric Authentication
        </CardTitle>
        <CardDescription>
          Authenticate using FaceID, TouchID, or Windows Hello via RIP-7212 precompile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="size-4" />
          <AlertDescription>
            ArbShield uses RIP-7212 secp256r1 precompile for biometric passkey authentication.
            This provides 99% gas reduction compared to traditional signature verification.
            <div className="mt-2 space-y-1">
              <div className="text-xs">
                • <span className="font-mono">Gas Cost:</span> ~1k gas (vs 100k+ traditional)
              </div>
              <div className="text-xs">
                • <span className="font-mono">Security:</span> Hardware-backed biometric keys
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {!isConnected ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <p className="text-sm text-muted-foreground">
              Connect your wallet to continue
            </p>
            <WalletConnect />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="text-sm font-medium">Connected Wallet</div>
              <div className="text-xs font-mono text-muted-foreground">
                {address}
              </div>
            </div>

            {authSuccess ? (
              <Alert className="border-green-500/50 bg-green-500/10">
                <Fingerprint className="size-4 text-green-500" />
                <AlertDescription className="text-green-500">
                  Biometric authentication successful! Proceeding to proof generation...
                </AlertDescription>
              </Alert>
            ) : (
              <Button
                onClick={handlePasskeyAuth}
                disabled={isAuthenticating}
                className="w-full"
                size="lg"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Fingerprint className="mr-2 size-4" />
                    Authenticate with Passkey
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
