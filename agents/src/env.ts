import { z } from 'zod'

const envSchema = z.object({
	PORT: z.coerce.number().default(8000),
	SUPABASE_URL: z.string(),
	SUPABASE_KEY: z.string(),
	PRIVATE_KEY: z.string(),
	AGENT_PRIVATE_KEY: z.string().optional(), // Agent wallet for contract interactions
	OPENAI_API_KEY: z.string(),
	SOMNIA_RPC_URL: z.string().default('https://dream-rpc.somnia.network'),
	CHAIN_ID: z.string().default('50312'),
	CHAIN_NAME: z.string().default('somnia-testnet'),
	MODEL_NAME: z.string().default('gpt-4o'),
	AUTO_START: z.string().default('false'), // Don't auto-start on deploy
	CHECK_INTERVAL_HOURS: z.coerce.number().default(2), // Check every 2 hours
	STRATEGY_AUTOMATION_ENABLED: z.string().default('false'),
	STRATEGY_INTERVAL_MINUTES: z.coerce.number().default(2),
	STRATEGY_COOLDOWN_MINUTES: z.coerce.number().default(10),
})

export const env = envSchema.parse(process.env)

export type Environment = {
	Bindings: z.infer<typeof envSchema>
}

export default env
