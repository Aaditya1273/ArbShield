"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ExternalLink, Zap, AlertCircle } from "lucide-react";
import { useVerificationHistory } from "@/lib/hooks/useVerificationHistory";

const ATTRIBUTE_NAMES: Record<string, string> = {
  credit_score: "Credit Score Verification",
  accredited_investor: "Accredited Investor Verification",
  kyc_verified: "KYC Verification",
  us_person: "US Person Status Verification",
  age_verification: "Age Verification",
};

export function VerificationActivity() {
  const { events, loading } = useVerificationHistory();

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Verifications</CardTitle>
          <CardDescription>
            Your latest compliance proof verifications on Arbitrum
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Loading verification history...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Verifications</CardTitle>
          <CardDescription>
            Your latest compliance proof verifications on Arbitrum
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="size-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No verification history yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Complete your first verification to see activity here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
          {events.slice(0, 10).map((activity) => (
            <div
              key={activity.txHash}
              className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <CheckCircle2 className="size-5 text-green-500" />
                </div>
                <div className="space-y-1">
                  <div className="font-medium">
                    {ATTRIBUTE_NAMES[activity.attributeType] || activity.attributeType}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{formatTimestamp(activity.timestamp)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Zap className="size-3" />
                      {Number(activity.gasUsed).toLocaleString()} gas
                    </span>
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
