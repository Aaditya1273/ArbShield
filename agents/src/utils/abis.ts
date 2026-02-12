/**
 * Contract ABIs for LiquidMesh contracts
 */

// WrappedSTT ABI - https://shannon-explorer.somnia.network/address/0x9e1B4FbB45F30b0628e4C406A6F4Eec1fadb54E1#code
export const WRAPPED_STT_ABI = [
	{
		inputs: [],
		name: 'deposit',
		outputs: [],
		stateMutability: 'payable',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
		name: 'withdraw',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
		name: 'balanceOf',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'symbol',
		outputs: [{ internalType: 'string', name: '', type: 'string' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'decimals',
		outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: 'address', name: 'account', type: 'address' },
			{ indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
		],
		name: 'Deposit',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: 'address', name: 'account', type: 'address' },
			{ indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
		],
		name: 'Withdrawal',
		type: 'event',
	},
] as const

// MockUSDC ABI - https://shannon-explorer.somnia.network/address/0x758dA18F8424f637f788a0CD0DAF8407069D380b#code
export const MOCK_USDC_ABI = [
	{
		inputs: [
			{ internalType: 'address', name: 'to', type: 'address' },
			{ internalType: 'uint256', name: 'amount', type: 'uint256' },
		],
		name: 'mint',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
		name: 'balanceOf',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'symbol',
		outputs: [{ internalType: 'string', name: '', type: 'string' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'decimals',
		outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
		stateMutability: 'view',
		type: 'function',
	},
] as const

// LiquidityVault ABI - https://shannon-explorer.somnia.network/address/0x28205BB97e1BEe146E0b095D3cf62433D9bAb47d#code
export const LIQUIDITY_VAULT_ABI = [
	{
		inputs: [
			{ internalType: 'uint256', name: '_wsttAmount', type: 'uint256' },
			{ internalType: 'uint256', name: '_usdcAmount', type: 'uint256' },
		],
		name: 'depositPair',
		outputs: [{ internalType: 'uint256', name: 'lpTokens', type: 'uint256' }],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'uint256', name: '_lpTokens', type: 'uint256' }],
		name: 'withdraw',
		outputs: [
			{ internalType: 'uint256', name: '_wsttAmount', type: 'uint256' },
			{ internalType: 'uint256', name: '_usdcAmount', type: 'uint256' },
		],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
		name: 'accrueFees',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'claimFees',
		outputs: [
			{ internalType: 'uint256', name: 'claimedWSTT', type: 'uint256' },
			{ internalType: 'uint256', name: 'claimedUSDC', type: 'uint256' },
		],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'address', name: 'user', type: 'address' },
			{ internalType: 'uint256', name: 'newLower', type: 'uint256' },
			{ internalType: 'uint256', name: 'newUpper', type: 'uint256' },
		],
		name: 'updatePosition',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
		name: 'getPosition',
		outputs: [
			{ internalType: 'uint256', name: 'wsttAmount', type: 'uint256' },
			{ internalType: 'uint256', name: 'usdcAmount', type: 'uint256' },
			{ internalType: 'uint256', name: 'lpTokens', type: 'uint256' },
			{ internalType: 'uint256', name: 'rangeLower', type: 'uint256' },
			{ internalType: 'uint256', name: 'rangeUpper', type: 'uint256' },
			{ internalType: 'uint256', name: 'feesEarnedWSTT', type: 'uint256' },
			{ internalType: 'uint256', name: 'feesEarnedUSDC', type: 'uint256' },
			{ internalType: 'uint256', name: 'depositTime', type: 'uint256' },
			{ internalType: 'uint256', name: 'lastFeeUpdate', type: 'uint256' },
			{ internalType: 'bool', name: 'active', type: 'bool' },
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
		name: 'getPortfolioValue',
		outputs: [{ internalType: 'uint256', name: 'totalValueUSDC', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'getActiveUsers',
		outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: 'address', name: 'user', type: 'address' },
			{ indexed: false, internalType: 'uint256', name: 'wsttAmount', type: 'uint256' },
			{ indexed: false, internalType: 'uint256', name: 'usdcAmount', type: 'uint256' },
			{ indexed: false, internalType: 'uint256', name: 'lpTokens', type: 'uint256' },
		],
		name: 'DepositPair',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: 'address', name: 'user', type: 'address' },
			{ indexed: false, internalType: 'uint256', name: 'wsttAmount', type: 'uint256' },
			{ indexed: false, internalType: 'uint256', name: 'usdcAmount', type: 'uint256' },
			{ indexed: false, internalType: 'uint256', name: 'lpTokens', type: 'uint256' },
		],
		name: 'Withdraw',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: 'address', name: 'user', type: 'address' },
			{ indexed: false, internalType: 'uint256', name: 'rangeLower', type: 'uint256' },
			{ indexed: false, internalType: 'uint256', name: 'rangeUpper', type: 'uint256' },
		],
		name: 'PositionUpdated',
		type: 'event',
	},
] as const

