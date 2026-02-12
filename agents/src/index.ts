import { app } from './app'
import env from './env'
import { agentManager, walletAddress } from './setup'

console.log('╔════════════════════════════════════════════════════════╗')
console.log('║       LIQUIDMESH AGENTS API                            ║')
console.log('╚════════════════════════════════════════════════════════╝')
console.log(`[🚀] Server starting on port ${env.PORT}`)
console.log(`[📍] Wallet address: ${walletAddress}`)
console.log(`[⚙️] Check interval: ${env.CHECK_INTERVAL_HOURS} hours`)
console.log(`[🤖] Auto-start: ${env.AUTO_START}`)

// Auto-start agents if configured
if (env.AUTO_START === 'true') {
	console.log(`[✅] AUTO_START enabled - Starting autonomous monitoring...`)
	agentManager.start(walletAddress)
} else {
	console.log(`[⏸️] AUTO_START disabled - Agents idle. Use POST /agents/start to begin.`)
}

export default {
	port: env.PORT || 8000,
	fetch: app.fetch,
	development: true,
	// Increase timeout for AI agent processing
	// Agents can take 30-60s to fetch data, analyze, and reason
	idleTimeout: 120, // 2 minutes
}
