"use client";

import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { Check } from "lucide-react";

const steps = [
  { id: 1, name: "Passkey Auth", description: "Biometric authentication" },
  { id: 2, name: "Generate Proof", description: "Create ZK proof" },
  { id: 3, name: "Verify", description: "Submit & verify on-chain" },
];

export function StepProgressIndicator() {
  const { currentStep } = useOnboardingStore();

  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-between">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={`relative ${
              stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20 flex-1" : ""
            }`}
          >
            {currentStep > step.id ? (
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="h-0.5 w-full bg-primary" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <Check className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
              </>
            ) : currentStep === step.id ? (
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="h-0.5 w-full bg-muted" />
                </div>
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background"
                  aria-current="step"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                </div>
              </>
            ) : (
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="h-0.5 w-full bg-muted" />
                </div>
                <div className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted bg-background">
                  <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-muted" />
                </div>
              </>
            )}
            <div className="mt-2">
              <span className="text-sm font-medium">{step.name}</span>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
