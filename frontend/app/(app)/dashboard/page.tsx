import { ErrorBoundary } from '@/components/error-boundary'
import { DashboardRouteGuard } from './_components/route-guard'
import { AgentActivity } from './_components/agent-activity'
import { AgentControl } from './_components/agent-control'
import { PositionsTable } from './_components/positions-table'
import { StatsCards } from './_components/stats-cards'

export default function Dashboard() {
	return (
		<ErrorBoundary>
			<DashboardRouteGuard />
			<div className="space-y-8">
				{/* Header */}
				<div>
					<h1 className="text-3xl font-bold tracking-tight">LiquidMesh Dashboard</h1>
					<p className="text-muted-foreground mt-2">
						AI-powered autonomous liquidity management on Somnia
					</p>
				</div>

				{/* Agent Control */}
				<AgentControl />

				{/* Stats Overview */}
				<StatsCards />

				{/* Positions Table */}
				<PositionsTable />

				{/* Agent Activity Feed */}
				<AgentActivity />
			</div>
		</ErrorBoundary>
	)
}
