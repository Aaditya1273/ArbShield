"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fingerprint, Plus, Trash2, CheckCircle2, AlertCircle, Smartphone } from "lucide-react";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { registerPasskey, isPlatformAuthenticatorAvailable } from "@/lib/webauthn";
import { useUserPasskeys, useRegisterPasskey, useRevokePasskey } from "@/lib/hooks/usePasskeyRegistry";
import { toast } from "sonner";

export function PasskeyManager() {
  const { address } = useAccount();
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [showAddDevice, setShowAddDevice] = useState(false);

  const { passkeys, isLoading, refetch } = useUserPasskeys();
  const { registerPasskey: registerOnChain, isPending: isRegisterPending } = useRegisterPasskey();
  const { revokePasskey, isPending: isRevokePending } = useRevokePasskey();

  useEffect(() => {
    const checkSupport = async () => {
      const supported = await isPlatformAuthenticatorAvailable();
      setIsSupported(supported);
    };
    checkSupport();
  }, []);

  const handleRegister = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!deviceName.trim()) {
      toast.error("Please enter a device name");
      return;
    }

    try {
      setIsRegistering(true);
      
      // Register passkey with WebAuthn
      const credential = await registerPasskey(address);
      
      // Register on-chain
      await registerOnChain(
        credential.id,
        credential.publicKey,
        deviceName
      );

      toast.success("Passkey registered on-chain!");
      setDeviceName("");
      setShowAddDevice(false);
      refetch();
    } catch (error) {
      console.error("Passkey registration failed:", error);
      toast.error("Failed to register passkey");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRevoke = async (credentialId: string, deviceName: string) => {
    if (!confirm(`Are you sure you want to revoke "${deviceName}"?`)) {
      return;
    }

    try {
      await revokePasskey(credentialId);
      toast.success("Passkey revoked successfully");
      refetch();
    } catch (error) {
      console.error("Revoke failed:", error);
      toast.error("Failed to revoke passkey");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="size-5" />
          Biometric Authentication (RIP-7212)
        </CardTitle>
        <CardDescription>
          Manage your passkeys across multiple devices - all stored on-chain
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

        {/* Registered Devices */}
        {address && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Your Devices ({passkeys.length})</h3>
              {isSupported && !showAddDevice && (
                <Button
                  size="sm"
                  onClick={() => setShowAddDevice(true)}
                  disabled={isLoading}
                >
                  <Plus className="size-4 mr-2" />
                  Add Device
                </Button>
              )}
            </div>

            {/* Add Device Form */}
            {showAddDevice && (
              <div className="p-4 rounded-lg border border-primary/50 bg-primary/5 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="device-name">Device Name</Label>
                  <Input
                    id="device-name"
                    placeholder="e.g., iPhone 15 Pro, MacBook Pro"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleRegister}
                    disabled={isRegistering || isRegisterPending}
                    className="flex-1"
                  >
                    {isRegistering || isRegisterPending ? "Registering..." : "Register Passkey"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddDevice(false);
                      setDeviceName("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Device List */}
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading devices...
              </div>
            ) : passkeys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Smartphone className="size-12 mx-auto mb-2 opacity-50" />
                <p>No devices registered yet</p>
                <p className="text-sm mt-1">Add your first device to get started</p>
              </div>
            ) : (
              passkeys.map((device) => (
                <div
                  key={device.credentialId}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="size-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{device.deviceName}</div>
                      <div className="text-sm text-muted-foreground">
                        Last used: {new Date(device.lastUsed * 1000).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      Active
                    </Badge>
                    {passkeys.length > 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRevoke(device.credentialId, device.deviceName)}
                        disabled={isRevokePending}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Info */}
        <div className="p-4 rounded-lg bg-muted/50 border border-dashed">
          <div className="text-sm space-y-2">
            <p className="font-medium">World-Class Passkey Management</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>All passkeys stored on-chain (fully decentralized)</li>
              <li>Multi-device support (use iPhone, laptop, tablet)</li>
              <li>99% gas reduction vs traditional signatures</li>
              <li>Lost device? Just revoke and add a new one!</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
