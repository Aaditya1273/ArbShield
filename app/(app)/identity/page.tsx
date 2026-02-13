import { ErrorBoundary } from "@/components/error-boundary";
import { PasskeyManager } from "./_components/passkey-manager";
import { UserProfile } from "./_components/user-profile";
import { OnboardingGuide } from "./_components/onboarding-guide";

export default function IdentityPage() {
  return (
    <ErrorBoundary>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Identity & Onboarding
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your biometric authentication and user profile
          </p>
        </div>

        {/* User Profile */}
        <UserProfile />

        {/* Passkey Manager */}
        <PasskeyManager />

        {/* Onboarding Guide */}
        <OnboardingGuide />
      </div>
    </ErrorBoundary>
  );
}
