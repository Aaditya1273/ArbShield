import { Hono } from 'hono'
import { agentManager, walletAddress } from '../setup'
import { SOMNIA_EXCHANGE_V2, DEMO_PAIR } from '../adapters/addresses'
import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import env from '../env'
import { somniaTestnet } from '../utils/chain'
import { getLatestTxHash, setLatestTxHash } from '../utils/tx-store'
import { getAutomationStatus, startAutomation, stopAutomation } from '../utils/automation'

const agentsRouter = new Hono()

/**
 * POST /agents/start/:wallet
 * Start autonomous monitoring for a specific wallet
 */
agentsRouter.post('/start/:wallet', async (c) => {
	try {
		const wallet = c.req.param('wallet')

		if (!wallet || !wallet.startsWith('0x')) {
			return c.json({ error: 'Invalid wallet address' }, 400)
		}

		await agentManager.start(wallet)

		return c.json({
			success: true,
			message: `Autonomous monitoring started for wallet: ${wallet}`,
			status: agentManager.getStatus(),
		})
	} catch (error: any) {
		console.error('[POST /agents/start] Error:', error)
		return c.json({ error: error.message || 'Failed to start agents' }, 500)
	}
})

/**
 * POST /agents/start
 * Start autonomous monitoring for the configured default wallet
 */
agentsRouter.post('/start', async (c) => {
	try {
		await agentManager.start(walletAddress)

		return c.json({
			success: true,
			message: `Autonomous monitoring started for wallet: ${walletAddress}`,
			status: agentManager.getStatus(),
		})
	} catch (error: any) {
		console.error('[POST /agents/start] Error:', error)
		return c.json({ error: error.message || 'Failed to start agents' }, 500)
	}
})

/**
 * POST /agents/stop
 * Stop autonomous monitoring
 */
agentsRouter.post('/stop', (c) => {
	try {
		agentManager.stop()

		return c.json({
			success: true,
			message: 'Autonomous monitoring stopped',
			status: agentManager.getStatus(),
		})
	} catch (error: any) {
		console.error('[POST /agents/stop] Error:', error)
		return c.json({ error: error.message || 'Failed to stop agents' }, 500)
	}
})

/**
 * GET /agents/status
 * Get current agent status
 */
agentsRouter.get('/status', (c) => {
	const status = agentManager.getStatus()

	return c.json({
		...status,
		status: status.isRunning ? 'online' : 'offline',
		message: status.isRunning ? `Monitoring wallet ${status.wallet}` : 'Agents are offline',
	})
})

// Latest adapter tx hash for UI polling
agentsRouter.get('/tx/latest', (c) => {
	return c.json({ txHash: getLatestTxHash() })
})

// Automation controls for UI
agentsRouter.get('/automation/status', (c) => {
	return c.json(getAutomationStatus())
})

agentsRouter.post('/automation/start', async (c) => {
	const body = await c.req.json().catch(() => ({} as any))
	const interval = Number(body?.intervalMinutes)
	const cooldown = Number(body?.cooldownMinutes)
	startAutomation({ interval, cooldown })
	return c.json({ success: true, ...getAutomationStatus() })
})

agentsRouter.post('/automation/stop', (c) => {
	stopAutomation()
	return c.json({ success: true, ...getAutomationStatus() })
})

export { agentsRouter }

