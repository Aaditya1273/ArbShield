"use client";

import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { PasskeyAuthStep } from "./passkey-auth-step";
import { GenerateProofStep } from "./generate-proof-step";
import { VerifyProofStep } from "./verify-proof-step";

export function VerificationFlow() {
  const { currentStep } = useOnboardingStore();

  return (
    <div className="mx-auto max-w-4xl">
      {currentStep === 1 && <PasskeyAuthStep />}
      {currentStep === 2 && <GenerateProofStep />}
      {currentStep === 3 && <VerifyProofStep />}
    </div>
  );
}
