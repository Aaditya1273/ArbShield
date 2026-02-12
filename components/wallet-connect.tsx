'use client'

import { usePrivy } from '@privy-io/react-auth'
import { ExitIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export const WalletConnect = () => {
	const { login, logout, authenticated, user, ready } = usePrivy()

	function handleDisconnect() {
		logout()
	}

	// Wait for Privy to check authentication state
	if (!ready) {
		return <Skeleton className="h-10 w-32 rounded-md" />
	}

	// If authenticated and user exists, show connected state
  if (authenticated && user) {
    const address = typeof user.wallet?.address === 'string' ? user.wallet.address : null
		return (
			<span className="flex items-center gap-x-2 font-medium">
				<span className="hidden md:block">
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
				</span>

				<button onClick={handleDisconnect} type="button" className="cursor-pointer">
					<ExitIcon className="size-4" />
				</button>
			</span>
		)
	}

	// Only show connect button if not authenticated
	return (
		<Button
			onClick={login}
			variant="gradient"
			size="lg"
			className="px-8 py-3 rounded-md text-base font-medium"
		>
			Connect Wallet
		</Button>
	)
}
