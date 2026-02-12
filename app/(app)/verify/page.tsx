import { ErrorBoundary } from "@/components/error-boundary";
import { VerificationFlow } from "./_components/verification-flow";
import { StepProgressIndicator } from "./_components/step-progress";

export default function VerifyPage() {
  return (
    <ErrorBoundary>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Compliance Verification
          </h1>
          <p className="text-muted-foreground mt-2">
            Verify your compliance attributes using zero-knowledge proofs
          </p>
        </div>

        {/* Step Progress Indicator */}
        <StepProgressIndicator />

        {/* Verification Flow */}
        <VerificationFlow />
      </div>
    </ErrorBoundary>
  );
}
