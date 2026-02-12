// Somnia Exchange (V2) – Testnet addresses (from Somnia Exchange docs)
// Source: https://somniaexchange.gitbook.io/nia/dex-smart-contacts

export const SOMNIA_EXCHANGE_V2 = {
	FACTORY: '0x31015A978c5815EdE29D0F969a17e116BC1866B1' as `0x${string}`,
	ROUTER_V02: '0xb98c15a0dC1e271132e341250703c7e94c059e8D' as `0x${string}`,
	WSTT: '0xF22eF0085f6511f70b01a68F360dCc56261F768a' as `0x${string}`,
} as const

// Curated demo pair (we use our deployed tokens by default)
export const DEMO_PAIR = {
	TOKEN0: '0x9e1B4FbB45F30b0628e4C406A6F4Eec1fadb54E1' as `0x${string}`, // WrappedSTT (our deployment)
	TOKEN1: '0x758dA18F8424f637f788a0CD0DAF8407069D380b' as `0x${string}`, // MockUSDC (our deployment)
	VENUE: 'somnia-v2' as const,
}