// AgentExecutor ABI - https://shannon-explorer.somnia.network/address/0x5e639e2F345577514aFA0159AEdDf0A832e4139f#code
export const AGENT_EXECUTOR_ABI = [
	{
		inputs: [
			{ internalType: 'address', name: 'user', type: 'address' },
			{ internalType: 'uint256', name: 'rangeLower', type: 'uint256' },
			{ internalType: 'uint256', name: 'rangeUpper', type: 'uint256' },
			{ internalType: 'string', name: 'reasoning', type: 'string' },
		],
		name: 'proposeStrategy',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'uint256', name: 'proposalId', type: 'uint256' }],
		name: 'executeProposal',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'address', name: 'agent', type: 'address' }],
		name: 'authorizeAgent',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'address', name: 'agent', type: 'address' }],
		name: 'revokeAgent',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'uint256', name: 'proposalId', type: 'uint256' }],
		name: 'getProposal',
		outputs: [
			{ internalType: 'address', name: 'user', type: 'address' },
			{ internalType: 'uint256', name: 'rangeLower', type: 'uint256' },
			{ internalType: 'uint256', name: 'rangeUpper', type: 'uint256' },
			{ internalType: 'string', name: 'reasoning', type: 'string' },
			{ internalType: 'uint256', name: 'timestamp', type: 'uint256' },
			{ internalType: 'bool', name: 'executed', type: 'bool' },
			{ internalType: 'address', name: 'proposer', type: 'address' },
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'getProposalCount',
		outputs: [{ internalType: 'uint256', name: 'count', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
		name: 'getUserPendingProposals',
		outputs: [
			{
				components: [
					{ internalType: 'address', name: 'user', type: 'address' },
					{ internalType: 'uint256', name: 'rangeLower', type: 'uint256' },
					{ internalType: 'uint256', name: 'rangeUpper', type: 'uint256' },
					{ internalType: 'string', name: 'reasoning', type: 'string' },
					{ internalType: 'uint256', name: 'timestamp', type: 'uint256' },
					{ internalType: 'bool', name: 'executed', type: 'bool' },
					{ internalType: 'address', name: 'proposer', type: 'address' },
				],
				internalType: 'struct AgentExecutor.StrategyProposal[]',
				name: '',
				type: 'tuple[]',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: 'uint256', name: 'proposalId', type: 'uint256' },
			{ indexed: true, internalType: 'address', name: 'user', type: 'address' },
			{ indexed: false, internalType: 'uint256', name: 'rangeLower', type: 'uint256' },
			{ indexed: false, internalType: 'uint256', name: 'rangeUpper', type: 'uint256' },
			{ indexed: false, internalType: 'string', name: 'reasoning', type: 'string' },
			{ indexed: false, internalType: 'address', name: 'proposer', type: 'address' },
		],
		name: 'ProposalCreated',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: 'uint256', name: 'proposalId', type: 'uint256' },
			{ indexed: true, internalType: 'address', name: 'executor', type: 'address' },
		],
		name: 'ProposalExecuted',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [{ indexed: true, internalType: 'address', name: 'agent', type: 'address' }],
		name: 'AgentAuthorized',
		type: 'event',
	},
] as const
