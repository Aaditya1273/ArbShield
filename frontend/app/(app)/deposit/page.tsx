import { ErrorBoundary } from '@/components/error-boundary'
import { AutomationStep } from './_components/automation-step'
import { DepositStep } from './_components/deposit-step'
import { OnboardingFlow } from './_components/onboarding-flow'
import { PrepareTokensStep } from './_components/prepare-tokens-step'
import { StepProgressIndicator } from './_components/step-progress'

export default function DepositPage() {
	return (
		<ErrorBoundary>
			<div className="space-y-8">
				{/* Step Progress Indicator */}
				<StepProgressIndicator />

				{/* Onboarding Flow */}
				<OnboardingFlow />
			</div>
		</ErrorBoundary>
	)
}
