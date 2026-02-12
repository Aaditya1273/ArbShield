import type { WatcherAgent } from './watcher'
import { contractClient } from '../utils/contract-interactions'
import env from '../env'

/**
 * Agent State Manager
 * Controls agent lifecycle: start, stop, status
 */
export class AgentManager {
	private isRunning = false
	private currentWallet?: string
	private intervalId?: NodeJS.Timeout
	private cycleCount = 0

	constructor(private watcherAgent: WatcherAgent) {}

	/**
	 * Start autonomous monitoring for a wallet
	 */
	async start(walletAddress: string): Promise<void> {
		if (this.isRunning) {
			console.log(`[AgentManager] Already monitoring wallet: ${this.currentWallet}`)
			return
		}

		this.isRunning = true
		this.currentWallet = walletAddress
		this.cycleCount = 0

		console.log(`[AgentManager] 🚀 Starting autonomous monitoring for wallet: ${walletAddress}`)
		console.log(`[AgentManager] Check interval: ${env.CHECK_INTERVAL_HOURS} hours`)

		// Run first cycle immediately
		await this.runCycle()

		// Schedule periodic checks
		this.scheduleNextCheck()
	}

	/**
	 * Stop autonomous monitoring
	 */
	stop(): void {
		if (!this.isRunning) {
			console.log('[AgentManager] Not currently running')
			return
		}

		console.log(
			`[AgentManager] 🛑 Stopping autonomous monitoring for wallet: ${this.currentWallet}`
		)

		if (this.intervalId) {
			clearTimeout(this.intervalId)
			this.intervalId = undefined
		}

		this.isRunning = false
		this.currentWallet = undefined
		this.cycleCount = 0
	}

	/**
	 * Get current agent status
	 */
	getStatus() {
		return {
			isRunning: this.isRunning,
			wallet: this.currentWallet || null,
			cycleCount: this.cycleCount,
			checkIntervalHours: env.CHECK_INTERVAL_HOURS,
			nextCheckIn: this.isRunning ? `${env.CHECK_INTERVAL_HOURS} hours` : null,
			lastCycle: this.cycleCount > 0 ? new Date().toISOString() : null,
		}
	}

	/**
	 * Run a single analysis cycle
	 */
	private async runCycle(): Promise<void> {
		if (!this.currentWallet || !this.isRunning) return

		this.cycleCount++
		console.log(
			`[AgentManager] 🔄 Running cycle #${this.cycleCount} for wallet: ${this.currentWallet}`
		)

		try {
			// Run watcher agent
			await this.watcherAgent.start(this.currentWallet)

			// Check for contract interactions
			await this.checkContractInteractions()
		} catch (error) {
			console.error(`[AgentManager] Error in cycle #${this.cycleCount}:`, error)
		}
	}

	/**
	 * Check for contract interactions and execute strategies
	 */
	private async checkContractInteractions(): Promise<void> {
		if (!this.currentWallet) return

		try {
			// Get user's position
			const position = await contractClient.getUserPosition(this.currentWallet)
			if (!position || !position.active) {
				console.log(`[AgentManager] No active position for ${this.currentWallet}`)
				return
			}

			console.log(`[AgentManager] Position found: ${position.lpTokens} LP tokens`)

			// Check for pending proposals
			const pendingProposals = await contractClient.getUserPendingProposals(
				this.currentWallet
			)
			if (pendingProposals.length > 0) {
				console.log(`[AgentManager] Found ${pendingProposals.length} pending proposals`)

				// Execute the first pending proposal
				const proposal = pendingProposals[0]
				console.log(`[AgentManager] Executing proposal: ${proposal.reasoning}`)

				// Note: In a real implementation, you'd need the proposal ID
				// For now, we'll just log it
				console.log(
					`[AgentManager] Would execute proposal with range: ${proposal.rangeLower}-${proposal.rangeUpper}`
				)
			}

			// Example: Propose a new strategy if conditions are met
			// This is where the AI would analyze market conditions and propose adjustments
			const shouldProposeStrategy = this.shouldProposeStrategy(position)
			if (shouldProposeStrategy) {
				console.log(`[AgentManager] Proposing new strategy for ${this.currentWallet}`)

				// Example strategy: adjust range based on current position
				const newRangeLower = Math.max(1, Number(position.rangeLower) - 100)
				const newRangeUpper = Number(position.rangeUpper) + 100

				try {
					await contractClient.proposeStrategy(
						this.currentWallet,
						newRangeLower,
						newRangeUpper,
						'Market volatility detected, adjusting range for optimal fees'
					)
				} catch (error) {
					console.error('[AgentManager] Failed to propose strategy:', error)
				}
			}
		} catch (error) {
			console.error('[AgentManager] Error checking contract interactions:', error)
		}
	}

	/**
	 * Determine if we should propose a new strategy
	 * This is where AI logic would go
	 */
	private shouldProposeStrategy(position: any): boolean {
		// Simple heuristic: propose if position is older than 1 hour
		const oneHourAgo = Date.now() - 60 * 60 * 1000
		return Number(position.lastFeeUpdate) < oneHourAgo
	}

	/**
	 * Schedule next check based on configured interval
	 */
	private scheduleNextCheck(): void {
		if (!this.isRunning) return

		const intervalMs = env.CHECK_INTERVAL_HOURS * 60 * 60 * 1000

		console.log(`[AgentManager] ⏰ Next check scheduled in ${env.CHECK_INTERVAL_HOURS} hours`)

		this.intervalId = setTimeout(async () => {
			await this.runCycle()
			this.scheduleNextCheck() // Schedule next one
		}, intervalMs)
	}
}
