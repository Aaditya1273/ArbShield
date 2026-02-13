"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ExternalLink, AlertCircle } from "lucide-react";
import { useComplianceData } from "@/lib/hooks/useComplianceData";
import { useVerificationHistory } from "@/lib/hooks/useVerificationHistory";

const ATTRIBUTE_NAMES: Record<string, string> = {
  credit_score: "Credit Score Range",
  accredited_investor: "Accredited Investor",
  kyc_verified: "KYC Verified",
  us_person: "US Person Status",
  age_verification: "Age Verification",
};

export function ComplianceTable() {
  const { verifiedAttributes, loading } = useComplianceData();
  const { events } = useVerificationHistory();

  // Match attributes with their verification events
  const attributesWithDetails = verifiedAttributes.map((attr) => {
    const event = events.find((e) => e.attributeType === attr.attributeType);
    return {
      attribute: ATTRIBUTE_NAMES[attr.attributeType] || attr.attributeType,
      type: attr.attributeType,
      verified: true,
      timestamp: event ? new Date(event.timestamp * 1000).toLocaleString() : new Date(attr.timestamp).toLocaleString(),
      proofHash: event ? `${event.proofHash.slice(0, 10)}...` : "N/A",
      txHash: event?.txHash || "",
    };
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verified Attributes</CardTitle>
          <CardDescription>
            Your privacy-preserving compliance verifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (attributesWithDetails.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verified Attributes</CardTitle>
          <CardDescription>
            Your privacy-preserving compliance verifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="size-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No verified attributes yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Complete the verification flow to add compliance attributes
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verified Attributes</CardTitle>
        <CardDescription>
          Your privacy-preserving compliance verifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {attributesWithDetails.map((item) => (
            <div
              key={item.type}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="flex items-center gap-4">
                <CheckCircle2 className="size-5 text-green-500" />
                <div>
                  <div className="font-medium">{item.attribute}</div>
                  <div className="text-sm text-muted-foreground">
                    Verified: {item.timestamp}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  Active
                </Badge>
                {item.txHash && (
                  <a
                    href={`https://sepolia.arbiscan.io/tx/${item.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 text-sm"
                  >
                    View
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
