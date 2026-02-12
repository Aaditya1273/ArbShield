import { ErrorBoundary } from "@/components/error-boundary";
import { ComplianceStats } from "./_components/compliance-stats";
import { VerificationActivity } from "./_components/verification-activity";
import { ComplianceTable } from "./_components/compliance-table";
import { GasBenchmarks } from "./_components/gas-benchmarks";

export default function ComplianceDashboard() {
  return (
    <ErrorBoundary>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Compliance Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Privacy-preserving compliance verification on Arbitrum
          </p>
        </div>

        {/* Stats Overview */}
        <ComplianceStats />

        {/* Gas Benchmarks */}
        <GasBenchmarks />

        {/* Verified Attributes Table */}
        <ComplianceTable />

        {/* Verification Activity Feed */}
        <VerificationActivity />
      </div>
    </ErrorBoundary>
  );
}
