import { defineChain } from 'viem'
import env from '../env'

/**
 * Somnia Testnet Chain Configuration
 * Official docs: https://docs.somnia.network/developer/network-info
 */
export const somniaTestnet = defineChain({
	id: 50_312,
	name: 'Somnia Testnet',
	nativeCurrency: {
		decimals: 18,
		name: 'STT',
		symbol: 'STT',
	},
	rpcUrls: {
		default: {
			http: [env.SOMNIA_RPC_URL],
		},
		public: {
			http: ['https://dream-rpc.somnia.network'],
		},
	},
	blockExplorers: {
		default: {
			name: 'Somnia Explorer',
			url: 'https://shannon-explorer.somnia.network',
		},
		alternative: {
			name: 'SocialScan',
			url: 'https://shannon-explorer.somnia.network',
		},
	},
	testnet: true,
})

/**
 * Get chain by ID (for future multi-chain support)
 */
export function getChain(chainId: number) {
	if (chainId === 50_312) return somniaTestnet
	throw new Error(`Chain ${chainId} not supported`)
}
