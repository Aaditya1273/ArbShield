"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Fingerprint, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { hasPasskey, registerPasskey, isPlatformAuthenticatorAvailable } from "@/lib/webauthn";
import { toast } from "sonner";

export function PasskeyManager() {
  const { address } = useAccount();
  const [passkeyRegistered, setPasskeyRegistered] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      const supported = await isPlatformAuthenticatorAvailable();
      setIsSupported(supported);
    };
    checkSupport();
  }, []);

  useEffect(() => {
    if (address) {
      setPasskeyRegistered(hasPasskey(address));
    }
  }, [address]);

  const handleRegister = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsRegistering(true);
      await registerPasskey(address);
      setPasskeyRegistered(true);
      toast.success("Passkey registered successfully!");
    } catch (error) {
      console.error("Passkey registration failed:", error);
      toast.error("Failed to register passkey");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRemove = () => {
    if (!address) return;
    localStorage.removeItem(`passkey_${address}`);
    setPasskeyRegistered(false);
    toast.success("Passkey removed");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="size-5" />
          Biometric Authentication (RIP-7212)
        </CardTitle>
        <CardDescription>
          Manage your passkeys for secure, gas-efficient authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Support Status */}
        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            {isSupported ? (
              <CheckCircle2 className="size-5 text-green-500" />
            ) : (
              <AlertCircle className="size-5 text-yellow-500" />
            )}
            <div>
              <div className="font-medium">Platform Authenticator</div>
              <div className="text-sm text-muted-foreground">
                {isSupported
                  ? "FaceID/TouchID/Windows Hello available"
                  : "Biometric authentication not available"}
              </div>
            </div>
          </div>
          <Badge variant={isSupported ? "outline" : "secondary"}>
            {isSupported ? "Supported" : "Not Available"}
          </Badge>
        </div>

        {/* Passkey Status */}
        {address && (
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <Fingerprint className="size-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Your Passkey</div>
                <div className="text-sm text-muted-foreground">
                  {passkeyRegistered
                    ? "Registered and ready to use"
                    : "Not registered yet"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {passkeyRegistered ? (
                <>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    Active
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRemove}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={handleRegister}
                  disabled={!isSupported || isRegistering}
                >
                  <Plus className="size-4 mr-2" />
                  {isRegistering ? "Registering..." : "Register"}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="p-4 rounded-lg bg-muted/50 border border-dashed">
          <div className="text-sm space-y-2">
            <p className="font-medium">About RIP-7212 Passkeys</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>99% gas reduction vs traditional signatures</li>
              <li>Native secp256r1 verification on Arbitrum</li>
              <li>Biometric authentication (FaceID/TouchID)</li>
              <li>No seed phrases or private keys to manage</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
