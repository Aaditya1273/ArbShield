import { ErrorBoundary } from "@/components/error-boundary";
import { NetworkStats } from "./_components/network-stats";
import { GasComparison } from "./_components/gas-comparison";
import { TechStack } from "./_components/tech-stack";
import { VerificationChart } from "./_components/verification-chart";

export default function AnalyticsPage() {
  return (
    <ErrorBoundary>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analytics & Proof of Tech
          </h1>
          <p className="text-muted-foreground mt-2">
            Network-wide statistics and technical benchmarks
          </p>
        </div>

        {/* Network Stats */}
        <NetworkStats />

        {/* Verification Chart */}
        <VerificationChart />

        {/* Gas Comparison */}
        <GasComparison />

        {/* Tech Stack */}
        <TechStack />
      </div>
    </ErrorBoundary>
  );
}
