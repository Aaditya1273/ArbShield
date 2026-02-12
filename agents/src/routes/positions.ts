import { Hono } from 'hono'
import { realPoolDataProvider } from '../data'
import type { Environment } from '../env'

const positionsRouter = new Hono<Environment>()

positionsRouter.get('/', async (c) => {
	// For now, positions are empty since we don't have real position data yet
	// This will be populated when users actually deposit into our contracts
	const positions: any[] = []
	return c.json({ positions })
})

positionsRouter.get('/pools', async (c) => {
	const pools = await realPoolDataProvider.getRealPoolMetrics()
	return c.json({ pools })
})

export { positionsRouter }
