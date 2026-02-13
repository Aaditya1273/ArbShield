import { ErrorBoundary } from "@/components/error-boundary";
import { PortalAccess } from "./_components/portal-access";
import { PortalStats } from "./_components/portal-stats";
import { PortalActions } from "./_components/portal-actions";

export default function PortalPage() {
  return (
    <ErrorBoundary>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            BUIDL Portal
          </h1>
          <p className="text-muted-foreground mt-2">
            Access institutional RWA products with verified compliance
          </p>
        </div>

        {/* Access Check */}
        <PortalAccess />

        {/* Portal Stats */}
        <PortalStats />

        {/* Portal Actions */}
        <PortalActions />
      </div>
    </ErrorBoundary>
  );
}
