import env from '../env'
import { executorAgent, walletAddress } from '../setup'
import { getLatestTxAtMs, setLatestTxHash } from './tx-store'
import { SomniaV2Adapter } from '../adapters/somnia-exchangev2'
import { SOMNIA_EXCHANGE_V2, DEMO_PAIR } from '../adapters/addresses'

let timer: NodeJS.Timeout | null = null
let enabled = false
let intervalMinutes = env.STRATEGY_INTERVAL_MINUTES
let cooldownMinutes = env.STRATEGY_COOLDOWN_MINUTES

export function getAutomationStatus() {
	return {
		enabled,
		intervalMinutes,
		cooldownMinutes,
		lastTxAt: getLatestTxAtMs(),
	}
}

export function stopAutomation() {
	if (timer) {
		clearInterval(timer)
		timer = null
	}
	enabled = false
}

export function startAutomation({
	interval,
	cooldown,
}: { interval?: number; cooldown?: number } = {}) {
	if (interval && interval > 0) intervalMinutes = interval
	if (cooldown && cooldown > 0) cooldownMinutes = cooldown

	if (timer) {
		clearInterval(timer)
		timer = null
	}

	enabled = true
	const intervalMs = intervalMinutes * 60 * 1000
	const cooldownMs = cooldownMinutes * 60 * 1000

	timer = setInterval(async () => {
		try {
			const lastAt = getLatestTxAtMs()
			if (lastAt && Date.now() - lastAt < cooldownMs) return

			// Execute adapter directly (bypass LLM) for reliability
			const adapter = new SomniaV2Adapter({ router: SOMNIA_EXCHANGE_V2.ROUTER_V02 })
			const { txHash } = await adapter.deposit({
				token0: DEMO_PAIR.TOKEN0,
				token1: DEMO_PAIR.TOKEN1,
				amount0: BigInt('50000000000000000'), // 0.05 wSTT
				amount1: BigInt('50000000'), // 50 USDC
				to: walletAddress,
				deadline: undefined,
			})
			setLatestTxHash(txHash)
		} catch (e) {
			console.error('[automation] tick error', e)
		}
	}, intervalMs)
}
