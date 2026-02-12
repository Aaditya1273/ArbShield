'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider } from '@privy-io/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { env } from '@/env'
import { getDefaultChain, supportedChains, wagmiConfig } from '@/lib/config'

const queryClient = new QueryClient()

export const Providers = ({ children }: { children: ReactNode }) => {
	return (
		<PrivyProvider
			appId={env.NEXT_PUBLIC_PRIVY_APP_ID}
			config={{
				embeddedWallets: {
					ethereum: {
						createOnLogin: 'users-without-wallets',
					},
				},
				defaultChain: getDefaultChain(),
				supportedChains,
			}}
		>
			<QueryClientProvider client={queryClient}>
				<WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
			</QueryClientProvider>
		</PrivyProvider>
	)
}
