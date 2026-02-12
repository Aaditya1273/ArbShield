import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'

const config: HardhatUserConfig = {
	solidity: '0.8.28',
	networks: {
		somnia: {
			url: 'https://dream-rpc.somnia.network',
			accounts: process.env.SOMNIA_PRIVATE_KEY ? [process.env.SOMNIA_PRIVATE_KEY] : [],
		},
	},
	sourcify: {
		enabled: false,
	},
	etherscan: {
		apiKey: {
			somnia: 'empty',
		},
		customChains: [
			{
				network: 'somnia',
				chainId: 50312,
				urls: {
					apiURL: 'https://shannon-explorer.somnia.network/api',
					browserURL: 'https://shannon-explorer.somnia.network',
				},
			},
		],
	},
}

export default config
