import { createPublicClient, createWalletClient, http, parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import env from '../env'
import { somniaTestnet } from '../utils/chain'
import type { DepositParams, VenueAdapter, WithdrawParams, PoolState } from './types'

// Minimal ABIs
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
		inputs: [{ name: 'account', type: 'address' }],
		name: 'balanceOf',
		outputs: [{ name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
] as const

// Uniswap V2-like Router ABI (add/remove liquidity)
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
	{
		inputs: [
			{ name: 'tokenA', type: 'address' },
			{ name: 'tokenB', type: 'address' },
			{ name: 'liquidity', type: 'uint256' },
			{ name: 'amountAMin', type: 'uint256' },
			{ name: 'amountBMin', type: 'uint256' },
			{ name: 'to', type: 'address' },
			{ name: 'deadline', type: 'uint256' },
		],
		name: 'removeLiquidity',
		outputs: [
			{ name: 'amountA', type: 'uint256' },
			{ name: 'amountB', type: 'uint256' },
		],
		stateMutability: 'nonpayable',
		type: 'function',
	},
] as const

export interface SomniaV2Config {
	router: `0x${string}`
}

export class SomniaV2Adapter implements VenueAdapter {
	public readonly venueId = 'somnia-v2' as const
	private publicClient = createPublicClient({
		chain: somniaTestnet,
		transport: http(env.SOMNIA_RPC_URL),
	})
	private walletClient = createWalletClient({
		chain: somniaTestnet,
		transport: http(env.SOMNIA_RPC_URL),
		account: privateKeyToAccount(env.AGENT_PRIVATE_KEY as `0x${string}`),
	})

	constructor(private cfg: SomniaV2Config) {}

	async getPoolState(_: { token0: `0x${string}`; token1: `0x${string}` }): Promise<PoolState> {
		// For V2 MVP we skip pool reads; not critical for execution demo
		return {}
	}

	async ensureApprovals({
		token,
		owner,
		spender,
		amount,
	}: {
		token: `0x${string}`
		owner: `0x${string}`
		spender: `0x${string}`
		amount: bigint
	}): Promise<string> {
		const hash = await this.walletClient.writeContract({
			address: token,
			abi: ERC20_ABI,
			functionName: 'approve',
			args: [spender, amount],
		} as any)
		return hash
	}

	async deposit({
		token0,
		token1,
		amount0,
		amount1,
		to,
		deadline,
	}: DepositParams): Promise<{ txHash: `0x${string}` }> {
		const now = BigInt(Math.floor(Date.now() / 1000))
		const hash = await this.walletClient.writeContract({
			address: this.cfg.router,
			abi: ROUTER_ABI,
			functionName: 'addLiquidity',
			args: [token0, token1, amount0, amount1, 0n, 0n, to, deadline ?? now + 600n],
		} as any)
		return { txHash: hash }
	}

	async withdraw({
		token0,
		token1,
		liquidity,
		to,
		deadline,
	}: WithdrawParams): Promise<{ txHash: `0x${string}` }> {
		const now = BigInt(Math.floor(Date.now() / 1000))
		const hash = await this.walletClient.writeContract({
			address: this.cfg.router,
			abi: ROUTER_ABI,
			functionName: 'removeLiquidity',
			args: [token0, token1, liquidity, 0n, 0n, to, deadline ?? now + 600n],
		} as any)
		return { txHash: hash }
	}
}


