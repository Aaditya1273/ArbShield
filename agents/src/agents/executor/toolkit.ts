import { tool } from 'ai'
import { z } from 'zod'
import { SomniaV2Adapter } from '../../adapters/somnia-exchangev2'
import { SOMNIA_EXCHANGE_V2, DEMO_PAIR } from '../../adapters/addresses'
import { setLatestTxHash } from '../../utils/tx-store'

export function getExecutorToolkit() {
	return {
		simulateTransaction: tool({
			description:
				'Simulate a liquidity transaction to check gas costs and expected outcomes before execution.',
			inputSchema: z.object({
				action: z.string().describe('Action type: rebalance, withdraw, deposit'),
				poolAddress: z.string().describe('Pool contract address'),
				params: z.string().describe('Transaction parameters as JSON string'),
			}),
			execute: async ({
				action,
				poolAddress,
				params,
			}: {
				action: string
				poolAddress: string
				params: string
			}) => {
				console.log('======== simulateTransaction Tool =========')
				console.log(`[simulateTransaction] simulating ${action} on pool ${poolAddress}`)

				// Parse params to extract actual range values
				let parsedParams: any = {}
				try {
					parsedParams = JSON.parse(params)
				} catch {
					parsedParams = { description: params }
				}

				const range = parsedParams.newRange || parsedParams.range || [1.22, 1.28]

				// Mock simulation
				const simulation = {
					success: true,
					estimatedGas: 150000,
					gasCostUSD: 0.75,
					expectedOutcome: 'Position rebalanced successfully',
					newAPY: 38.2,
					newRange: range,
				}

				console.log(`[simulateTransaction] simulation complete`)
				return JSON.stringify(simulation, null, 2)
			},
		}),

		executeTransaction: tool({
			description: 'Execute the liquidity management transaction on Somnia blockchain.',
			inputSchema: z.object({
				action: z.string().describe('Action type: rebalance, withdraw, deposit'),
				poolAddress: z.string().describe('Pool contract address'),
				params: z.string().describe('Transaction parameters as JSON string'),
			}),
			execute: async ({
				action,
				poolAddress,
				params,
			}: {
				action: string
				poolAddress: string
				params: string
			}) => {
				console.log('======== executeTransaction Tool =========')
				console.log(`[executeTransaction] executing ${action} on pool ${poolAddress}`)

				// Parse params to extract actual range values
				let parsedParams: any = {}
				try {
					parsedParams = JSON.parse(params)
				} catch {
					// If parsing fails, params might already be a string description
					parsedParams = { description: params }
				}

				// Extract range from params (strategist passes newRange or range)
				const range = parsedParams.newRange || parsedParams.range || [1.22, 1.28]

				// Real execution path (Somnia Exchange V2 adapter)
				const adapter = new SomniaV2Adapter({ router: SOMNIA_EXCHANGE_V2.ROUTER_V02 })

				// Parse optional amounts from params; default small demo amounts
				const amount0 = BigInt((parsedParams.amount0Wei as string) || '100000000000000000') // 0.1 wSTT
				const amount1 = BigInt((parsedParams.amount1Wei as string) || '100000000') // 100 USDC (6 decimals)
				const to = (parsedParams.to as `0x${string}`) || (DEMO_PAIR.TOKEN0 as `0x${string}`) // fallback to any address; router will transfer to 'to'

				// Approvals for router
				await adapter.ensureApprovals({
					token: DEMO_PAIR.TOKEN0,
					owner: to,
					spender: SOMNIA_EXCHANGE_V2.ROUTER_V02,
					amount: amount0,
				})
				await adapter.ensureApprovals({
					token: DEMO_PAIR.TOKEN1,
					owner: to,
					spender: SOMNIA_EXCHANGE_V2.ROUTER_V02,
					amount: amount1,
				})

				const { txHash } = await adapter.deposit({
					token0: DEMO_PAIR.TOKEN0,
					token1: DEMO_PAIR.TOKEN1,
					amount0,
					amount1,
					to,
					deadline: undefined,
				})

				const result = { success: true, txHash }
				setLatestTxHash(txHash)
				console.log(`[executeTransaction] execution complete: ${txHash}`)
				return JSON.stringify(result, null, 2)
			},
		}),
	}
}
