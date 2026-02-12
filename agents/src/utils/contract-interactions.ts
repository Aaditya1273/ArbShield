import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { SOMNIA_CONTRACTS } from '../data/somnia-client'
import { LIQUIDITY_VAULT_ABI, AGENT_EXECUTOR_ABI } from './abis'
import { somniaTestnet } from '../utils/chain'
import env from '../env'

/**
 * Contract Interaction Client for Agents
 * Handles real blockchain transactions (not simulation)
 */
export class ContractInteractionClient {
	private publicClient: ReturnType<typeof createPublicClient>
	private walletClient?: ReturnType<typeof createWalletClient>

	constructor() {
		this.publicClient = createPublicClient({
			chain: somniaTestnet,
			transport: http(env.SOMNIA_RPC_URL),
		})

		// Only create wallet client if private key is available
		if (env.AGENT_PRIVATE_KEY) {
			const account = privateKeyToAccount(env.AGENT_PRIVATE_KEY as `0x${string}`)
			this.walletClient = createWalletClient({
				chain: somniaTestnet,
				transport: http(env.SOMNIA_RPC_URL),
				account,
			})
		}
	}

	/**
	 * Propose a strategy for a user
	 * This creates a proposal that can be executed later
	 */
	async proposeStrategy(
		user: string,
		rangeLower: number,
		rangeUpper: number,
		reasoning: string
	): Promise<string> {
		if (!this.walletClient) {
			throw new Error('Agent private key not configured')
		}

		console.log(`[Agent] Proposing strategy for ${user}: ${rangeLower}-${rangeUpper}`)
		console.log(`[Agent] Reasoning: ${reasoning}`)

		try {
			const hash = await this.walletClient!.writeContract({
				address: SOMNIA_CONTRACTS.AgentExecutor,
				abi: AGENT_EXECUTOR_ABI,
				functionName: 'proposeStrategy',
				args: [user as `0x${string}`, BigInt(rangeLower), BigInt(rangeUpper), reasoning],
			} as any)

			console.log(`[Agent] Strategy proposal submitted: ${hash}`)
			return hash
		} catch (error) {
			console.error('[Agent] Failed to propose strategy:', error)
			throw error
		}
	}

	/**
	 * Execute a proposal
	 * This actually updates the user's position
	 */
	async executeProposal(proposalId: number): Promise<string> {
		if (!this.walletClient) {
			throw new Error('Agent private key not configured')
		}

		console.log(`[Agent] Executing proposal ${proposalId}`)

		try {
			const hash = await this.walletClient!.writeContract({
				address: SOMNIA_CONTRACTS.AgentExecutor,
				abi: AGENT_EXECUTOR_ABI,
				functionName: 'executeProposal',
				args: [BigInt(proposalId)],
			} as any)

			console.log(`[Agent] Proposal executed: ${hash}`)
			return hash
		} catch (error) {
			console.error('[Agent] Failed to execute proposal:', error)
			throw error
		}
	}

	/**
	 * Update a user's position directly
	 * This bypasses the proposal system for direct execution
	 */
	async updatePosition(user: string, rangeLower: number, rangeUpper: number): Promise<string> {
		if (!this.walletClient) {
			throw new Error('Agent private key not configured')
		}

		console.log(`[Agent] Updating position for ${user}: ${rangeLower}-${rangeUpper}`)

		try {
			const hash = await this.walletClient!.writeContract({
				address: SOMNIA_CONTRACTS.LiquidityVault,
				abi: LIQUIDITY_VAULT_ABI,
				functionName: 'updatePosition',
				args: [user as `0x${string}`, BigInt(rangeLower), BigInt(rangeUpper)],
			} as any)

			console.log(`[Agent] Position updated: ${hash}`)
			return hash
		} catch (error) {
			console.error('[Agent] Failed to update position:', error)
			throw error
		}
	}

	/**
	 * Get user's current position
	 */
	async getUserPosition(user: string) {
		try {
			const position = await this.publicClient.readContract({
				address: SOMNIA_CONTRACTS.LiquidityVault,
				abi: LIQUIDITY_VAULT_ABI,
				functionName: 'getPosition',
				args: [user as `0x${string}`],
			})

			return {
				wsttAmount: position[0],
				usdcAmount: position[1],
				lpTokens: position[2],
				rangeLower: position[3],
				rangeUpper: position[4],
				feesEarnedWSTT: position[5],
				feesEarnedUSDC: position[6],
				depositTime: position[7],
				lastFeeUpdate: position[8],
				active: position[9],
			}
		} catch (error) {
			console.error(`[Agent] Failed to get position for ${user}:`, error)
			return null
		}
	}

	/**
	 * Get all active users
	 */
	async getActiveUsers(): Promise<string[]> {
		try {
			const users = await this.publicClient.readContract({
				address: SOMNIA_CONTRACTS.LiquidityVault,
				abi: LIQUIDITY_VAULT_ABI,
				functionName: 'getActiveUsers',
			})

			return users as string[]
		} catch (error) {
			console.error('[Agent] Failed to get active users:', error)
			return []
		}
	}

	/**
	 * Get user's pending proposals
	 */
	async getUserPendingProposals(user: string) {
		try {
			const proposals = await this.publicClient.readContract({
				address: SOMNIA_CONTRACTS.AgentExecutor,
				abi: AGENT_EXECUTOR_ABI,
				functionName: 'getUserPendingProposals',
				args: [user as `0x${string}`],
			})

			return proposals
		} catch (error) {
			console.error(`[Agent] Failed to get pending proposals for ${user}:`, error)
			return []
		}
	}

	/**
	 * Get proposal count
	 */
	async getProposalCount(): Promise<number> {
		try {
			const count = await this.publicClient.readContract({
				address: SOMNIA_CONTRACTS.AgentExecutor,
				abi: AGENT_EXECUTOR_ABI,
				functionName: 'getProposalCount',
			})

			return Number(count)
		} catch (error) {
			console.error('[Agent] Failed to get proposal count:', error)
			return 0
		}
	}
}

export const contractClient = new ContractInteractionClient()