// Debug route to trigger a real addLiquidity via Somnia V2 adapter
agentsRouter.post('/execute/deposit', async (c) => {
	try {
		const body = await c.req.json().catch(() => ({} as any))
		const amount0Wei = BigInt(body?.amount0Wei ?? '100000000000000000') // 0.1 wSTT
		const amount1Wei = BigInt(body?.amount1Wei ?? '100000000') // 100 USDC (6 decimals)
		const to = (body?.to as `0x${string}`) || walletAddress

		// Use direct viem calls with explicit nonces to avoid "nonce too low"
		const account = privateKeyToAccount(env.AGENT_PRIVATE_KEY as `0x${string}`)
		const publicClient = createPublicClient({
			chain: somniaTestnet,
			transport: http(env.SOMNIA_RPC_URL),
		})
		const walletClient = createWalletClient({
			chain: somniaTestnet,
			transport: http(env.SOMNIA_RPC_URL),
			account,
		})

		const ERC20_ABI = [
			{
				inputs: [
					{ name: 'spender', type: 'address' },
					{ name: 'amount', type: 'uint256' },
				],
				name: 'approve',
				outputs: [{ name: '', type: 'bool' }],
				stateMutability: 'nonpayable',
				type: 'function',
			},
			{
				inputs: [
					{ name: 'owner', type: 'address' },
					{ name: 'spender', type: 'address' },
				],
				name: 'allowance',
				outputs: [{ name: '', type: 'uint256' }],
				stateMutability: 'view',
				type: 'function',
			},
		] as const

		const ROUTER_ABI = [
			{
				inputs: [
					{ name: 'tokenA', type: 'address' },
					{ name: 'tokenB', type: 'address' },
					{ name: 'amountADesired', type: 'uint256' },
					{ name: 'amountBDesired', type: 'uint256' },
					{ name: 'amountAMin', type: 'uint256' },
					{ name: 'amountBMin', type: 'uint256' },
					{ name: 'to', type: 'address' },
					{ name: 'deadline', type: 'uint256' },
				],
				name: 'addLiquidity',
				outputs: [
					{ name: 'amountA', type: 'uint256' },
					{ name: 'amountB', type: 'uint256' },
					{ name: 'liquidity', type: 'uint256' },
				],
				stateMutability: 'nonpayable',
				type: 'function',
			},
		] as const

		// Establish a clean nonce baseline from latest (committed) to avoid stale pending
		const baseNonce = await publicClient.getTransactionCount({
			address: account.address,
			blockTag: 'latest',
		})

		// Check allowances and only approve if needed
		const [allow0, allow1] = await Promise.all([
			publicClient.readContract({
				address: DEMO_PAIR.TOKEN0,
				abi: ERC20_ABI,
				functionName: 'allowance',
				args: [account.address, SOMNIA_EXCHANGE_V2.ROUTER_V02],
			}) as Promise<bigint>,
			publicClient.readContract({
				address: DEMO_PAIR.TOKEN1,
				abi: ERC20_ABI,
				functionName: 'allowance',
				args: [account.address, SOMNIA_EXCHANGE_V2.ROUTER_V02],
			}) as Promise<bigint>,
		])

		let nextNonce = BigInt(baseNonce)

		if (allow0 < amount0Wei) {
			const hash0 = await walletClient.writeContract({
				address: DEMO_PAIR.TOKEN0,
				abi: ERC20_ABI,
				functionName: 'approve',
				args: [SOMNIA_EXCHANGE_V2.ROUTER_V02, amount0Wei],
				nonce: nextNonce,
			} as any)
			await publicClient.waitForTransactionReceipt({ hash: hash0 })
			nextNonce = nextNonce + 1n
		}

		if (allow1 < amount1Wei) {
			const hash1 = await walletClient.writeContract({
				address: DEMO_PAIR.TOKEN1,
				abi: ERC20_ABI,
				functionName: 'approve',
				args: [SOMNIA_EXCHANGE_V2.ROUTER_V02, amount1Wei],
				nonce: nextNonce,
			} as any)
			await publicClient.waitForTransactionReceipt({ hash: hash1 })
			nextNonce = nextNonce + 1n
		}

		// Add liquidity
		const now = BigInt(Math.floor(Date.now() / 1000))
		// Add liquidity (fetch fresh nonce)
		const txHash = await walletClient.writeContract({
			address: SOMNIA_EXCHANGE_V2.ROUTER_V02,
			abi: ROUTER_ABI,
			functionName: 'addLiquidity',
			args: [
				DEMO_PAIR.TOKEN0,
				DEMO_PAIR.TOKEN1,
				amount0Wei,
				amount1Wei,
				0n,
				0n,
				to || (account.address as `0x${string}`),
				now + 600n,
			],
			nonce: nextNonce,
		} as any)

		// persist tx hash for UI activity feed
		setLatestTxHash(txHash)

		return c.json({ success: true, txHash })
	} catch (error: any) {
		console.error('[POST /agents/execute/deposit] Error:', error)
		return c.json({ success: false, error: error?.message || 'Execution failed' }, 500)
	}
})
