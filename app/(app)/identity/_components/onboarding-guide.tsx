"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { useAccount } from "wagmi";
import { useComplianceData } from "@/lib/hooks/useComplianceData";
import { hasPasskey } from "@/lib/webauthn";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function OnboardingGuide() {
  const router = useRouter();
  const { address } = useAccount();
  const { verifiedAttributes } = useComplianceData();
  const [passkeyRegistered, setPasskeyRegistered] = useState(false);

  useEffect(() => {
    if (address) {
      setPasskeyRegistered(hasPasskey(address));
    }
  }, [address]);

  const steps = [
    {
      title: "Connect Wallet",
      description: "Connect your wallet to Arbitrum Sepolia",
      completed: !!address,
      action: null,
    },
    {
      title: "Register Passkey",
      description: "Set up biometric authentication",
      completed: passkeyRegistered,
      action: null, // Handled in PasskeyManager above
    },
    {
      title: "Verify Compliance",
      description: "Complete your first ZK proof verification",
      completed: verifiedAttributes.length > 0,
      action: () => router.push("/verify"),
    },
    {
      title: "Access BUIDL Portal",
      description: "Start interacting with institutional RWAs",
      completed: verifiedAttributes.length >= 2,
      action: () => router.push("/portal"),
    },
  ];

  const completedSteps = steps.filter((s) => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Getting Started</CardTitle>
        <CardDescription>
          Complete these steps to unlock full ArbShield functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {completedSteps} / {steps.length} completed
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                {step.completed ? (
                  <CheckCircle2 className="size-5 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="size-5 text-muted-foreground flex-shrink-0" />
                )}
                <div>
                  <div className="font-medium">{step.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {step.description}
                  </div>
                </div>
              </div>
              {!step.completed && step.action && (
                <Button size="sm" variant="outline" onClick={step.action}>
                  Start
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Completion Message */}
        {completedSteps === steps.length && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 text-green-500 font-medium mb-1">
              <CheckCircle2 className="size-5" />
              All Set!
            </div>
            <p className="text-sm text-muted-foreground">
              You've completed onboarding and can now access all ArbShield features.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
