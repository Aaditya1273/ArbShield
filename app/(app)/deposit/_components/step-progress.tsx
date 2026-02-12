"use client";

import { Check } from "lucide-react";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
}

const steps: Step[] = [
  { id: 1, title: "Faucet" },
  { id: 2, title: "Deposit" },
  { id: 3, title: "Activate" },
];

export function StepProgressIndicator() {
  const { currentStep, completedSteps, setCurrentStep } = useOnboardingStore();

  function getStepStatus(stepId: number) {
    if (completedSteps.includes(stepId)) return "completed";
    if (currentStep === stepId) return "current";
    return "upcoming";
  }

  function handleStepClick(stepId: number) {
    const status = getStepStatus(stepId);
    // Allow clicking on completed steps to go back
    if (status === "completed") {
      setCurrentStep(stepId);
    }
  }

  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      {steps.map((step, index) => {
        const status = getStepStatus(step.id);
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => handleStepClick(step.id)}
                disabled={status === "upcoming"}
                className={cn(
                  "flex items-center justify-center size-10 rounded-full border-2 transition-all",
                  status === "completed" &&
                    "bg-gradient-to-r from-[#34A4FF] via-[#6D6BFF] to-[#A855FF] border-transparent cursor-pointer hover:brightness-110",
                  status === "current" &&
                    "bg-gradient-to-r from-[#34A4FF] via-[#6D6BFF] to-[#A855FF] border-transparent ring-4 ring-[#6D6BFF]/20",
                  status === "upcoming" &&
                    "bg-background border-muted-foreground/30 cursor-not-allowed",
                )}
              >
                {status === "completed" ? (
                  <Check className="size-5 text-white" />
                ) : (
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      status === "current"
                        ? "text-white"
                        : "text-muted-foreground",
                    )}
                  >
                    {step.id}
                  </span>
                )}
              </button>
              <span
                className={cn(
                  "mt-2 text-sm font-medium",
                  status === "current"
                    ? "text-foreground"
                    : status === "completed"
                      ? "text-foreground"
                      : "text-muted-foreground",
                )}
              >
                {step.title}
              </span>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div
                className={cn(
                  "mx-4 h-0.5 w-16 transition-all",
                  completedSteps.includes(step.id)
                    ? "bg-gradient-to-r from-[#34A4FF] via-[#6D6BFF] to-[#A855FF]"
                    : "bg-muted-foreground/20",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
