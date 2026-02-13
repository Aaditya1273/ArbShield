"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Shield, ArrowRight } from "lucide-react";
import { useIsCompliant } from "@/lib/hooks/useComplianceData";
import { useAccount } from "wagmi";
import Link from "next/link";

export function PortalAccess() {
  const { address } = useAccount();
  const { isCompliant: hasKYC } = useIsCompliant("kyc_verified");
  const { isCompliant: isAccredited } = useIsCompliant("accredited_investor");

  const requirements = [
    {
      name: "KYC Verification",
      required: true,
      met: hasKYC,
      attributeType: "kyc_verified",
    },
    {
      name: "Accredited Investor",
      required: true,
      met: isAccredited,
      attributeType: "accredited_investor",
    },
  ];

  const allRequirementsMet = requirements.every((req) => req.met);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5" />
              Portal Access Requirements
            </CardTitle>
            <CardDescription>
              Verify compliance attributes to access institutional RWA products
            </CardDescription>
          </div>
          {allRequirementsMet ? (
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
              Access Granted
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
              Verification Required
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requirements.map((req) => (
            <div
              key={req.name}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                {req.met ? (
                  <CheckCircle2 className="size-5 text-green-500" />
                ) : (
                  <XCircle className="size-5 text-muted-foreground" />
                )}
                <div>
                  <div className="font-medium">{req.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {req.required ? "Required" : "Optional"}
                  </div>
                </div>
              </div>
              {req.met ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  Verified
                </Badge>
              ) : (
                <Link href="/verify">
                  <Button size="sm" variant="outline">
                    Verify Now
                    <ArrowRight className="size-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          ))}

          {!allRequirementsMet && (
            <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-dashed">
              <p className="text-sm text-muted-foreground">
                Complete all required verifications to access the BUIDL Portal and interact with institutional RWA products.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
