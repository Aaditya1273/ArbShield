import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import env from '../env'
import { somniaTestnet } from '../utils/chain'
import type { DepositParams, VenueAdapter, WithdrawParams, PoolState } from './types'

// Placeholder adapter for Somnex (concentrated liquidity, V3-style)
// Factory/Router addresses are not yet published for Somnia testnet.
// This adapter implements the VenueAdapter interface to document integration shape
// and can be wired post-hackathon once official endpoints are available.

export interface SomnexConfig {
  factory?: `0x${string}`
  positionManager?: `0x${string}`
  router?: `0x${string}`
}

export class SomnexV3Adapter implements VenueAdapter {
  public readonly venueId = 'somnex-v3' as const
  private publicClient = createPublicClient({ chain: somniaTestnet, transport: http(env.SOMNIA_RPC_URL) })
  private walletClient = createWalletClient({
    chain: somniaTestnet,
    transport: http(env.SOMNIA_RPC_URL),
    account: privateKeyToAccount(env.AGENT_PRIVATE_KEY as `0x${string}`),
  })

  constructor(private cfg: SomnexConfig = {}) {}

  async getPoolState(_: { token0: `0x${string}`; token1: `0x${string}` }): Promise<PoolState> {
    // TODO: Query Somnex subgraph or on-chain pool state when available
    return {}
  }

  async ensureApprovals(_: { token: `0x${string}`; owner: `0x${string}`; spender: `0x${string}`; amount: bigint }): Promise<string> {
    // TODO: Approve position manager/router once addresses are known
    // Returning a dummy tx hash-like value for documentation/demo purposes.
    return '0x' as `0x${string}`
  }

  async deposit(_: DepositParams): Promise<{ txHash: `0x${string}` }> {
    // TODO: Mint position via NonfungiblePositionManager when addresses are known
    return { txHash: '0x' as `0x${string}` }
  }

  async withdraw(_: WithdrawParams): Promise<{ txHash: `0x${string}` }> {
    // TODO: Decrease liquidity and collect via position manager
    return { txHash: '0x' as `0x${string}` }
  }
}
