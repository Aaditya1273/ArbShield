"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ExternalLink } from "lucide-react";

const verifiedAttributes = [
  {
    attribute: "Credit Score Range",
    type: "credit_score",
    verified: true,
    timestamp: "2025-02-12 14:30:00",
    proofHash: "0x1a2b3c4d...",
    txHash: "0xabcd1234...",
  },
  {
    attribute: "Accredited Investor",
    type: "accredited_investor",
    verified: true,
    timestamp: "2025-02-11 09:15:00",
    proofHash: "0x5e6f7g8h...",
    txHash: "0xefgh5678...",
  },
  {
    attribute: "KYC Verified",
    type: "kyc_verified",
    verified: true,
    timestamp: "2025-02-10 16:45:00",
    proofHash: "0x9i0j1k2l...",
    txHash: "0xijkl9012...",
  },
];

export function ComplianceTable() {
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
          {verifiedAttributes.map((item) => (
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
                <a
                  href={`https://sepolia.arbiscan.io/tx/${item.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 text-sm"
                >
                  View
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
