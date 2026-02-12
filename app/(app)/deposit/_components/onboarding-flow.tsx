"use client";

import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { AutomationStep } from "./automation-step";
import { DepositStep } from "./deposit-step";
import { PrepareTokensStep } from "./prepare-tokens-step";

export function OnboardingFlow() {
  const { currentStep } = useOnboardingStore();

  return (
    <div className="max-w-2xl mx-auto">
      {currentStep === 1 && <PrepareTokensStep />}
      {currentStep === 2 && <DepositStep />}
      {currentStep === 3 && <AutomationStep />}
    </div>
  );
}
