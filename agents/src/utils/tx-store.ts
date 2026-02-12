let latestTxHash: string | null = null
let latestTxAtMs: number | null = null

export function setLatestTxHash(hash: string): void {
	latestTxHash = hash
	latestTxAtMs = Date.now()
}

export function getLatestTxHash(): string | null {
	return latestTxHash
}

export function getLatestTxAtMs(): number | null {
	return latestTxAtMs
}
