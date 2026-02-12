import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import env from '../env'
import { somniaTestnet } from '../utils/chain'
import type { DepositParams, VenueAdapter, WithdrawParams, PoolState } from './types'

// Placeholder adapter for QuickSwap on Somnia (if/when deployed)
// Interfaces mirror Uniswap V3-style position manager.

export interface QuickSwapConfig {
  factory?: `0x${string}`
  positionManager?: `0x${string}`
  router?: `0x${string}`
}

export class QuickSwapV3Adapter implements VenueAdapter {
  public readonly venueId = 'quickswap-v3' as const
  private publicClient = createPublicClient({ chain: somniaTestnet, transport: http(env.SOMNIA_RPC_URL) })
  private walletClient = createWalletClient({
    chain: somniaTestnet,
    transport: http(env.SOMNIA_RPC_URL),
    account: privateKeyToAccount(env.AGENT_PRIVATE_KEY as `0x${string}`),
  })

  constructor(private cfg: QuickSwapConfig = {}) {}

  async getPoolState(_: { token0: `0x${string}`; token1: `0x${string}` }): Promise<PoolState> {
    return {}
  }

  async ensureApprovals(_: { token: `0x${string}`; owner: `0x${string}`; spender: `0x${string}`; amount: bigint }): Promise<string> {
    return '0x' as `0x${string}`
  }

  async deposit(_: DepositParams): Promise<{ txHash: `0x${string}` }> {
    return { txHash: '0x' as `0x${string}` }
  }

  async withdraw(_: WithdrawParams): Promise<{ txHash: `0x${string}` }> {
    return { txHash: '0x' as `0x${string}` }
  }
}
