"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Wallet, Shield, CheckCircle2 } from "lucide-react";
import { useAccount } from "wagmi";
import { useComplianceData } from "@/lib/hooks/useComplianceData";

export function UserProfile() {
  const { address, isConnected } = useAccount();
  const { verifiedAttributes } = useComplianceData();

  if (!isConnected || !address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            User Profile
          </CardTitle>
          <CardDescription>
            Connect your wallet to view your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Please connect your wallet
          </div>
        </CardContent>
      </Card>
    );
  }

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="size-5" />
          User Profile
        </CardTitle>
        <CardDescription>
          Your identity and compliance status on ArbShield
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <Avatar className="size-20">
            <AvatarFallback className="text-2xl">
              {address.slice(2, 4).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Wallet Address</span>
              </div>
              <code className="text-sm bg-muted px-3 py-1 rounded">{address}</code>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Compliance Status</span>
              </div>
              <div className="flex items-center gap-2">
                {verifiedAttributes.length > 0 ? (
                  <>
                    <CheckCircle2 className="size-4 text-green-500" />
                    <span className="text-sm font-medium">
                      {verifiedAttributes.length} attribute{verifiedAttributes.length !== 1 ? 's' : ''} verified
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">No verifications yet</span>
                )}
              </div>
            </div>

            {/* Verified Attributes Badges */}
            {verifiedAttributes.length > 0 && (
              <div>
                <div className="text-sm text-muted-foreground mb-2">Verified Attributes</div>
                <div className="flex flex-wrap gap-2">
                  {verifiedAttributes.map((attr) => (
                    <Badge
                      key={attr.attributeType}
                      variant="outline"
                      className="bg-green-500/10 text-green-500 border-green-500/20"
                    >
                      {attr.attributeType.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
