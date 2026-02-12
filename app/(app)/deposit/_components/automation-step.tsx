'use client'

import { Info } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'
import { CONTRACTS } from '@/lib/contracts'

export function AutomationStep() {
	const router = useRouter()
	const [enabled, setEnabled] = useState(false)
	const [interval, setInterval] = useState(2)
	const [cooldown, setCooldown] = useState(10)
	const [loading, setLoading] = useState(false)
	const { setAutomationCompleted } = useOnboardingStore()

	useEffect(() => {
		fetch('/api/agents/automation/status')
			.then((r) => r.json())
			.then((j) => {
				setEnabled(!!j.enabled)
				if (j.intervalMinutes) setInterval(j.intervalMinutes)
				if (j.cooldownMinutes) setCooldown(j.cooldownMinutes)
			})
			.catch(() => {})
	}, [])

	async function onStart() {
		try {
			setLoading(true)
			// Start agents (hourly loop) first, then enable automation (2-min tick)
			await fetch('/api/agents/start', { method: 'POST' })
			const res = await fetch('/api/agents/automation/start', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					intervalMinutes: interval,
					cooldownMinutes: cooldown,
				}),
			})
			const j = await res.json()
			if (j.success !== false) {
				setEnabled(true)
				setAutomationCompleted(true)
				toast.success('Automation enabled')
				router.push('/dashboard')
			} else {
				toast.error('Failed to enable automation')
			}
		} finally {
			setLoading(false)
		}
	}

	async function onStop() {
		try {
			setLoading(true)
			await fetch('/api/agents/automation/stop', { method: 'POST' })
			await fetch('/api/agents/stop', { method: 'POST' })
			setEnabled(false)
			toast.success('Automation disabled')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Activate AI Automation</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<Alert>
					<Info className="size-4" />
					<AlertDescription>
						Enable AI agents to autonomously manage your liquidity position. The agents
						will continuously monitor market conditions, optimize your range positions,
						and execute rebalancing strategies to maximize your yield. This is the key
						feature that makes LiquidMesh powerful!
						<br />
						<span className="text-xs text-muted-foreground">
							Agent Executor{' '}
							<a
								className="underline"
								href={`https://shannon-explorer.somnia.network/address/${CONTRACTS.AgentExecutor}`}
								target="_blank"
								rel="noreferrer"
							>
								{CONTRACTS.AgentExecutor}
							</a>
						</span>
					</AlertDescription>
				</Alert>

				<div className="grid grid-cols-2 gap-3">
					<div className="space-y-1">
						<Label htmlFor="interval">Interval (minutes)</Label>
						<Input
							id="interval"
							type="number"
							value={interval}
							onChange={(e) => setInterval(Number(e.target.value))}
							min={1}
							disabled={enabled || loading}
						/>
						<p className="text-xs text-muted-foreground">
							How often agents check for opportunities
						</p>
					</div>
					<div className="space-y-1">
						<Label htmlFor="cooldown">Cooldown (minutes)</Label>
						<Input
							id="cooldown"
							type="number"
							value={cooldown}
							onChange={(e) => setCooldown(Number(e.target.value))}
							min={1}
							disabled={enabled || loading}
						/>
						<p className="text-xs text-muted-foreground">
							Minimum time between strategy executions
						</p>
					</div>
				</div>

				<div className="flex gap-2">
					{!enabled ? (
						<Button
							onClick={onStart}
							disabled={loading}
							variant="gradient"
							size="lg"
							className="flex-1 px-8 py-3 rounded-md text-base font-medium"
						>
							{loading ? 'Activating…' : 'Activate Automation'}
						</Button>
					) : (
						<Button
							onClick={onStop}
							disabled={loading}
							variant="outline"
							className="flex-1"
						>
							{loading ? 'Disabling…' : 'Disable Automation'}
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	)
}
