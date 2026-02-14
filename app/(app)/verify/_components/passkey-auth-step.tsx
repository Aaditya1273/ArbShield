"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Fingerprint, Info, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { useAccount } from "wagmi";
import { WalletConnect } from "@/components/wallet-connect";
import {
  registerPasskey,
  authenticatePasskey,
  hasPasskey,
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  verifyPasskeyWithRIP7212,
} from "@/lib/webauthn";

export function PasskeyAuthStep() {
  const { nextStep } = useOnboardingStore();
  const { address, isConnected } = useAccount();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [error, setError] = useState<string>("");
  const [webAuthnSupported, setWebAuthnSupported] = useState(false);
  const [platformAuthAvailable, setPlatformAuthAvailable] = useState(false);
  const [passkeyExists, setPasskeyExists] = useState(false);

  useEffect(() => {
    checkWebAuthnSupport();
  }, []);

  useEffect(() => {
    if (address) {
      setPasskeyExists(hasPasskey(address));
    }
  }, [address]);

  const checkWebAuthnSupport = async () => {
    const supported = isWebAuthnSupported();
    setWebAuthnSupported(supported);

    if (supported) {
      const available = await isPlatformAuthenticatorAvailable();
      setPlatformAuthAvailable(available);
    }
  };

  const handlePasskeyAuth = async () => {
    if (!address) return;

    setIsAuthenticating(true);
    setError("");

    try {
      let authResponse;

      if (passkeyExists) {
        // Authenticate with existing passkey
        authResponse = await authenticatePasskey(address);
      } else {
        // Register new passkey
        await registerPasskey(address);
        authResponse = await authenticatePasskey(address);
      }

      // Verify with RIP-7212 precompile
      const verified = await verifyPasskeyWithRIP7212(authResponse, address);

      if (verified) {
        setAuthSuccess(true);
        setPasskeyExists(true);

        // Auto-proceed after success
        setTimeout(() => {
          nextStep();
        }, 1500);
      } else {
        throw new Error("Passkey verification failed");
      }
    } catch (err: any) {
      console.error("Passkey authentication error:", err);
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
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
                • <span className="font-mono">Gas Cost:</span> ~980 gas (vs 100k+ traditional)
              </div>
              <div className="text-xs">
                • <span className="font-mono">Security:</span> Hardware-backed biometric keys
              </div>
              <div className="text-xs">
                • <span className="font-mono">Status:</span>{" "}
                {webAuthnSupported ? (
                  <span className="text-green-500">WebAuthn Supported ✓</span>
                ) : (
                  <span className="text-red-500">WebAuthn Not Supported ✗</span>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {!webAuthnSupported && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>
              Your browser doesn't support WebAuthn. Please use a modern browser like Chrome, Safari, or Edge.
            </AlertDescription>
          </Alert>
        )}

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
              {passkeyExists && (
                <div className="text-xs text-green-500 flex items-center gap-1 mt-2">
                  <CheckCircle2 className="size-3" />
                  Passkey registered
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {authSuccess ? (
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle2 className="size-4 text-green-500" />
                <AlertDescription className="text-green-500">
                  Biometric authentication successful! Proceeding to proof generation...
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                <Button
                  onClick={handlePasskeyAuth}
                  disabled={isAuthenticating || !webAuthnSupported}
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
                      {passkeyExists ? "Authenticate with Passkey" : "Register & Authenticate"}
                    </>
                  )}
                </Button>
                
                {/* Development Skip Button */}
                <Button
                  onClick={() => {
                    setAuthSuccess(true);
                    setTimeout(() => nextStep(), 500);
                  }}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  Skip (Development Only)
                </Button>
              </div>
            )}

            {platformAuthAvailable && !passkeyExists && (
              <p className="text-xs text-muted-foreground text-center">
                First time? We'll register your biometric passkey securely.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
