"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ExternalLink, Zap } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "Credit Score Verification",
    status: "verified",
    gasUsed: 198543,
    cached: false,
    timestamp: "2 hours ago",
    txHash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f",
  },
  {
    id: 2,
    type: "Accredited Investor Verification",
    status: "verified",
    gasUsed: 45231,
    cached: true,
    timestamp: "1 day ago",
    txHash: "0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g",
  },
  {
    id: 3,
    type: "KYC Verification",
    status: "verified",
    gasUsed: 201234,
    cached: false,
    timestamp: "2 days ago",
    txHash: "0x3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h",
  },
];

export function VerificationActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Verifications</CardTitle>
        <CardDescription>
          Your latest compliance proof verifications on Arbitrum
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <CheckCircle2 className="size-5 text-green-500" />
                </div>
                <div className="space-y-1">
                  <div className="font-medium">{activity.type}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{activity.timestamp}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Zap className="size-3" />
                      {activity.gasUsed.toLocaleString()} gas
                    </span>
                    {activity.cached && (
                      <>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          Cached
                        </Badge>
                      </>
                    )}
                  </div>
                  <a
                    href={`https://sepolia.arbiscan.io/tx/${activity.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    View on Arbiscan
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-green-500/10 text-green-500 border-green-500/20"
              >
                Verified
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
